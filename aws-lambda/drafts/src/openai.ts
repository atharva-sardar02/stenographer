import OpenAI from 'openai';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

let openaiClient: OpenAI | null = null;

/**
 * Initialize OpenAI client with API key from AWS Secrets Manager
 */
async function getOpenAIClient(): Promise<OpenAI> {
  if (openaiClient) {
    return openaiClient;
  }

  try {
    const secretsClient = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    // Get OpenAI API key from Secrets Manager
    const secretName = process.env.OPENAI_SECRET_NAME || 'stenographer/openai-api-key';
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await secretsClient.send(command);

    let apiKey: string;
    if (response.SecretString) {
      apiKey = response.SecretString;
    } else if (response.SecretBinary) {
      apiKey = Buffer.from(response.SecretBinary).toString('utf-8');
    } else {
      throw new Error('OpenAI API key not found in Secrets Manager');
    }

    openaiClient = new OpenAI({
      apiKey: apiKey.trim(),
    });

    return openaiClient;
  } catch (error: any) {
    console.error('Error initializing OpenAI client:', error);
    throw new Error(`Failed to initialize OpenAI client: ${error.message}`);
  }
}

export interface GenerateSectionOptions {
  prompt: string;
  context: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface GenerateSectionResult {
  content: string;
  tokensUsed: number;
  model: string;
}

/**
 * Generate a single section using OpenAI
 */
export async function generateSection(
  options: GenerateSectionOptions
): Promise<GenerateSectionResult> {
  const client = await getOpenAIClient();

  const {
    prompt,
    context,
    temperature = 0.7,
    maxTokens = 2000,
    model = 'gpt-4o-mini', // Use cost-effective model by default
  } = options;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: context,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const content = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    if (!content) {
      throw new Error('OpenAI returned empty content');
    }

    return {
      content,
      tokensUsed,
      model,
    };
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    // Retry logic for rate limits
    if (error.status === 429) {
      const retryAfter = error.headers?.['retry-after'] || 60;
      throw new Error(
        `OpenAI rate limit exceeded. Please retry after ${retryAfter} seconds.`
      );
    }

    // Handle token limit errors
    if (error.code === 'context_length_exceeded') {
      throw new Error(
        'Context too long. Please reduce the number of source files or their size.'
      );
    }

    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Generate multiple sections sequentially
 */
export async function generateSections(
  sections: Array<{
    name: string;
    prompt: string;
    context: string;
    temperature?: number;
    maxTokens?: number;
  }>
): Promise<Array<{ name: string; result: GenerateSectionResult }>> {
  const results: Array<{ name: string; result: GenerateSectionResult }> = [];

  for (const section of sections) {
    try {
      const result = await generateSection({
        prompt: section.prompt,
        context: section.context,
        temperature: section.temperature,
        maxTokens: section.maxTokens,
      });

      results.push({
        name: section.name,
        result,
      });
    } catch (error: any) {
      console.error(`Error generating section ${section.name}:`, error);
      throw new Error(`Failed to generate ${section.name} section: ${error.message}`);
    }
  }

  return results;
}

