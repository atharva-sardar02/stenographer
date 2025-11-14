"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSection = generateSection;
exports.generateSections = generateSections;
const openai_1 = __importDefault(require("openai"));
let openaiClient = null;
/**
 * Initialize OpenAI client with API key from environment or Firebase config
 */
function getOpenAIClient() {
    if (openaiClient) {
        return openaiClient;
    }
    console.log('[OpenAI] Initializing OpenAI client...');
    // Try environment variable first
    let apiKey = process.env.OPENAI_API_KEY;
    // Fall back to Firebase Functions config
    if (!apiKey) {
        console.log('[OpenAI] OPENAI_API_KEY not found in environment, trying Firebase config...');
        try {
            // Try multiple ways to access the config
            let config = null;
            // Method 1: Direct require and call
            try {
                const functions = require('firebase-functions/v1');
                config = functions.config();
                console.log('[OpenAI] Config accessed via require method');
            }
            catch (e1) {
                console.warn('[OpenAI] Method 1 failed:', e1);
                // Method 2: Try accessing via global functions object
                try {
                    const funcs = global.functions || require('firebase-functions/v1');
                    config = funcs.config ? funcs.config() : null;
                    console.log('[OpenAI] Config accessed via global method');
                }
                catch (e2) {
                    console.warn('[OpenAI] Method 2 failed:', e2);
                }
            }
            if (config && config.openai && config.openai.api_key) {
                apiKey = config.openai.api_key;
                console.log('[OpenAI] Found API key in Firebase config, length:', apiKey ? apiKey.length : 0);
            }
            else {
                console.warn('[OpenAI] Config exists but openai.api_key not found. Config keys:', config ? Object.keys(config) : 'null');
            }
        }
        catch (error) {
            console.error('[OpenAI] Could not access Firebase config for OpenAI API key:', error.message, error.stack);
        }
    }
    else {
        console.log('[OpenAI] Found API key in environment variable');
    }
    if (!apiKey) {
        const errorMsg = 'OpenAI API key not found. Set OPENAI_API_KEY environment variable or Firebase Functions config.';
        console.error(`[OpenAI] ${errorMsg}`);
        throw new Error(errorMsg);
    }
    console.log(`[OpenAI] API key length: ${apiKey.length}, starts with: ${apiKey.substring(0, 7)}...`);
    openaiClient = new openai_1.default({
        apiKey: apiKey.trim(),
    });
    console.log('[OpenAI] Client initialized successfully');
    return openaiClient;
}
/**
 * Generate a single section using OpenAI
 */
async function generateSection(options) {
    const client = getOpenAIClient();
    const { prompt, context, temperature = 0.7, maxTokens = 2000, model = 'gpt-4o-mini', // Use cost-effective model by default
     } = options;
    try {
        console.log(`[OpenAI] Calling API with model: ${model}, temperature: ${temperature}, maxTokens: ${maxTokens}`);
        console.log(`[OpenAI] Context length: ${context.length} characters`);
        console.log(`[OpenAI] Context preview: ${context.substring(0, 1000)}...`);
        console.log(`[OpenAI] Prompt length: ${prompt.length} characters`);
        // Validate context is not empty
        if (!context || context.trim().length === 0) {
            throw new Error('Context is empty - no file content available');
        }
        // Present the content as DIRECT INPUT, not as "documents to access"
        // This prevents the LLM from thinking it needs external file access
        const userMessage = `CASE INFORMATION:

${context}

---

TASK:
${prompt}

Please generate the content using the case information provided above.`;
        console.log(`[OpenAI] User message length: ${userMessage.length} characters`);
        console.log(`[OpenAI] User message preview (first 1500 chars): ${userMessage.substring(0, 1500)}...`);
        const completion = await client.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional legal document assistant. Generate content based on the case information provided in the user message. Use the facts and details from the case information to create professional, legally appropriate content.',
                },
                {
                    role: 'user',
                    content: userMessage,
                },
            ],
            temperature,
            max_tokens: maxTokens,
        });
        const content = completion.choices[0]?.message?.content || '';
        const tokensUsed = completion.usage?.total_tokens || 0;
        console.log(`[OpenAI] API call successful. Tokens used: ${tokensUsed}, Content length: ${content.length}`);
        if (!content) {
            throw new Error('OpenAI returned empty content');
        }
        return {
            content,
            tokensUsed,
            model,
        };
    }
    catch (error) {
        console.error('[OpenAI] API error:', error);
        console.error('[OpenAI] Error details:', {
            status: error.status,
            code: error.code,
            type: error.type,
            message: error.message,
        });
        // Retry logic for rate limits
        if (error.status === 429) {
            const retryAfter = error.headers?.['retry-after'] || 60;
            const errorMsg = `OpenAI rate limit exceeded. Please retry after ${retryAfter} seconds.`;
            console.error(`[OpenAI] ${errorMsg}`);
            throw new Error(errorMsg);
        }
        // Handle token limit errors
        if (error.code === 'context_length_exceeded') {
            const errorMsg = 'Context too long. Please reduce the number of source files or their size.';
            console.error(`[OpenAI] ${errorMsg}`);
            throw new Error(errorMsg);
        }
        // Handle authentication errors
        if (error.status === 401) {
            const errorMsg = 'OpenAI API authentication failed. Please check your API key.';
            console.error(`[OpenAI] ${errorMsg}`);
            throw new Error(errorMsg);
        }
        throw new Error(`OpenAI API error: ${error.message}`);
    }
}
/**
 * Generate multiple sections in parallel for maximum speed
 */
async function generateSections(sections) {
    // Generate all sections in parallel for maximum speed
    const promises = sections.map(async (section) => {
        try {
            const result = await generateSection({
                prompt: section.prompt,
                context: section.context,
                temperature: section.temperature,
                maxTokens: section.maxTokens,
            });
            return {
                name: section.name,
                result,
            };
        }
        catch (error) {
            console.error(`Error generating section ${section.name}:`, error);
            throw new Error(`Failed to generate ${section.name} section: ${error.message}`);
        }
    });
    // Wait for all sections to complete in parallel
    const results = await Promise.all(promises);
    return results;
}
//# sourceMappingURL=openai.js.map