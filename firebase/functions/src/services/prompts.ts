import { TemplateSection } from '../../../../shared/types/template';
import * as functions from 'firebase-functions/v1';

// Use Firebase Functions logger for better log visibility
const logger = functions.logger;

/**
 * Build the base context from source files
 */
export function buildContext(sourceTexts: string[]): string {
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
export function buildSectionPrompt(
  section: TemplateSection,
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

/**
 * Build the full prompt for a section
 * NOTE: Context is now included directly in the prompt for clarity
 */
export function buildFullPrompt(
  section: TemplateSection,
  variables: Record<string, any>,
  context: string
): string {
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
export function postProcessContent(content: string): string {
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
export function validateContent(content: string): boolean {
  if (!content || content.trim().length < 50) {
    return false; // Content too short
  }

  // Check for common error patterns
  if (content.includes('Error:') || content.includes('Failed to')) {
    return false;
  }

  return true;
}

