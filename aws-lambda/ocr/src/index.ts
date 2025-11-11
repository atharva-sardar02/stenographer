import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { extractTextFromPdf } from './textract';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

interface OcrRequest {
  matterId: string;
  fileId: string;
  storagePath: string;
  s3Bucket?: string;
  s3Key?: string;
}

/**
 * OCR extraction handler
 * POST /v1/ocr:extract
 * 
 * Expected request body:
 * {
 *   "matterId": "matter-id",
 *   "fileId": "file-id",
 *   "storagePath": "matters/{matterId}/files/{fileName}",
 *   "s3Bucket": "optional-s3-bucket",
 *   "s3Key": "optional-s3-key"
 * }
 */
export const extract = async (
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

    const requestData: OcrRequest = JSON.parse(event.body);
    const { matterId, fileId, storagePath, s3Bucket, s3Key } = requestData;

    if (!matterId || !fileId || !storagePath) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'matterId, fileId, and storagePath are required',
        }),
      };
    }

    // Update file status to "processing"
    const fileRef = db
      .collection('matters')
      .doc(matterId)
      .collection('files')
      .doc(fileId);

    await fileRef.update({
      ocrStatus: 'processing',
      ocrError: null,
    });

    // For now, we'll use S3 if provided, otherwise we need to sync Firebase Storage to S3
    // TODO: Implement Firebase Storage -> S3 sync for production
    if (!s3Bucket || !s3Key) {
      // Return error - S3 bucket/key required for Textract
      await fileRef.update({
        ocrStatus: 'failed',
        ocrError: 'S3 bucket and key required for OCR processing',
      });

      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'S3 bucket and key required for OCR processing',
        }),
      };
    }

    // Extract text using Textract
    const ocrResult = await extractTextFromPdf(s3Bucket, s3Key);

    // Update Firestore with OCR results
    await fileRef.update({
      ocrStatus: 'done',
      ocrText: ocrResult.text,
      ocrConfidence: ocrResult.confidence,
      ocrPages: ocrResult.pageCount,
      ocrError: null,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        fileId,
        matterId,
        ocrResult: {
          textLength: ocrResult.text.length,
          pageCount: ocrResult.pageCount,
          confidence: ocrResult.confidence,
        },
      }),
    };
  } catch (error: any) {
    console.error('OCR extraction error:', error);

    // Try to update file status to failed if we have the IDs
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      if (body.matterId && body.fileId) {
        const fileRef = db
          .collection('matters')
          .doc(body.matterId)
          .collection('files')
          .doc(body.fileId);

        await fileRef.update({
          ocrStatus: 'failed',
          ocrError: error.message || 'OCR processing failed',
        });
      }
    } catch (updateError) {
      console.error('Failed to update file status:', updateError);
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'OCR extraction failed',
        message: error.message,
      }),
    };
  }
};
