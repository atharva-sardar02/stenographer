import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { generateDocx, DraftContent } from './generateDocx';
import { S3 } from 'aws-sdk';

const s3 = new S3();
const BUCKET_NAME = process.env.EXPORT_BUCKET_NAME || 'stenographer-exports';

/**
 * Export handler
 * POST /v1/exports:generate
 *
 * Expected request body:
 * {
 *   "draftId": "draft-id",
 *   "matterId": "matter-id",
 *   "content": {
 *     "facts": "...",
 *     "liability": "...",
 *     "damages": "...",
 *     "demand": "..."
 *   },
 *   "options": {
 *     "matterTitle": "...",
 *     "clientName": "...",
 *     "includeHeader": true,
 *     "includeFooter": true
 *   },
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

    const requestData = JSON.parse(event.body);
    const { draftId, matterId, content, options, userId } = requestData;

    // Validate required fields
    if (!draftId || !matterId || !content || !userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'draftId, matterId, content, and userId are required',
        }),
      };
    }

    // Validate content structure
    const requiredSections = ['facts', 'liability', 'damages', 'demand'];
    for (const section of requiredSections) {
      if (!content[section]) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            error: `Content section '${section}' is required`,
          }),
        };
      }
    }

    // Generate DOCX
    const docxBuffer = await generateDocx(content as DraftContent, options || {});

    // Upload to S3
    const fileName = `exports/${matterId}/${draftId}-${Date.now()}.docx`;
    await s3
      .putObject({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: docxBuffer,
        ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      .promise();

    // Generate presigned URL (valid for 1 hour)
    const downloadUrl = s3.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Expires: 3600,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        exportId: `${draftId}-${Date.now()}`,
        downloadUrl,
        fileName,
        message: 'DOCX export generated successfully',
      }),
    };
  } catch (error: any) {
    console.error('Export generation error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Export generation failed',
        message: error.message,
      }),
    };
  }
};
