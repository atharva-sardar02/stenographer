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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContext = buildContext;
exports.buildSectionPrompt = buildSectionPrompt;
exports.buildFullPrompt = buildFullPrompt;
exports.postProcessContent = postProcessContent;
exports.validateContent = validateContent;
const functions = __importStar(require("firebase-functions/v1"));
// Use Firebase Functions logger for better log visibility
const logger = functions.logger;
/**
 * Build the base context from source files
 */
function buildContext(sourceTexts) {
    // Filter out empty texts and log what we're working with
    const validTexts = sourceTexts.filter((text) => text && text.trim().length > 0);
    logger.info(`[buildContext] Building context`, {
        inputTexts: sourceTexts.length,
        validTexts: validTexts.length,
        textLengths: validTexts.map(t => t.length),
        totalLength: validTexts.reduce((sum, t) => sum + t.length, 0)
    });
    // Log preview of each text
    validTexts.forEach((text, idx) => {
        logger.info(`[buildContext] Text ${idx + 1}`, {
            length: text.length,
            preview: text.substring(0, 200)
        });
    });
    if (validTexts.length === 0) {
        logger.error('[buildContext] WARNING: No valid texts to build context from!');
        throw new Error('No extractable text found in source files. Please ensure files contain text content.');
    }
    // Join texts with clear separator
    const combinedText = validTexts.join('\n\n========== NEXT DOCUMENT ==========\n\n');
    logger.info(`[buildContext] Built context`, {
        contextLength: combinedText.length,
        numDocuments: validTexts.length,
        preview: combinedText.substring(0, 500)
    });
    // Validate context is not empty
    if (combinedText.trim().length === 0) {
        logger.error('[buildContext] ERROR: Context is empty after building!');
        throw new Error('No extractable text found in source files');
    }
    return combinedText;
}
/**
 * Build a section prompt from template section and variables
 */
function buildSectionPrompt(section, variables) {
    let prompt = section.prompt;
    // Replace variables in prompt
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        prompt = prompt.replace(regex, String(value));
    }
    return prompt;
}
/**
 * Build the full prompt for a section
 * NOTE: Context is now included directly in the prompt for clarity
 */
function buildFullPrompt(section, variables, context) {
    const sectionPrompt = buildSectionPrompt(section, variables);
    const defaultContent = section.content || '';
    // Replace variables in default content
    let processedContent = defaultContent;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedContent = processedContent.replace(regex, String(value));
    }
    return `${sectionPrompt}

Default Content Structure:
${processedContent}

Instructions:
- Use the case information provided above to generate the content
- Extract relevant facts and details from the case information
- Follow the structure and style of the default content
- Ensure the content is professional and legally appropriate
- Do not include placeholders or variable syntax in the final output
- Format headings and paragraphs appropriately`;
}
/**
 * Post-process generated content
 */
function postProcessContent(content) {
    // Remove any remaining variable placeholders
    let processed = content.replace(/\{\{[^}]+\}\}/g, '');
    // Clean up extra whitespace
    processed = processed.replace(/\n{3,}/g, '\n\n');
    // Ensure proper heading formatting (if headings are used)
    processed = processed.replace(/^###\s+/gm, '### ');
    return processed.trim();
}
/**
 * Validate generated content
 */
function validateContent(content) {
    if (!content || content.trim().length < 50) {
        return false; // Content too short
    }
    // Check for common error patterns
    if (content.includes('Error:') || content.includes('Failed to')) {
        return false;
    }
    return true;
}
//# sourceMappingURL=prompts.js.map