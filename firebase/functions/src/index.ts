import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export API proxy function
export const api = functions
  .region('us-central1')
  .https
  .onRequest(async (request: functions.Request, response: functions.Response) => {
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
export const ocrExtract = functions
  .region('us-central1')
  .https
  .onRequest(async (request: functions.Request, response: functions.Response) => {
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
    } catch (error: any) {
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
export const draftGenerate = functions
  .region('us-central1')
  .https
  .onRequest(async (request: functions.Request, response: functions.Response) => {
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
    } catch (error: any) {
      console.error('Draft generation proxy error:', error);
      response.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  });

/**
 * User creation trigger
 * Automatically creates a user document in Firestore when a new user signs up
 */
export const onUserCreate = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
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
  } catch (error) {
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
export const onFileCreate = functions.firestore
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
      } catch (error) {
        console.error(`Error setting OCR status for file ${fileId}:`, error);
      }
    }

    return null;
  });

/**
 * Callable function to update user profile
 * Allows frontend to update user role and other profile data
 */
export const updateUserProfile = functions
  .region('us-central1')
  .https
  .onCall(async (data: any, context: functions.https.CallableContext) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to update profile'
      );
    }

    const userId = context.auth.uid;
    const { displayName, role } = data;

    // Validate role if provided
    if (role && role !== 'attorney' && role !== 'paralegal') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Role must be either "attorney" or "paralegal"'
      );
    }

    try {
      const userRef = admin.firestore().collection('users').doc(userId);
      const updateData: any = {};

      if (displayName !== undefined) {
        updateData.displayName = displayName;
      }

      if (role !== undefined) {
        updateData.role = role;
      }

      if (Object.keys(updateData).length === 0) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'No valid fields to update'
        );
      }

      await userRef.update(updateData);
      console.log(`User profile updated for ${userId}`);

      return { success: true };
    } catch (error: any) {
      console.error(`Error updating user profile for ${userId}:`, error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to update user profile',
        error.message
      );
    }
  });
