import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import cors from 'cors';

// Use Firebase Functions logger for better log visibility
const logger = functions.logger;

// Load environment variables from .env file (for local development)
// In production, these should be set via Firebase Functions environment variables
if (process.env.NODE_ENV !== 'production' || process.env.FUNCTIONS_EMULATOR) {
  try {
    require('dotenv').config();
    console.log('[Index] Loaded .env file for local development');
  } catch (error) {
    // dotenv is optional, only needed for local dev
  }
}

// Initialize Firebase Admin with correct storage bucket
admin.initializeApp({
  storageBucket: 'stenographer-dev.firebasestorage.app'
});

// Get OpenAI API key from Firebase config (for production) or .env (for local)
// Try Firebase config first (production), then fall back to environment variable
if (!process.env.OPENAI_API_KEY) {
  try {
    const config = (functions as any).config();
    if (config && config.openai && config.openai.api_key) {
      process.env.OPENAI_API_KEY = config.openai.api_key;
      console.log('[Index] OpenAI API key loaded from Firebase config');
    }
  } catch (error: any) {
    console.warn('[Index] Could not load OpenAI API key from Firebase config:', error.message);
  }
}

if (process.env.OPENAI_API_KEY) {
  console.log('[Index] OpenAI API key is available');
} else {
  console.error('[Index] WARNING: OPENAI_API_KEY not found in environment or config');
}

// Import services after setting environment variable
import { retentionPurge, manualPurge } from './scheduled/retention';
import { extractTextFromPdf, extractTextFromImage } from './services/ocr';
import { generateDraft, refineSection } from './services/drafts';
import { generateDocx, uploadDocxToStorage } from './services/export';

// Lazy initialization of Firestore
function getDb() {
  return admin.firestore();
}

// CORS configuration
const corsHandler = cors({
  origin: true, // Allow all origins (or specify your domain)
  credentials: true,
});

/**
 * Helper function to verify Firebase ID token
 */
async function verifyAuthToken(
  authHeader: string | undefined
): Promise<string> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid authorization header');
  }

  const idToken = authHeader.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  return decodedToken.uid;
}

/**
 * OCR extraction endpoint
 * POST /ocrExtract
 * Extracts text from PDFs using Google Cloud Vision API
 */
export const ocrExtract = functions
  .region('us-central1')
  .https.onRequest((request: functions.Request, response: functions.Response) => {
    corsHandler(request, response, async () => {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      try {
        // Verify Firebase ID token
        await verifyAuthToken(request.headers.authorization);

        // Parse request body
        const requestBody =
          typeof request.body === 'string' ? JSON.parse(request.body) : request.body;

        const { matterId, fileId, storagePath } = requestBody;

        if (!matterId || !fileId || !storagePath) {
          response.status(400).json({
            error: 'Missing required fields: matterId, fileId, storagePath',
          });
          return;
        }

        // Update file status to processing
        const fileRef = getDb()
          .collection('matters')
          .doc(matterId)
          .collection('files')
          .doc(fileId);

        await fileRef.update({
          ocrStatus: 'processing',
          ocrError: null,
        });

        // Determine file type and extract text
        let ocrResult;
        const fileExtension = storagePath.toLowerCase().split('.').pop();

        if (fileExtension === 'pdf') {
          ocrResult = await extractTextFromPdf(storagePath);
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
          ocrResult = await extractTextFromImage(storagePath);
        } else {
          throw new Error(`Unsupported file type: ${fileExtension}`);
        }

        // Update file with OCR results
        await fileRef.update({
          ocrStatus: 'done',
          ocrText: ocrResult.text,
          ocrConfidence: ocrResult.confidence,
          ocrPages: ocrResult.pageCount,
          ocrError: null,
        });

        response.status(200).json({
          success: true,
          text: ocrResult.text,
          pageCount: ocrResult.pageCount,
          confidence: ocrResult.confidence,
        });
      } catch (error: any) {
        console.error('OCR extraction error:', error);

        // Try to update file status to failed if we have the IDs
        try {
          const requestBody =
            typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
          if (requestBody.matterId && requestBody.fileId) {
            const fileRef = getDb()
              .collection('matters')
              .doc(requestBody.matterId)
              .collection('files')
              .doc(requestBody.fileId);
            await fileRef.update({
              ocrStatus: 'failed',
              ocrError: error.message,
            });
          }
        } catch (updateError) {
          console.error('Failed to update file status:', updateError);
        }

        response.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });
  });

/**
 * Draft generation endpoint
 * POST /draftGenerate
 * Generates a draft using OpenAI
 */
export const draftGenerate = functions
  .region('us-central1')
  .https.onRequest((request: functions.Request, response: functions.Response) => {
    corsHandler(request, response, async () => {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      try {
        // Set OpenAI API key from Firebase config if not already set
        if (!process.env.OPENAI_API_KEY) {
          try {
            const config = (functions as any).config();
            if (config && config.openai && config.openai.api_key) {
              process.env.OPENAI_API_KEY = config.openai.api_key;
              console.log('[draftGenerate] OpenAI API key loaded from Firebase config');
            }
          } catch (error) {
            console.warn('[draftGenerate] Could not load OpenAI API key from Firebase config:', error);
          }
        }

        // Verify Firebase ID token
        const userId = await verifyAuthToken(request.headers.authorization);

        // Parse request body
        const requestBody =
          typeof request.body === 'string' ? JSON.parse(request.body) : request.body;

        const { matterId, templateId, fileIds, variables } = requestBody;

        if (!matterId || !templateId || !fileIds || !Array.isArray(fileIds)) {
          response.status(400).json({
            error: 'Missing required fields: matterId, templateId, fileIds',
          });
          return;
        }

        // Create draft document immediately
        const draftRef = getDb().collection('drafts').doc();
        const draftId = draftRef.id;

        await draftRef.set({
          draftId,
          matterId,
          templateId,
          state: 'generating',
          sections: {
            facts: { content: '', generatedAt: null },
            liability: { content: '', generatedAt: null },
            damages: { content: '', generatedAt: null },
            demand: { content: '', generatedAt: null },
          },
          variables: variables || {},
          generatedBy: userId,
          lastGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastEditedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastEditedBy: userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Start draft generation asynchronously (don't wait for completion)
        // This prevents HTTP timeout issues - generation will update draft via Firestore
        console.log('[draftGenerate] Starting background generation', { draftId, matterId, templateId, fileIds });
        logger.info('[draftGenerate] Starting background generation', { draftId, matterId, templateId, fileIds });
        
        // Start background generation with explicit error handling
        console.log('[draftGenerate] About to call generateDraft function');
        generateDraft({
          matterId,
          templateId,
          fileIds,
          variables: variables || {},
          userId,
          draftId, // Pass draftId so it uses existing document
        } as any)
          .then((result) => {
            console.log('[draftGenerate] Background generation completed successfully', result);
            logger.info('[draftGenerate] Background generation completed successfully', result);
          })
          .catch((error: any) => {
            console.error('[draftGenerate] Background generation error:', error);
            console.error('[draftGenerate] Error stack:', error.stack);
            logger.error('[draftGenerate] Background generation error:', error);
            logger.error('[draftGenerate] Error stack:', error.stack);
            
            // Update draft with error message so user can see what went wrong
            const draftRef = getDb().collection('drafts').doc(draftId);
            draftRef.update({
              state: 'editing',
              error: error.message || 'Unknown error occurred during draft generation',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }).catch((updateError: any) => {
              console.error('[draftGenerate] Failed to update draft with error:', updateError);
              logger.error('[draftGenerate] Failed to update draft with error:', updateError);
            });
          });

        // Return immediately - generation will continue in background
        response.status(200).json({
          success: true,
          draftId,
          message: 'Draft generation started. Status will update automatically.',
        });
      } catch (error: any) {
        console.error('Draft generation error:', error);
        response.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });
  });

/**
 * Draft section refinement endpoint
 * POST /draftRefineSection
 * Refines a specific section of a draft using OpenAI
 */
export const draftRefineSection = functions
  .region('us-central1')
  .https.onRequest((request: functions.Request, response: functions.Response) => {
    corsHandler(request, response, async () => {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      try {
        // Verify Firebase ID token
        const userId = await verifyAuthToken(request.headers.authorization);

        // Parse request body
        const requestBody =
          typeof request.body === 'string' ? JSON.parse(request.body) : request.body;

        const { draftId, section, instruction, keepExistingContent } = requestBody;

        if (!draftId || !section || !instruction) {
          response.status(400).json({
            error: 'Missing required fields: draftId, section, instruction',
          });
          return;
        }

        if (!['facts', 'liability', 'damages', 'demand'].includes(section)) {
          response.status(400).json({
            error: 'Invalid section. Must be one of: facts, liability, damages, demand',
          });
          return;
        }

        // Refine section
        const content = await refineSection(
          draftId,
          section,
          instruction,
          keepExistingContent !== false, // Default to true
          userId
        );

        response.status(200).json({
          success: true,
          content,
        });
      } catch (error: any) {
        console.error('Section refinement error:', error);
        response.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });
  });

/**
 * Export generation endpoint
 * POST /exportGenerate
 * Generates a DOCX file from draft content
 */
export const exportGenerate = functions
  .region('us-central1')
  .https.onRequest((request: functions.Request, response: functions.Response) => {
    corsHandler(request, response, async () => {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      try {
        console.log('[ExportGenerate] Request received');
        
        // Verify Firebase ID token
        const userId = await verifyAuthToken(request.headers.authorization);
        console.log('[ExportGenerate] User authenticated:', userId);

        // Parse request body
        const requestBody =
          typeof request.body === 'string' ? JSON.parse(request.body) : request.body;

        const { draftId, matterId, content, options } = requestBody;
        console.log('[ExportGenerate] Request body:', { draftId, matterId, hasContent: !!content, options });

        if (!draftId || !matterId || !content) {
          console.error('[ExportGenerate] Missing required fields');
          response.status(400).json({
            error: 'Missing required fields: draftId, matterId, content',
          });
          return;
        }

        // Generate DOCX
        console.log('[ExportGenerate] Generating DOCX...');
        const docxBuffer = await generateDocx(content, options || {});
        console.log('[ExportGenerate] DOCX generated, size:', docxBuffer.length);

        // Create export document in Firestore
        const exportRef = getDb().collection('exports').doc();
        const exportId = exportRef.id;
        const fileName = `${matterId}-${draftId.slice(0, 8)}-${Date.now()}.docx`;
        console.log('[ExportGenerate] Export ID:', exportId, 'FileName:', fileName);

        // Calculate purge date (7 days from now)
        const purgeAt = new Date();
        purgeAt.setDate(purgeAt.getDate() + 7);

        // Upload to Firebase Storage
        console.log('[ExportGenerate] Uploading to Storage...');
        const downloadUrl = await uploadDocxToStorage(docxBuffer, exportId, fileName);
        console.log('[ExportGenerate] Upload complete, downloadUrl:', downloadUrl);

        // Save export metadata
        console.log('[ExportGenerate] Saving export metadata to Firestore...');
        await exportRef.set({
          exportId,
          draftId,
          matterId,
          fileName,
          storagePath: `exports/${exportId}/${fileName}`,
          downloadUrl,
          exportedBy: userId,
          exportedAt: admin.firestore.FieldValue.serverTimestamp(),
          purgeAt: admin.firestore.Timestamp.fromDate(purgeAt),
          isPurged: false,
        });
        console.log('[ExportGenerate] Export metadata saved');

        response.status(200).json({
          success: true,
          exportId,
          downloadUrl,
        });
      } catch (error: any) {
        console.error('[ExportGenerate] Error:', error);
        console.error('[ExportGenerate] Error stack:', error.stack);
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
export const onUserCreate = functions.auth
  .user()
  .onCreate(async (user: admin.auth.UserRecord) => {
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
 * Callable function to manually extract text from a TXT file
 * This is a workaround if the onFileCreate trigger fails
 */
export const extractTextFromFile = functions
  .region('us-central1')
  .https.onCall(async (data: { matterId: string; fileId: string }, context: functions.https.CallableContext) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { matterId, fileId } = data;
    
    try {
      logger.info('[extractTextFromFile] Starting manual extraction', { matterId, fileId });
      
      const fileRef = admin.firestore().collection('matters').doc(matterId).collection('files').doc(fileId);
      const fileDoc = await fileRef.get();
      
      if (!fileDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'File not found');
      }
      
      const fileData = fileDoc.data()!;
      
      if (fileData.type !== 'txt') {
        throw new functions.https.HttpsError('invalid-argument', 'Only TXT files supported');
      }
      
      const storage = admin.storage();
      const bucket = storage.bucket();
      const file = bucket.file(fileData.storagePath);
      
      const [exists] = await file.exists();
      if (!exists) {
        throw new functions.https.HttpsError('not-found', 'File not found in Storage');
      }
      
      const [buffer] = await file.download();
      const textContent = buffer.toString('utf-8');
      
      await fileRef.update({
        ocrText: textContent,
        ocrStatus: 'done',
        ocrPages: 1,
        ocrConfidence: 100,
      });
      
      logger.info('[extractTextFromFile] ✓ Extraction complete', { fileId, textLength: textContent.length });
      
      return { success: true, textLength: textContent.length };
      
    } catch (error: any) {
      logger.error('[extractTextFromFile] Error', { error: error.message });
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * Simple text extraction for TXT files
 * When a TXT file is uploaded, immediately extract and store its content
 */
export const onFileCreate = functions.firestore
  .document('matters/{matterId}/files/{fileId}')
  .onCreate(async (snap) => {
    const fileData = snap.data();
    
    logger.info('onFileCreate triggered', { type: fileData.type, hasPath: !!fileData.storagePath });

    // Only process TXT files
    if (fileData.type !== 'txt' || !fileData.storagePath) {
      logger.info('Skipping - not a TXT file or no path');
      return null;
    }

    try {
      logger.info('Starting extraction', { path: fileData.storagePath });
      
      // Get file from Storage
      const bucket = admin.storage().bucket();
      const file = bucket.file(fileData.storagePath);
      
      logger.info('Downloading file');
      
      // Download and read content
      const [buffer] = await file.download();
      const textContent = buffer.toString('utf-8');
      
      logger.info('Text downloaded', { length: textContent.length });
      
      // Save to Firestore
      await snap.ref.update({
        ocrText: textContent,
        ocrStatus: 'done',
      });
      
      logger.info('✓ Text saved to Firestore', { length: textContent.length });
      
    } catch (error: any) {
      logger.error('Extraction failed', { error: error.message, stack: error.stack });
      await snap.ref.update({
        ocrStatus: 'failed',
        ocrError: error.message,
      });
    }

    return null;
  });

/**
 * Callable function to update user profile
 * Allows frontend to update user role and other profile data
 */
export const updateUserProfile = functions
  .region('us-central1')
  .https.onCall(async (data: any, context: functions.https.CallableContext) => {
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

    /**
     * HTTP function to create demo template
     * Creates the standard auto accident demand letter template
     */
    export const createDemoTemplate = functions
      .region('us-central1')
      .https
      .onRequest((request: functions.Request, response: functions.Response) => {
        corsHandler(request, response, async () => {
          if (request.method !== 'POST') {
            response.status(405).json({ error: 'Method not allowed' });
            return;
          }

          try {
            // Verify Firebase ID token
            const userId = await verifyAuthToken(request.headers.authorization);
            logger.info('[createDemoTemplate] User authenticated:', { userId });

            // Check if user is attorney (only attorneys can create templates)
            try {
              const userDoc = await getDb().collection('users').doc(userId).get();
              const userData = userDoc.data();
              if (userData?.role !== 'attorney') {
                response.status(403).json({
                  error: 'Permission denied',
                  message: 'Only attorneys can create templates',
                });
                return;
              }
            } catch (error: any) {
              logger.error('[createDemoTemplate] Error verifying user role:', error);
              response.status(500).json({
                error: 'Internal server error',
                message: 'Failed to verify user role',
              });
              return;
            }

            const templateData = {
              name: 'Standard Auto Accident Demand Letter',
              description: 'Comprehensive demand letter template for auto accident cases with rear-end collisions, medical treatment, and property damage. Based on the demo case packet structure.',
              sections: {
                facts: {
                  title: 'Statement of Facts',
                  prompt: `Based on the source documents provided, create a clear, chronological narrative of the incident. Include:
- Date, time, and location of the accident
- Weather and road conditions
- Client's vehicle and direction of travel
- Defendant's vehicle and driver information
- Sequence of events leading to the collision
- Speed and impact details
- Police response and report number
- Any admissions or statements made at the scene

Use a neutral, factual tone. Organize the information chronologically. Cite specific details from the source documents such as police report numbers, vehicle information, and witness statements.`,
                  content: `On {{dateOfLoss}}, at approximately {{timeOfLoss}}, {{clientName}} was operating a {{clientVehicle}} {{direction}} on {{locationOfLoss}}. The weather conditions were {{weatherConditions}}.

[The AI will generate a detailed chronological narrative based on the source documents provided, including the sequence of events, impact details, police response, and any relevant statements or admissions.]`
                },
                liability: {
                  title: 'Liability Analysis',
                  prompt: `Based on the source documents provided, analyze the defendant's liability. Include:
- Legal theory of negligence (e.g., rear-end collision, distracted driving, failure to maintain safe distance)
- Applicable traffic laws or statutes violated
- How the defendant breached their duty of care
- Causation linking the breach to the collision
- Any aggravating factors (e.g., commercial driver, distracted driving, excessive speed)
- Evidence supporting liability (police citations, EDR data, witness statements, dashcam footage)
- Assessment of comparative fault (if applicable, otherwise state 0%)

Cite specific evidence from the source documents such as police report citations, event data recorder findings, and witness statements. Use professional legal language.`,
                  content: `The collision was caused solely by the negligence of {{defendantName}} and/or their driver {{driverName}}.

[The AI will generate a detailed liability analysis based on the source documents, including:
- Legal theory of negligence
- Applicable laws violated
- Evidence supporting liability
- Assessment of fault]`
                },
                damages: {
                  title: 'Damages',
                  prompt: `Based on the source documents provided, itemize all damages. Include:

**Medical Specials:**
- List all medical providers, dates of service, and amounts billed
- Itemize ER visits, doctor visits, physical therapy, imaging studies, medications
- Calculate total medical specials
- Note which bills are paid vs. outstanding

**Wage Loss:**
- Client's occupation and hourly rate
- Dates and hours missed from work
- Calculation of lost wages
- Include partial days if applicable

**Property Damage:**
- Vehicle repair costs (itemize if available)
- Rental car expenses
- Total property damage

**Pain and Suffering:**
- Description of injuries and symptoms
- Impact on daily life, sleep, work, and activities
- Duration of symptoms and treatment
- Emotional impact (anxiety, fear of driving, etc.)
- Loss of enjoyment of activities

**Total Demand:**
- Sum of all economic damages
- Non-economic damages assessment
- Total settlement demand amount

Extract specific dollar amounts, dates, and details from the source documents. Be precise with calculations.`,
                  content: '{{clientName}} has incurred the following damages as a result of this collision:\n\n' +
                    '**Medical Specials:**\n' +
                    '[The AI will generate an itemized list of all medical bills, providers, dates, and amounts based on the source documents.]\n\n' +
                    '**Wage Loss:**\n' +
                    '[The AI will calculate lost wages based on employment information, hours missed, and hourly rate from the source documents.]\n\n' +
                    '**Property Damage:**\n' +
                    '[The AI will itemize vehicle repair costs and rental expenses from the source documents.]\n\n' +
                    '**Pain and Suffering:**\n' +
                    '[The AI will describe the impact of injuries on the client\'s life based on medical records and treatment notes in the source documents.]\n\n' +
                    '**Total Economic Damages:** ${{totalEconomicDamages}}\n' +
                    '**Non-Economic Damages:** [Based on severity and duration of injuries]\n' +
                    '**Total Settlement Demand:** ${{demandAmount}}'
                },
                demand: {
                  title: 'Settlement Demand',
                  prompt: `Based on the damages calculated and the source documents, create a professional settlement demand. Include:
- Clear statement of the total demand amount (use variable {{demandAmount}})
- Reference to the evidence and documentation provided
- Professional but firm tone
- Deadline for response (typically 30 days from date of letter)
- Consequences of non-response (litigation)
- Request for policy limits information if applicable
- Professional closing

Maintain a professional, respectful tone while being clear about the seriousness of the matter.`,
                  content: 'Based on the foregoing, we demand settlement in the amount of ${{demandAmount}} to resolve this matter. This demand is inclusive of all damages, including but not limited to medical expenses, lost wages, property damage, and pain and suffering.\n\n' +
                    'We have provided documentation supporting this demand, including medical records, bills, wage loss documentation, and property damage estimates. We are prepared to provide additional documentation upon request.\n\n' +
                    'We request a response to this demand within thirty (30) days from the date of this letter. If we do not receive a satisfactory response within this timeframe, we will have no alternative but to pursue litigation to protect our client\'s interests.\n\n' +
                    'Please contact us to discuss this matter further. We are available to negotiate in good faith to reach a fair resolution.\n\n' +
                    'Very truly yours,\n\n' +
                    '[Attorney Name]\n' +
                    '[Law Firm Name]\n' +
                    '[Contact Information]'
                }
              },
              variables: [
                {
                  name: 'clientName',
                  label: 'Client Name',
                  type: 'text',
                  required: true,
                  defaultValue: null
                },
                {
                  name: 'dateOfLoss',
                  label: 'Date of Loss',
                  type: 'date',
                  required: true,
                  defaultValue: null
                },
                {
                  name: 'timeOfLoss',
                  label: 'Time of Loss',
                  type: 'text',
                  required: false,
                  defaultValue: null
                },
                {
                  name: 'locationOfLoss',
                  label: 'Location of Loss',
                  type: 'text',
                  required: true,
                  defaultValue: null
                },
                {
                  name: 'weatherConditions',
                  label: 'Weather Conditions',
                  type: 'text',
                  required: false,
                  defaultValue: null
                },
                {
                  name: 'clientVehicle',
                  label: 'Client Vehicle',
                  type: 'text',
                  required: false,
                  defaultValue: null
                },
                {
                  name: 'direction',
                  label: 'Direction of Travel',
                  type: 'text',
                  required: false,
                  defaultValue: null
                },
                {
                  name: 'defendantName',
                  label: 'Defendant/Insured Name',
                  type: 'text',
                  required: true,
                  defaultValue: null
                },
                {
                  name: 'driverName',
                  label: 'Driver Name',
                  type: 'text',
                  required: false,
                  defaultValue: null
                },
                {
                  name: 'demandAmount',
                  label: 'Settlement Demand Amount',
                  type: 'number',
                  required: true,
                  defaultValue: null
                },
                {
                  name: 'totalEconomicDamages',
                  label: 'Total Economic Damages',
                  type: 'number',
                  required: false,
                  defaultValue: null
                }
              ],
              createdBy: userId,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                isActive: true,
            };

            const docRef = await getDb().collection('templates').add(templateData);
            logger.log(`Demo template created by ${userId} with ID: ${docRef.id}`);

            response.status(200).json({
              success: true,
              templateId: docRef.id,
            });
          } catch (error: any) {
            logger.error('[createDemoTemplate] Error:', error);
            response.status(500).json({
              error: 'Internal server error',
              message: error.message || 'Failed to create template',
            });
          }
        });
      });

    // Export retention functions
    export { retentionPurge, manualPurge };
