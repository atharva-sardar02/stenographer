import * as admin from 'firebase-admin';
import { generateSection } from './openai';
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

export interface RefineSectionRequest {
  draftId: string;
  section: 'facts' | 'liability' | 'damages' | 'demand';
  instruction: string;
  keepExistingContent: boolean;
  userId: string;
}

export interface RefineSectionResult {
  content: string;
  tokensUsed: number;
}

/**
 * Fetch draft from Firestore
 */
async function fetchDraft(draftId: string) {
  const draftRef = db.collection('drafts').doc(draftId);
  const draftDoc = await draftRef.get();

  if (!draftDoc.exists) {
    throw new Error(`Draft ${draftId} not found`);
  }

  return draftDoc;
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
 * Fetch source files and extract text for context
 */
async function fetchSourceTexts(
  matterId: string,
  fileIds?: string[]
): Promise<string[]> {
  const texts: string[] = [];

  let filesQuery = db
    .collection('matters')
    .doc(matterId)
    .collection('files');

  if (fileIds && fileIds.length > 0) {
    // If specific file IDs provided, fetch only those
    for (const fileId of fileIds) {
      const fileRef = filesQuery.doc(fileId);
      const fileDoc = await fileRef.get();

      if (fileDoc.exists) {
        const fileData = fileDoc.data()!;
        if (fileData.ocrText && fileData.ocrStatus === 'done') {
          texts.push(`[File: ${fileData.name}]\n${fileData.ocrText}`);
        }
      }
    }
  } else {
    // Fetch all files with OCR text
    const filesSnapshot = await filesQuery.get();
    filesSnapshot.forEach((fileDoc) => {
      const fileData = fileDoc.data();
      if (fileData.ocrText && fileData.ocrStatus === 'done') {
        texts.push(`[File: ${fileData.name}]\n${fileData.ocrText}`);
      }
    });
  }

  return texts;
}

/**
 * Refine a specific section of a draft
 */
export async function refineSection(
  request: RefineSectionRequest
): Promise<RefineSectionResult> {
  const { draftId, section, instruction, keepExistingContent, userId } = request;

  try {
    // Fetch draft
    const draftDoc = await fetchDraft(draftId);
    const draftData = draftDoc.data()!;

    // Fetch template
    if (!draftData.templateId) {
      throw new Error('Draft has no associated template');
    }
    const template = await fetchTemplate(draftData.templateId);

    // Get existing section content
    const existingContent = draftData.sections[section]?.content || '';

    // Fetch source texts for context
    const sourceTexts = await fetchSourceTexts(draftData.matterId);
    const context = buildContext(sourceTexts);

    // Build refined prompt
    const sectionTemplate = template.sections[section];
    const basePrompt = buildSectionPrompt(
      sectionTemplate,
      draftData.variables || {}
    );

    let refinedPrompt: string;
    if (keepExistingContent) {
      refinedPrompt = `${basePrompt}

Existing Content:
${existingContent}

User Instruction: ${instruction}

Please expand and improve the existing content based on the user's instruction. Keep the structure and key points, but add more detail and refinement as requested.`;
    } else {
      refinedPrompt = `${basePrompt}

Previous Content (for reference only):
${existingContent}

User Instruction: ${instruction}

Please rewrite this section completely based on the user's instruction. Generate new content that addresses the instruction while maintaining professional legal writing standards.`;
    }

    // Generate refined content
    const result = await generateSection({
      prompt: refinedPrompt,
      context,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Process and validate
    let content = postProcessContent(result.content);

    if (!validateContent(content)) {
      console.warn(`Refined content for ${section} section failed validation`);
      content = existingContent || `[Content refinement for ${section} section encountered an issue. Please try again.]`;
    }

    // Update draft section
    const draftRef = db.collection('drafts').doc(draftId);
    await draftRef.update({
      [`sections.${section}.content`]: content,
      [`sections.${section}.generatedAt`]: admin.firestore.FieldValue.serverTimestamp(),
      lastEditedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastEditedBy: userId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      state: 'editing',
    });

    // Track refinement in collaboration history (if subcollection exists)
    try {
      const collaborationRef = draftRef.collection('collaboration').doc();
      await collaborationRef.set({
        type: 'refinement',
        section,
        instruction,
        keepExistingContent,
        performedBy: userId,
        performedAt: admin.firestore.FieldValue.serverTimestamp(),
        previousContent: existingContent,
        newContent: content,
      });
    } catch (collabError) {
      // Collaboration tracking is optional, don't fail if it errors
      console.warn('Failed to track refinement in collaboration history:', collabError);
    }

    return {
      content,
      tokensUsed: result.tokensUsed,
    };
  } catch (error: any) {
    console.error('Section refinement error:', error);
    throw error;
  }
}

/**
 * Helper function to build section prompt (extracted from prompts.ts logic)
 */
function buildSectionPrompt(
  section: { prompt: string; content: string },
  variables: Record<string, any>
): string {
  let prompt = section.prompt;

  // Replace variables in prompt
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    prompt = prompt.replace(regex, String(value));
  }

  return prompt;
}

