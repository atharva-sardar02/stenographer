import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { generateDraft, GenerateDraftRequest } from './generate';

/**
 * Draft generation handler
 * POST /v1/drafts:generate
 * 
 * Expected request body:
 * {
 *   "matterId": "matter-id",
 *   "templateId": "template-id",
 *   "fileIds": ["file-id-1", "file-id-2"],
 *   "variables": { "client_name": "John Doe", ... },
 *   "userId": "user-id"
 * }
 */
export const generate = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const requestData: GenerateDraftRequest = JSON.parse(event.body);
    const { matterId, templateId, fileIds, variables, userId } = requestData;

    // Validate required fields
    if (!matterId || !templateId || !fileIds || !Array.isArray(fileIds) || fileIds.length === 0 || !userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'matterId, templateId, fileIds (non-empty array), and userId are required',
        }),
      };
    }

    // Generate draft
    const result = await generateDraft({
      matterId,
      templateId,
      fileIds,
      variables: variables || {},
      userId,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        draftId: result.draftId,
        message: 'Draft generated successfully',
      }),
    };
  } catch (error: any) {
    console.error('Draft generation error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Draft generation failed',
        message: error.message,
      }),
    };
  }
};
