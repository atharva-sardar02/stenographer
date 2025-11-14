import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { generateDraft, GenerateDraftRequest } from './generate';
import { refineSection, RefineSectionRequest } from './refine';

/**
 * Main router handler that routes requests based on path
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const path = event.path || '';
  
  if (path.includes('refineSection') || path.includes('drafts:refineSection')) {
    return refineSectionHandler(event);
  } else {
    return generate(event);
  }
};

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

/**
 * Section refinement handler
 * POST /v1/drafts:refineSection
 * 
 * Expected request body:
 * {
 *   "draftId": "draft-id",
 *   "section": "facts" | "liability" | "damages" | "demand",
 *   "instruction": "Add more detail on pain and suffering",
 *   "keepExistingContent": true,
 *   "userId": "user-id"
 * }
 */
export const refineSectionHandler = async (
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

    const requestData: RefineSectionRequest = JSON.parse(event.body);
    const { draftId, section, instruction, keepExistingContent, userId } = requestData;

    // Validate required fields
    if (!draftId || !section || !instruction || !userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'draftId, section, instruction, and userId are required',
        }),
      };
    }

    // Validate section name
    const validSections = ['facts', 'liability', 'damages', 'demand'];
    if (!validSections.includes(section)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: `Invalid section. Must be one of: ${validSections.join(', ')}`,
        }),
      };
    }

    // Refine section
    const result = await refineSection({
      draftId,
      section,
      instruction,
      keepExistingContent: keepExistingContent !== undefined ? keepExistingContent : true,
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
        section,
        content: result.content,
        tokensUsed: result.tokensUsed,
        message: 'Section refined successfully',
      }),
    };
  } catch (error: any) {
    console.error('Section refinement error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Section refinement failed',
        message: error.message,
      }),
    };
  }
};
