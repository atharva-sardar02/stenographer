"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualPurge = exports.retentionPurge = exports.updateUserProfile = exports.onFileCreate = exports.onUserCreate = exports.exportGenerate = exports.draftRefineSection = exports.draftGenerate = exports.ocrExtract = exports.api = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const retention_1 = require("./scheduled/retention");
Object.defineProperty(exports, "retentionPurge", { enumerable: true, get: function () { return retention_1.retentionPurge; } });
Object.defineProperty(exports, "manualPurge", { enumerable: true, get: function () { return retention_1.manualPurge; } });
// Initialize Firebase Admin
admin.initializeApp();
// CORS configuration
const corsHandler = (0, cors_1.default)({
    origin: true, // Allow all origins (or specify your domain)
    credentials: true,
});
// Export API proxy function
exports.api = functions
    .region('us-central1')
    .https
    .onRequest(async (request, response) => {
    // CORS handling
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    // TODO: Verify Firebase ID token
    // TODO: Forward request to AWS API Gateway
    // TODO: Handle response
    response.status(200).json({ message: 'API proxy endpoint - implementation pending' });
});
/**
 * OCR extraction proxy endpoint
 * POST /api/v1/ocr:extract
 * Proxies OCR requests to AWS Lambda
 */
exports.ocrExtract = functions
    .region('us-central1')
    .https
    .onRequest(async (request, response) => {
    // CORS handling
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        // TODO: Verify Firebase ID token
        // const authHeader = request.headers.authorization;
        // if (!authHeader) {
        //   response.status(401).json({ error: 'Unauthorized' });
        //   return;
        // }
        // TODO: Forward request to AWS Lambda OCR function
        // For now, return a placeholder response
        response.status(200).json({
            message: 'OCR extraction endpoint - AWS Lambda integration pending',
            note: 'This will forward to AWS Lambda OCR function when configured',
        });
    }
    catch (error) {
        console.error('OCR proxy error:', error);
        response.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
});
/**
 * Draft generation proxy endpoint
 * POST /api/v1/drafts:generate
 * Proxies draft generation requests to AWS Lambda
 */
exports.draftGenerate = functions
    .region('us-central1')
    .https
    .onRequest(async (request, response) => {
    // CORS handling
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        // TODO: Verify Firebase ID token
        // const authHeader = request.headers.authorization;
        // if (!authHeader) {
        //   response.status(401).json({ error: 'Unauthorized' });
        //   return;
        // }
        // TODO: Forward request to AWS Lambda draft generation function
        // For now, return a placeholder response
        response.status(200).json({
            message: 'Draft generation endpoint - AWS Lambda integration pending',
            note: 'This will forward to AWS Lambda draft generation function when configured',
        });
    }
    catch (error) {
        console.error('Draft generation proxy error:', error);
        response.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
});
/**
 * Draft section refinement proxy endpoint
 * POST /api/v1/drafts:refineSection
 * Proxies section refinement requests to AWS Lambda
 */
exports.draftRefineSection = functions
    .region('us-central1')
    .https
    .onRequest(async (request, response) => {
    // CORS handling
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        // TODO: Verify Firebase ID token
        // const authHeader = request.headers.authorization;
        // if (!authHeader) {
        //   response.status(401).json({ error: 'Unauthorized' });
        //   return;
        // }
        // TODO: Forward request to AWS Lambda section refinement function
        // For now, return a placeholder response
        response.status(200).json({
            message: 'Section refinement endpoint - AWS Lambda integration pending',
            note: 'This will forward to AWS Lambda section refinement function when configured',
        });
    }
    catch (error) {
        console.error('Section refinement proxy error:', error);
        response.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
});
/**
 * Export generation proxy endpoint
 * POST /exportGenerate
 * Proxies export generation requests to AWS Lambda
 */
exports.exportGenerate = functions
    .region('us-central1')
    .https
    .onRequest((request, response) => {
    // Handle CORS preflight
    corsHandler(request, response, async () => {
        if (request.method !== 'POST') {
            response.status(405).json({ error: 'Method not allowed' });
            return;
        }
        try {
            // TODO: Verify Firebase ID token
            // const authHeader = request.headers.authorization;
            // if (!authHeader) {
            //   response.status(401).json({ error: 'Unauthorized' });
            //   return;
            // }
            // TODO: Forward request to AWS Lambda export generation function
            // For now, return a placeholder response
            response.status(200).json({
                message: 'Export generation endpoint - AWS Lambda integration pending',
                note: 'This will forward to AWS Lambda export generation function when configured',
                downloadUrl: 'https://example.com/placeholder.docx',
                exportId: `export-${Date.now()}`,
                isPlaceholder: true, // Flag to indicate this is a placeholder response
            });
        }
        catch (error) {
            console.error('Export generation proxy error:', error);
            response.status(500).json({
                error: 'Internal server error',
                message: error.message,
            });
        }
    });
});
/**
 * User creation trigger
 * Automatically creates a user document in Firestore when a new user signs up
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    try {
        const userRef = admin.firestore().collection('users').doc(user.uid);
        // Check if user document already exists (might be created by frontend)
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            // User document already exists, just update lastLoginAt
            await userRef.update({
                lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`User document updated for ${user.uid}`);
            return;
        }
        // Create new user document
        const userData = {
            email: user.email || '',
            displayName: user.displayName || '',
            role: 'paralegal', // Default role (can be updated by frontend after signup)
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await userRef.set(userData);
        console.log(`User document created for ${user.uid}`);
    }
    catch (error) {
        console.error(`Error creating user document for ${user.uid}:`, error);
        throw error;
    }
});
/**
 * User update trigger
 * Updates lastLoginAt when user signs in
 * Note: beforeSignIn is not available in v1, using onUserCreate for initial setup
 * We'll update lastLoginAt in the frontend after successful sign-in
 */
/**
 * File finalize trigger
 * Auto-triggers OCR for PDF files
 */
exports.onFileCreate = functions.firestore
    .document('matters/{matterId}/files/{fileId}')
    .onCreate(async (snap, context) => {
    const { matterId, fileId } = context.params;
    const fileData = snap.data();
    console.log(`File created: ${fileId} in matter ${matterId}, type: ${fileData.type}`);
    // Auto-trigger OCR for PDF files
    if (fileData.type === 'pdf') {
        try {
            // Update status to pending (will be updated to processing when OCR starts)
            await snap.ref.update({
                ocrStatus: 'pending',
            });
            // Note: Actual OCR triggering will be handled by the frontend or a separate job
            // For now, we just mark it as pending
            console.log(`OCR marked as pending for PDF file ${fileId}`);
        }
        catch (error) {
            console.error(`Error setting OCR status for file ${fileId}:`, error);
        }
    }
    return null;
});
/**
 * Callable function to update user profile
 * Allows frontend to update user role and other profile data
 */
exports.updateUserProfile = functions
    .region('us-central1')
    .https
    .onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to update profile');
    }
    const userId = context.auth.uid;
    const { displayName, role } = data;
    // Validate role if provided
    if (role && role !== 'attorney' && role !== 'paralegal') {
        throw new functions.https.HttpsError('invalid-argument', 'Role must be either "attorney" or "paralegal"');
    }
    try {
        const userRef = admin.firestore().collection('users').doc(userId);
        const updateData = {};
        if (displayName !== undefined) {
            updateData.displayName = displayName;
        }
        if (role !== undefined) {
            updateData.role = role;
        }
        if (Object.keys(updateData).length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'No valid fields to update');
        }
        await userRef.update(updateData);
        console.log(`User profile updated for ${userId}`);
        return { success: true };
    }
    catch (error) {
        console.error(`Error updating user profile for ${userId}:`, error);
        throw new functions.https.HttpsError('internal', 'Failed to update user profile', error.message);
    }
});
//# sourceMappingURL=index.js.map