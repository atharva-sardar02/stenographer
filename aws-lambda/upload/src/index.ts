import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * Initialize file upload - generates signed Firebase Storage URL
 * POST /v1/files:uploadInit
 */
export const uploadInit = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Implement upload initialization
  // - Generate signed Firebase Storage URL
  // - Return { fileId, uploadUrl, storagePath }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Upload init endpoint - implementation pending',
    }),
  };
};

/**
 * Finalize file upload - creates Firestore document
 * POST /v1/files:finalize
 */
export const finalize = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Implement file finalization
  // - Create Firestore document
  // - Set purgeAt to uploadedAt + 7 days
  // - Enqueue OCR if PDF
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'File finalize endpoint - implementation pending',
    }),
  };
};

