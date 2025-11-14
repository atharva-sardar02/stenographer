"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocx = generateDocx;
exports.uploadDocxToStorage = uploadDocxToStorage;
const docx_1 = require("docx");
const storage_1 = require("firebase-admin/storage");
/**
 * Generates a DOCX document from draft content
 */
async function generateDocx(content, options = {}) {
    const { matterTitle = 'Demand Letter', clientName = '', includeHeader = true, includeFooter = true, } = options;
    // Helper to convert HTML to docx paragraphs
    const htmlToParagraphs = (html) => {
        // Simple HTML to text conversion (strip tags)
        const text = html.replace(/<[^>]*>/g, '').trim();
        if (!text)
            return [];
        // Split by newlines and create paragraphs
        const lines = text.split(/\n+/).filter((line) => line.trim());
        return lines.map((line) => new docx_1.Paragraph({
            text: line.trim(),
            spacing: { after: 200 },
        }));
    };
    const children = [];
    // Header
    if (includeHeader) {
        children.push(new docx_1.Paragraph({
            text: matterTitle,
            heading: docx_1.HeadingLevel.HEADING_1,
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { after: 400 },
        }));
        if (clientName) {
            children.push(new docx_1.Paragraph({
                text: `Client: ${clientName}`,
                alignment: docx_1.AlignmentType.LEFT,
                spacing: { after: 200 },
            }));
        }
        children.push(new docx_1.Paragraph({
            text: '',
            spacing: { after: 400 },
        }));
    }
    // Statement of Facts
    children.push(new docx_1.Paragraph({
        text: 'STATEMENT OF FACTS',
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
    }));
    children.push(...htmlToParagraphs(content.facts));
    // Liability
    children.push(new docx_1.Paragraph({
        text: 'LIABILITY',
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
    }));
    children.push(...htmlToParagraphs(content.liability));
    // Damages
    children.push(new docx_1.Paragraph({
        text: 'DAMAGES',
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
    }));
    children.push(...htmlToParagraphs(content.damages));
    // Demand
    children.push(new docx_1.Paragraph({
        text: 'DEMAND',
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
    }));
    children.push(...htmlToParagraphs(content.demand));
    // Footer
    if (includeFooter) {
        children.push(new docx_1.Paragraph({
            text: '',
            spacing: { before: 400 },
        }));
        children.push(new docx_1.Paragraph({
            text: `Generated on ${new Date().toLocaleDateString()}`,
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { before: 400 },
        }));
    }
    // Create document
    const doc = new docx_1.Document({
        sections: [
            {
                properties: {},
                children,
            },
        ],
    });
    // Generate buffer
    const buffer = await docx_1.Packer.toBuffer(doc);
    return buffer;
}
/**
 * Upload DOCX file to Firebase Storage and return download URL
 */
async function uploadDocxToStorage(buffer, exportId, fileName) {
    try {
        const storage = (0, storage_1.getStorage)();
        const bucket = storage.bucket();
        const filePath = `exports/${exportId}/${fileName}`;
        const file = bucket.file(filePath);
        console.log('[Export] Uploading DOCX to Storage:', { filePath, bufferSize: buffer.length });
        // Upload buffer to Firebase Storage
        await file.save(buffer, {
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            metadata: {
                contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                metadata: {
                    exportId: exportId,
                },
            },
        });
        console.log('[Export] File uploaded successfully, generating signed URL');
        // Generate a signed URL (valid for 1 hour)
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });
        console.log('[Export] Signed URL generated successfully');
        return signedUrl;
    }
    catch (error) {
        console.error('[Export] Error uploading to Storage:', error);
        throw new Error(`Failed to upload DOCX to Storage: ${error.message}`);
    }
}
//# sourceMappingURL=export.js.map