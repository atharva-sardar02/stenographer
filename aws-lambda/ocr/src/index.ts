import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * OCR extraction handler
 * POST /v1/ocr:extract
 */
export const extract = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Implement OCR extraction using AWS Textract
  // - Retrieve file from Firebase Storage
  // - Call Textract DetectDocumentText API
  // - Parse response and update Firestore
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'OCR extraction endpoint - implementation pending',
    }),
  };
};

