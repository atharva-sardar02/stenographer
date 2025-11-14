"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDraft = generateDraft;
exports.refineSection = refineSection;
const admin = __importStar(require("firebase-admin"));
const storage_1 = require("firebase-admin/storage");
const functions = __importStar(require("firebase-functions/v1"));
const mammoth_1 = __importDefault(require("mammoth"));
const openai_1 = require("./openai");
const prompts_1 = require("./prompts");
// Use Firebase Functions logger for better log visibility
const logger = functions.logger;
// Lazy initialization of Firestore
function getDb() {
    return admin.firestore();
}
/**
 * Fetch template from Firestore
 */
async function fetchTemplate(templateId) {
    const templateRef = getDb().collection('templates').doc(templateId);
    const templateDoc = await templateRef.get();
    if (!templateDoc.exists) {
        throw new Error(`Template ${templateId} not found`);
    }
    const data = templateDoc.data();
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
 * Only includes files with extractable text (txt files or OCR'd PDF/images)
 */
async function fetchSourceTexts(matterId, fileIds) {
    const texts = [];
    let skippedFiles = [];
    for (const fileId of fileIds) {
        const fileRef = getDb()
            .collection('matters')
            .doc(matterId)
            .collection('files')
            .doc(fileId);
        const fileDoc = await fileRef.get();
        if (!fileDoc.exists) {
            console.warn(`[Drafts] File ${fileId} not found, skipping`);
            skippedFiles.push(fileId);
            continue;
        }
        const fileData = fileDoc.data();
        // For text files, extract content directly from Storage
        if (fileData.type === 'txt') {
            try {
                console.log(`[Drafts] Processing TXT file`, { fileName: fileData.name, storagePath: fileData.storagePath, fileId });
                logger.info(`[Drafts] Processing TXT file`, { fileName: fileData.name, storagePath: fileData.storagePath, fileId });
                const storage = (0, storage_1.getStorage)();
                const bucket = storage.bucket();
                const file = bucket.file(fileData.storagePath);
                // Check if file exists
                const [exists] = await file.exists();
                console.log(`[Drafts] File exists check`, { fileName: fileData.name, exists, storagePath: fileData.storagePath });
                logger.info(`[Drafts] File exists check`, { fileName: fileData.name, exists, storagePath: fileData.storagePath });
                if (!exists) {
                    logger.error(`[Drafts] File not found in Storage`, { storagePath: fileData.storagePath, fileName: fileData.name });
                    skippedFiles.push(fileData.name);
                    continue;
                }
                // Download and read text content
                logger.info(`[Drafts] Downloading file from Storage`, { storagePath: fileData.storagePath });
                const [buffer] = await file.download();
                const textContent = buffer.toString('utf-8');
                console.log(`[Drafts] Downloaded TXT file`, {
                    fileName: fileData.name,
                    bufferLength: buffer.length,
                    textLength: textContent.length,
                    first100Chars: textContent.substring(0, 100)
                });
                logger.info(`[Drafts] Downloaded TXT file`, {
                    fileName: fileData.name,
                    bufferLength: buffer.length,
                    textLength: textContent.length,
                    first100Chars: textContent.substring(0, 100)
                });
                // Update file document with extracted text
                await fileRef.update({
                    ocrText: textContent,
                    ocrStatus: 'done',
                    ocrPages: 1,
                    ocrConfidence: 100,
                });
                if (!textContent || textContent.trim().length === 0) {
                    logger.warn(`[Drafts] TXT file is empty or contains no text`, { fileName: fileData.name });
                    skippedFiles.push(fileData.name);
                }
                else {
                    // Add file content directly - no extra formatting that might confuse the LLM
                    texts.push(textContent);
                    logger.info(`[Drafts] ✓ Extracted text from TXT file`, {
                        fileName: fileData.name,
                        textLength: textContent.length,
                        preview: textContent.substring(0, 500),
                        addedToTexts: true
                    });
                }
            }
            catch (error) {
                logger.error(`[Drafts] ✗ Error extracting text from TXT file`, { fileName: fileData.name, error: error.message, stack: error.stack });
                skippedFiles.push(fileData.name);
            }
        }
        else if (fileData.type === 'docx') {
            // For DOCX files, extract text using mammoth
            try {
                console.log(`[Drafts] Processing DOCX file: ${fileData.name}, storagePath: ${fileData.storagePath}`);
                const storage = (0, storage_1.getStorage)();
                const bucket = storage.bucket();
                const file = bucket.file(fileData.storagePath);
                // Check if file exists
                const [exists] = await file.exists();
                if (!exists) {
                    console.error(`[Drafts] File not found in Storage: ${fileData.storagePath}`);
                    skippedFiles.push(fileData.name);
                    continue;
                }
                // Download DOCX file
                console.log(`[Drafts] Downloading DOCX file from Storage: ${fileData.storagePath}`);
                const [buffer] = await file.download();
                console.log(`[Drafts] Downloaded DOCX file, size: ${buffer.length} bytes`);
                // Extract text from DOCX using mammoth
                const result = await mammoth_1.default.extractRawText({ buffer });
                const textContent = result.value;
                console.log(`[Drafts] Extracted text from DOCX, length: ${textContent.length} chars`);
                // Update file document with extracted text
                await fileRef.update({
                    ocrText: textContent,
                    ocrStatus: 'done',
                    ocrPages: 1,
                    ocrConfidence: 100,
                });
                if (!textContent || textContent.trim().length === 0) {
                    console.warn(`[Drafts] DOCX file ${fileData.name} is empty or contains no text`);
                    skippedFiles.push(fileData.name);
                }
                else {
                    const fileText = `[File: ${fileData.name}]\n${textContent}`;
                    texts.push(fileText);
                    console.log(`[Drafts] ✓ Extracted text from DOCX file: ${fileData.name}, length: ${textContent.length} chars`);
                    console.log(`[Drafts] DOCX file preview (first 300 chars): ${textContent.substring(0, 300)}...`);
                }
            }
            catch (error) {
                console.error(`[Drafts] ✗ Error extracting text from DOCX file ${fileData.name}:`, error.message);
                console.error(`[Drafts] Error stack:`, error.stack);
                skippedFiles.push(fileData.name);
            }
        }
        else if (fileData.ocrText && fileData.ocrStatus === 'done') {
            // Use OCR text if available for PDF/image files
            texts.push(fileData.ocrText); // Add OCR text directly, no extra formatting
            logger.info(`[Drafts] Using OCR text from file`, { fileName: fileData.name, textLength: fileData.ocrText.length });
        }
        else {
            // OCR not available or not done - skip this file
            console.warn(`[Drafts] Skipping file ${fileData.name} - OCR not completed (user must click Extract Text)`);
            skippedFiles.push(fileData.name);
        }
    }
    logger.info(`[Drafts] File extraction complete`, { extracted: texts.length, skipped: skippedFiles.length, skippedFiles });
    if (texts.length > 0) {
        texts.forEach((text, idx) => {
            logger.info(`[Drafts] Extracted text ${idx + 1}`, { length: text.length });
        });
    }
    else {
        logger.error(`[Drafts] WARNING: No texts extracted! This will cause generation to fail.`);
    }
    return texts;
}
/**
 * Generate a draft from template and source files
 */
async function generateDraft(request) {
    const { matterId, templateId, fileIds, variables, userId } = request;
    // Log at the very start - use both console.log and logger for visibility
    console.log(`[generateDraft] ===== STARTING DRAFT GENERATION =====`, { matterId, templateId, fileIds, userId });
    logger.info(`[generateDraft] ===== STARTING DRAFT GENERATION =====`, { matterId, templateId, fileIds, userId });
    // Get draftId from request or create new one
    let draftId = '';
    let draftRef = null;
    try {
        // Find or create draft document
        // If draftId is provided in request, use it; otherwise create new
        if (request.draftId) {
            draftId = request.draftId;
            draftRef = getDb().collection('drafts').doc(draftId);
            // Verify draft exists
            const draftDoc = await draftRef.get();
            if (!draftDoc.exists) {
                throw new Error(`Draft ${draftId} not found`);
            }
        }
        else {
            // Create new draft document (with generating state)
            draftRef = getDb().collection('drafts').doc();
            draftId = draftRef.id;
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
        }
        // Fetch template
        logger.info(`[generateDraft] Fetching template`, { templateId });
        const template = await fetchTemplate(templateId);
        // Fetch source texts
        logger.info(`[generateDraft] Fetching source texts`, { fileCount: fileIds.length, fileIds });
        const sourceTexts = await fetchSourceTexts(matterId, fileIds);
        logger.info(`[generateDraft] Source texts array length`, { length: sourceTexts.length });
        sourceTexts.forEach((text, index) => {
            logger.info(`[generateDraft] Source text ${index + 1}`, { length: text.length, preview: text.substring(0, 200) });
        });
        if (sourceTexts.length === 0) {
            const errorMsg = 'No source files with extractable text available. Please upload .txt files or run OCR on PDF/image files.';
            logger.error(`[generateDraft] ${errorMsg}`);
            throw new Error(errorMsg);
        }
        // Validate that we have actual content
        const hasContent = sourceTexts.some(text => text && text.trim().length > 0);
        if (!hasContent) {
            const errorMsg = 'Source files were found but contain no extractable text content.';
            logger.error(`[generateDraft] ${errorMsg}`);
            throw new Error(errorMsg);
        }
        logger.info(`[generateDraft] Successfully extracted text`, { fileCount: sourceTexts.length });
        // Build context from source files
        logger.info(`[generateDraft] Building context from source texts`);
        const context = (0, prompts_1.buildContext)(sourceTexts);
        logger.info(`[generateDraft] ✓ Context built successfully`, {
            contextLength: context.length,
            preview: context.substring(0, 300)
        });
        // Validate context before proceeding
        if (!context || context.trim().length < 50) {
            logger.error(`[generateDraft] ✗ Context validation failed`, {
                contextLength: context ? context.length : 0,
                isEmpty: !context || context.trim().length === 0
            });
            throw new Error('Insufficient content in source files. Context must be at least 50 characters.');
        }
        logger.info(`[generateDraft] ✓ Context validated`, { contextLength: context.length });
        // Generate sections in parallel for speed
        logger.info(`[generateDraft] Starting parallel section generation`, {
            contextLength: context.length,
            contextPreview: context.substring(0, 200)
        });
        const sectionsToGenerate = [
            {
                name: 'facts',
                prompt: (0, prompts_1.buildFullPrompt)(template.sections.facts, variables, context),
                context,
                temperature: 0.7,
                maxTokens: 2000,
            },
            {
                name: 'liability',
                prompt: (0, prompts_1.buildFullPrompt)(template.sections.liability, variables, context),
                context,
                temperature: 0.7,
                maxTokens: 2000,
            },
            {
                name: 'damages',
                prompt: (0, prompts_1.buildFullPrompt)(template.sections.damages, variables, context),
                context,
                temperature: 0.7,
                maxTokens: 2000,
            },
            {
                name: 'demand',
                prompt: (0, prompts_1.buildFullPrompt)(template.sections.demand, variables, context),
                context,
                temperature: 0.7,
                maxTokens: 2000,
            },
        ];
        // Log each section's prompt details
        sectionsToGenerate.forEach((section) => {
            logger.info(`[generateDraft] Section ${section.name}`, {
                promptLength: section.prompt.length,
                contextLength: section.context.length,
                promptPreview: section.prompt.substring(0, 200)
            });
        });
        const results = await (0, openai_1.generateSections)(sectionsToGenerate);
        logger.info(`[generateDraft] Section generation complete`);
        // Process and validate results
        const processedSections = {};
        for (const { name, result } of results) {
            logger.info(`[generateDraft] Processing section`, { section: name, tokensUsed: result.tokensUsed });
            let content = (0, prompts_1.postProcessContent)(result.content);
            if (!(0, prompts_1.validateContent)(content)) {
                logger.warn(`[generateDraft] Generated content failed validation`, { section: name });
                content = `[Content generation for ${name} section encountered an issue. Please regenerate this section.]`;
            }
            processedSections[name] = content;
        }
        logger.info(`[generateDraft] Updating draft document with generated content`);
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
        logger.info(`[generateDraft] Draft generation successful`, { draftId });
        return {
            draftId,
            sections: {
                facts: processedSections.facts,
                liability: processedSections.liability,
                damages: processedSections.damages,
                demand: processedSections.demand,
            },
        };
    }
    catch (error) {
        logger.error('[generateDraft] Error', { error: error.message, stack: error.stack, draftId });
        // Update draft status to show error if we have a draftId
        try {
            if (draftRef) {
                logger.info(`[generateDraft] Updating draft with error state`, { draftId: draftId || 'unknown' });
                await draftRef.update({
                    state: 'editing', // Set to editing so user can see the error
                    error: error.message || 'Unknown error occurred during draft generation',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }
        catch (updateError) {
            logger.error('[generateDraft] Failed to update draft with error', { updateError });
        }
        throw error;
    }
}
/**
 * Refine a specific section of a draft
 */
async function refineSection(draftId, section, instruction, keepExistingContent, userId) {
    try {
        // Fetch draft
        const draftRef = getDb().collection('drafts').doc(draftId);
        const draftDoc = await draftRef.get();
        if (!draftDoc.exists) {
            throw new Error(`Draft ${draftId} not found`);
        }
        const draftData = draftDoc.data();
        // Fetch template
        if (!draftData.templateId) {
            throw new Error('Draft has no associated template');
        }
        const template = await fetchTemplate(draftData.templateId);
        // Get existing section content
        const existingContent = draftData.sections[section]?.content || '';
        // Fetch source texts for context
        const sourceTexts = await fetchSourceTexts(draftData.matterId, []);
        const context = (0, prompts_1.buildContext)(sourceTexts);
        // Build refined prompt
        const sectionTemplate = template.sections[section];
        const basePrompt = (0, prompts_1.buildFullPrompt)(sectionTemplate, draftData.variables || {}, context);
        let refinedPrompt;
        if (keepExistingContent) {
            refinedPrompt = `${basePrompt}

Existing Content:
${existingContent}

User Instruction: ${instruction}

Please expand and improve the existing content based on the user's instruction. Keep the structure and key points, but add more detail and refinement as requested.`;
        }
        else {
            refinedPrompt = `${basePrompt}

Previous Content (for reference only):
${existingContent}

User Instruction: ${instruction}

Please rewrite this section completely based on the user's instruction. Generate new content that addresses the instruction while maintaining professional legal writing standards.`;
        }
        // Generate refined content
        const { generateSection } = require('./openai');
        const result = await generateSection({
            prompt: refinedPrompt,
            context,
            temperature: 0.7,
            maxTokens: 2000,
        });
        // Process and validate
        let content = (0, prompts_1.postProcessContent)(result.content);
        if (!(0, prompts_1.validateContent)(content)) {
            console.warn(`Refined content for ${section} section failed validation`);
            content =
                existingContent ||
                    `[Content refinement for ${section} section encountered an issue. Please try again.]`;
        }
        // Update draft section
        await draftRef.update({
            [`sections.${section}.content`]: content,
            [`sections.${section}.generatedAt`]: admin.firestore.FieldValue.serverTimestamp(),
            lastEditedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastEditedBy: userId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            state: 'editing',
        });
        return content;
    }
    catch (error) {
        console.error('Section refinement error:', error);
        throw error;
    }
}
//# sourceMappingURL=drafts.js.map