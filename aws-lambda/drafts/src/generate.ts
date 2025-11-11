import * as admin from 'firebase-admin';
import { generateSections } from './openai';
import {
  buildContext,
  buildFullPrompt,
  postProcessContent,
  validateContent,
} from './prompts';
import { Template } from '@stenographer/shared/types/template';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

export interface GenerateDraftRequest {
  matterId: string;
  templateId: string;
  fileIds: string[];
  variables: Record<string, any>;
  userId: string;
}

export interface GenerateDraftResult {
  draftId: string;
  sections: {
    facts: string;
    liability: string;
    damages: string;
    demand: string;
  };
}

/**
 * Fetch template from Firestore
 */
async function fetchTemplate(templateId: string): Promise<Template> {
  const templateRef = db.collection('templates').doc(templateId);
  const templateDoc = await templateRef.get();

  if (!templateDoc.exists) {
    throw new Error(`Template ${templateId} not found`);
  }

  const data = templateDoc.data()!;
  return {
    templateId: templateDoc.id,
    name: data.name,
    description: data.description,
    sections: data.sections,
    variables: data.variables || [],
    createdBy: data.createdBy,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    isActive: data.isActive !== undefined ? data.isActive : true,
  };
}

/**
 * Fetch source files and extract text
 */
async function fetchSourceTexts(
  matterId: string,
  fileIds: string[]
): Promise<string[]> {
  const texts: string[] = [];

  for (const fileId of fileIds) {
    const fileRef = db
      .collection('matters')
      .doc(matterId)
      .collection('files')
      .doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      console.warn(`File ${fileId} not found, skipping`);
      continue;
    }

    const fileData = fileDoc.data()!;

    // Use OCR text if available, otherwise use filename as placeholder
    if (fileData.ocrText && fileData.ocrStatus === 'done') {
      texts.push(`[File: ${fileData.name}]\n${fileData.ocrText}`);
    } else if (fileData.type === 'txt') {
      // For TXT files, we might have the content stored
      // For now, just use the filename
      texts.push(`[File: ${fileData.name} - Content not extracted]`);
    } else {
      texts.push(`[File: ${fileData.name} - OCR pending or unavailable]`);
    }
  }

  return texts;
}

/**
 * Generate a draft from template and source files
 */
export async function generateDraft(
  request: GenerateDraftRequest
): Promise<GenerateDraftResult> {
  const { matterId, templateId, fileIds, variables, userId } = request;

  try {
    // Fetch template
    const template = await fetchTemplate(templateId);

    // Fetch source texts
    const sourceTexts = await fetchSourceTexts(matterId, fileIds);

    if (sourceTexts.length === 0) {
      throw new Error('No source files with extracted text available');
    }

    // Build context from source files
    const context = buildContext(sourceTexts);

    // Create draft document in Firestore (with generating state)
    const draftRef = db.collection('drafts').doc();
    const draftId = draftRef.id;

    await draftRef.set({
      draftId,
      matterId,
      templateId,
      state: 'generating',
      sections: {
        facts: { content: '', generatedAt: null },
        liability: { content: '', generatedAt: null },
        damages: { content: '', generatedAt: null },
        demand: { content: '', generatedAt: null },
      },
      variables,
      generatedBy: userId,
      lastGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastEditedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastEditedBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Generate sections sequentially
    const sectionsToGenerate = [
      {
        name: 'facts',
        prompt: buildFullPrompt(template.sections.facts, variables, context),
        context,
        temperature: 0.7,
        maxTokens: 2000,
      },
      {
        name: 'liability',
        prompt: buildFullPrompt(template.sections.liability, variables, context),
        context,
        temperature: 0.7,
        maxTokens: 2000,
      },
      {
        name: 'damages',
        prompt: buildFullPrompt(template.sections.damages, variables, context),
        context,
        temperature: 0.7,
        maxTokens: 2000,
      },
      {
        name: 'demand',
        prompt: buildFullPrompt(template.sections.demand, variables, context),
        context,
        temperature: 0.7,
        maxTokens: 2000,
      },
    ];

    const results = await generateSections(sectionsToGenerate);

    // Process and validate results
    const processedSections: Record<string, string> = {};

    for (const { name, result } of results) {
      let content = postProcessContent(result.content);

      if (!validateContent(content)) {
        console.warn(`Generated content for ${name} section failed validation`);
        content = `[Content generation for ${name} section encountered an issue. Please regenerate this section.]`;
      }

      processedSections[name] = content;
    }

    // Update draft with generated content
    await draftRef.update({
      state: 'editing',
      sections: {
        facts: {
          content: processedSections.facts,
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        liability: {
          content: processedSections.liability,
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        damages: {
          content: processedSections.damages,
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        demand: {
          content: processedSections.demand,
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      draftId,
      sections: {
        facts: processedSections.facts,
        liability: processedSections.liability,
        damages: processedSections.damages,
        demand: processedSections.demand,
      },
    };
  } catch (error: any) {
    console.error('Draft generation error:', error);

    // Try to update draft status to failed if we have a draftId
    try {
      const draftRef = db.collection('drafts').doc();
      await draftRef.set({
        state: 'editing', // Set to editing so user can see the error
        sections: {
          facts: {
            content: `[Error: ${error.message}]`,
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          liability: { content: '', generatedAt: null },
          damages: { content: '', generatedAt: null },
          demand: { content: '', generatedAt: null },
        },
        error: error.message,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (updateError) {
      console.error('Failed to update draft with error:', updateError);
    }

    throw error;
  }
}

