const admin = require('firebase-admin');

// Initialize Firebase Admin with explicit project ID and correct bucket
admin.initializeApp({
  projectId: 'stenographer-dev',
  storageBucket: 'stenographer-dev.firebasestorage.app'
});

const db = admin.firestore();
const storage = admin.storage();

async function diagnoseFiles(matterId) {
  console.log('\n=== DIAGNOSING FILES FOR MATTER:', matterId, '===\n');
  
  try {
    // Get all files for this matter
    const filesSnapshot = await db
      .collection('matters')
      .doc(matterId)
      .collection('files')
      .get();
    
    if (filesSnapshot.empty) {
      console.log('❌ No files found in Firestore for this matter');
      return;
    }
    
    console.log(`✓ Found ${filesSnapshot.size} file(s) in Firestore\n`);
    
    for (const fileDoc of filesSnapshot.docs) {
      const fileData = fileDoc.data();
      console.log('─────────────────────────────────────────────');
      console.log('File ID:', fileDoc.id);
      console.log('File Name:', fileData.name);
      console.log('File Type:', fileData.type);
      console.log('Storage Path:', fileData.storagePath);
      console.log('OCR Status:', fileData.ocrStatus);
      console.log('OCR Text Length:', fileData.ocrText ? fileData.ocrText.length : 0);
      
      if (fileData.ocrText) {
        console.log('OCR Text Preview:', fileData.ocrText.substring(0, 200));
      }
      
      // Check if file exists in Storage
      if (fileData.storagePath) {
        try {
          const bucket = storage.bucket();
          const file = bucket.file(fileData.storagePath);
          const [exists] = await file.exists();
          
          if (exists) {
            console.log('✓ File EXISTS in Firebase Storage');
            
            // Try to download and read content
            try {
              const [buffer] = await file.download();
              const textContent = buffer.toString('utf-8');
              console.log('✓ Successfully downloaded file');
              console.log('File size (bytes):', buffer.length);
              console.log('Text length (chars):', textContent.length);
              console.log('First 300 chars:', textContent.substring(0, 300));
            } catch (downloadError) {
              console.log('❌ Error downloading file:', downloadError.message);
            }
          } else {
            console.log('❌ File DOES NOT EXIST in Firebase Storage at path:', fileData.storagePath);
          }
        } catch (storageError) {
          console.log('❌ Error checking Storage:', storageError.message);
        }
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Get matter ID from command line or use default
const matterId = process.argv[2];

if (!matterId) {
  console.log('Usage: node diagnose-files.js <matterId>');
  console.log('Example: node diagnose-files.js abc123');
  process.exit(1);
}

diagnoseFiles(matterId).then(() => {
  console.log('\n=== DIAGNOSIS COMPLETE ===\n');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

