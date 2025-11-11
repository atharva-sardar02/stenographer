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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.onFileCreate = exports.onUserCreate = exports.api = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
admin.initializeApp();
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
 * File finalize trigger (optional)
 * This can be used for additional processing after file upload
 * Currently, files are finalized in the frontend, but this trigger
 * can be used for future enhancements like auto-OCR triggering
 */
exports.onFileCreate = functions.firestore
    .document('matters/{matterId}/files/{fileId}')
    .onCreate(async (snap, context) => {
    const { matterId, fileId } = context.params;
    const fileData = snap.data();
    console.log(`File created: ${fileId} in matter ${matterId}, type: ${fileData.type}`);
    // Future: Auto-trigger OCR for PDF files
    // if (fileData.type === 'pdf') {
    //   // Trigger OCR processing
    // }
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