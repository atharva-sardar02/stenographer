import { TemplateSection, TemplateVariable } from '@stenographer/shared/types/template';

/**
 * Build the base context from source files
 */
export function buildContext(sourceTexts: string[]): string {
  const combinedText = sourceTexts
    .filter((text) => text && text.trim())
    .join('\n\n---\n\n');

  return `Source Documents:\n\n${combinedText}`;
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
- Generate content based on the source documents provided
- Follow the structure and style of the default content
- Use the template variables where appropriate
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

