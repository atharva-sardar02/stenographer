"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromPdf = extractTextFromPdf;
exports.extractTextFromImage = extractTextFromImage;
const vision_1 = require("@google-cloud/vision");
const storage_1 = require("firebase-admin/storage");
// Lazy initialization of Vision client
let visionClient = null;
function getVisionClient() {
    if (!visionClient) {
        visionClient = new vision_1.ImageAnnotatorClient();
    }
    return visionClient;
}
/**
 * Extract text from a PDF stored in Firebase Storage using Google Cloud Vision API
 */
async function extractTextFromPdf(storagePath) {
    try {
        // Lazy initialization of Storage
        const storage = (0, storage_1.getStorage)();
        const bucket = storage.bucket();
        const file = bucket.file(storagePath);
        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
            throw new Error(`File not found at path: ${storagePath}`);
        }
        // Get signed URL for the file (Vision API needs a URI)
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        });
        // Use Google Cloud Vision API for PDF text extraction
        // Note: Vision API supports PDFs directly
        const [result] = await getVisionClient().textDetection(signedUrl);
        if (!result.fullTextAnnotation) {
            throw new Error('No text detected in PDF');
        }
        const text = result.fullTextAnnotation.text || '';
        const pages = result.fullTextAnnotation.pages || [];
        const pageCount = pages.length;
        // Calculate average confidence
        let totalConfidence = 0;
        let confidenceCount = 0;
        for (const page of pages) {
            if (page.confidence !== undefined && page.confidence !== null) {
                totalConfidence += page.confidence;
                confidenceCount++;
            }
        }
        const averageConfidence = confidenceCount > 0
            ? Math.round((totalConfidence / confidenceCount) * 100 * 100) / 100
            : 0;
        return {
            text: text.trim(),
            pageCount,
            confidence: averageConfidence,
        };
    }
    catch (error) {
        console.error('Vision API OCR extraction error:', error);
        throw new Error(`OCR extraction failed: ${error.message}`);
    }
}
/**
 * Extract text from an image file stored in Firebase Storage
 */
async function extractTextFromImage(storagePath) {
    try {
        // Lazy initialization of Storage
        const storage = (0, storage_1.getStorage)();
        const bucket = storage.bucket();
        const file = bucket.file(storagePath);
        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
            throw new Error(`File not found at path: ${storagePath}`);
        }
        // Get signed URL for the file
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        });
        // Use Google Cloud Vision API for image text extraction
        const [result] = await getVisionClient().textDetection(signedUrl);
        if (!result.fullTextAnnotation) {
            throw new Error('No text detected in image');
        }
        const text = result.fullTextAnnotation.text || '';
        const pages = result.fullTextAnnotation.pages || [];
        const pageCount = pages.length;
        // Calculate average confidence
        let totalConfidence = 0;
        let confidenceCount = 0;
        for (const page of pages) {
            if (page.confidence !== undefined && page.confidence !== null) {
                totalConfidence += page.confidence;
                confidenceCount++;
            }
        }
        const averageConfidence = confidenceCount > 0
            ? Math.round((totalConfidence / confidenceCount) * 100 * 100) / 100
            : 0;
        return {
            text: text.trim(),
            pageCount,
            confidence: averageConfidence,
        };
    }
    catch (error) {
        console.error('Vision API OCR extraction error:', error);
        throw new Error(`OCR extraction failed: ${error.message}`);
    }
}
//# sourceMappingURL=ocr.js.map