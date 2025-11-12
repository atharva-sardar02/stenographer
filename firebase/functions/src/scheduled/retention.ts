import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';

/**
 * Retention purge job
 * Runs daily at midnight to purge files and exports older than 7 days
 */
export const retentionPurge = functions
  .region('us-central1')
  .pubsub
  .schedule('every day 00:00')
  .timeZone('America/New_York')
  .onRun(async (_context) => {
    const db = admin.firestore();
    const storage = getStorage();
    const bucket = storage.bucket();
    const now = admin.firestore.Timestamp.now();
    const sevenDaysAgo = new Date(now.toMillis() - 7 * 24 * 60 * 60 * 1000);
    const purgeTimestamp = admin.firestore.Timestamp.fromDate(sevenDaysAgo);

    let filesPurged = 0;
    let exportsPurged = 0;
    let bytesFreed = 0;
    const errors: string[] = [];

    try {
      // Purge files
      const filesQuery = await db
        .collectionGroup('files')
        .where('purgeAt', '<=', purgeTimestamp)
        .where('isPurged', '==', false)
        .limit(500) // Process in batches
        .get();

      for (const fileDoc of filesQuery.docs) {
        try {
          const fileData = fileDoc.data();
          const storagePath = fileData.storagePath;

          // Delete from Storage
          if (storagePath) {
            const file = bucket.file(storagePath);
            const [exists] = await file.exists();
            if (exists) {
              const [metadata] = await file.getMetadata();
              const size = typeof metadata.size === 'number' ? metadata.size : parseInt(String(metadata.size || '0'), 10);
              bytesFreed += size;
              await file.delete();
            }
          }

          // Mark as purged in Firestore
          await fileDoc.ref.update({
            isPurged: true,
            purgedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          filesPurged++;
        } catch (error: any) {
          errors.push(`File ${fileDoc.id}: ${error.message}`);
          console.error(`Error purging file ${fileDoc.id}:`, error);
        }
      }

      // Purge exports
      const exportsQuery = await db
        .collection('exports')
        .where('purgeAt', '<=', purgeTimestamp)
        .where('isPurged', '==', false)
        .limit(500)
        .get();

      for (const exportDoc of exportsQuery.docs) {
        try {
          const exportData = exportDoc.data();
          const storagePath = exportData.storagePath;

          // Delete from Storage
          if (storagePath) {
            const file = bucket.file(storagePath);
            const [exists] = await file.exists();
            if (exists) {
              const [metadata] = await file.getMetadata();
              const size = typeof metadata.size === 'number' ? metadata.size : parseInt(String(metadata.size || '0'), 10);
              bytesFreed += size;
              await file.delete();
            }
          }

          // Mark as purged in Firestore
          await exportDoc.ref.update({
            isPurged: true,
            purgedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          exportsPurged++;
        } catch (error: any) {
          errors.push(`Export ${exportDoc.id}: ${error.message}`);
          console.error(`Error purging export ${exportDoc.id}:`, error);
        }
      }

      const summary = {
        timestamp: now.toDate().toISOString(),
        filesPurged,
        exportsPurged,
        bytesFreed,
        errors: errors.length > 0 ? errors : undefined,
      };

      console.log('Retention purge completed:', summary);
      return summary;
    } catch (error: any) {
      console.error('Retention purge job error:', error);
      throw error;
    }
  });

/**
 * Manual purge endpoint (for testing)
 * POST /api/v1/retention:purge
 */
export const manualPurge = functions
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
      // TODO: Verify Firebase ID token (admin only)
      const { dryRun = false, olderThanDays = 7 } = request.body || {};

      if (dryRun) {
        // Return summary without deleting
        const db = admin.firestore();
        const now = admin.firestore.Timestamp.now();
        const cutoffDate = new Date(now.toMillis() - olderThanDays * 24 * 60 * 60 * 1000);
        const purgeTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);

        const filesQuery = await db
          .collectionGroup('files')
          .where('purgeAt', '<=', purgeTimestamp)
          .where('isPurged', '==', false)
          .get();

        const exportsQuery = await db
          .collection('exports')
          .where('purgeAt', '<=', purgeTimestamp)
          .where('isPurged', '==', false)
          .get();

        response.status(200).json({
          dryRun: true,
          filesToPurge: filesQuery.size,
          exportsToPurge: exportsQuery.size,
          cutoffDate: cutoffDate.toISOString(),
        });
        return;
      }

      // Actual purge (call the scheduled function logic)
      // For now, return a placeholder
      response.status(200).json({
        message: 'Manual purge endpoint - implementation pending',
        note: 'Use the scheduled retentionPurge function for actual purging',
      });
    } catch (error: any) {
      console.error('Manual purge error:', error);
      response.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  });

