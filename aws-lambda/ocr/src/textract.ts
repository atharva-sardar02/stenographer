import {
  TextractClient,
  DetectDocumentTextCommand,
  DetectDocumentTextCommandInput,
  DetectDocumentTextCommandOutput,
} from '@aws-sdk/client-textract';

const textractClient = new TextractClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export interface OcrResult {
  text: string;
  pageCount: number;
  confidence: number; // Average confidence score (0-100)
  blocks: Array<{
    text: string;
    confidence: number;
  }>;
}

/**
 * Extract text from a PDF document using AWS Textract
 */
export async function extractTextFromPdf(
  s3Bucket: string,
  s3Key: string
): Promise<OcrResult> {
  try {
    const input: DetectDocumentTextCommandInput = {
      Document: {
        S3Object: {
          Bucket: s3Bucket,
          Name: s3Key,
        },
      },
    };

    const command = new DetectDocumentTextCommand(input);
    const response: DetectDocumentTextCommandOutput = await textractClient.send(
      command
    );

    if (!response.Blocks) {
      throw new Error('No blocks returned from Textract');
    }

    // Extract text and calculate confidence
    const textBlocks: Array<{ text: string; confidence: number }> = [];
    let totalConfidence = 0;
    let confidenceCount = 0;
    let pageCount = 0;

    // Get all LINE blocks (they contain the actual text)
    const lineBlocks = response.Blocks.filter(
      (block) => block.BlockType === 'LINE'
    );

    // Get page count
    const pageBlocks = response.Blocks.filter(
      (block) => block.BlockType === 'PAGE'
    );
    pageCount = pageBlocks.length;

    // Extract text from LINE blocks
    for (const block of lineBlocks) {
      if (block.Text && block.Confidence !== undefined) {
        const text = block.Text.trim();
        const confidence = block.Confidence;

        if (text) {
          textBlocks.push({ text, confidence });
          totalConfidence += confidence;
          confidenceCount++;
        }
      }
    }

    // Calculate average confidence
    const averageConfidence =
      confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

    // Combine all text blocks into a single string
    const fullText = textBlocks.map((block) => block.text).join('\n');

    return {
      text: fullText,
      pageCount,
      confidence: Math.round(averageConfidence * 100) / 100,
      blocks: textBlocks,
    };
  } catch (error: any) {
    console.error('Textract extraction error:', error);
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
}

/**
 * Extract text from a document stored in Firebase Storage
 * Note: This requires downloading the file from Firebase Storage to S3 first
 * For now, we'll use a direct approach with Firebase Storage download URL
 */
export async function extractTextFromFirebaseStorage(
  storageUrl: string
): Promise<OcrResult> {
  // TODO: For production, download from Firebase Storage to S3, then use Textract
  // For now, this is a placeholder that would need Firebase Storage -> S3 sync
  throw new Error(
    'Firebase Storage to S3 sync not implemented. Use S3 bucket directly for OCR.'
  );
}

