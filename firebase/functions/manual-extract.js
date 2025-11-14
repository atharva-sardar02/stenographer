const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'stenographer-dev',
  storageBucket: 'stenographer-dev.firebasestorage.app'
});

const db = admin.firestore();
const storage = admin.storage();

async function extractTextForMatter(matterId) {
  console.log(`\n=== EXTRACTING TEXT FOR MATTER: ${matterId} ===\n`);
  
  try {
    const filesRef = db.collection('matters').doc(matterId).collection('files');
    const snapshot = await filesRef.where('type', '==', 'txt').get();
    
    console.log(`Found ${snapshot.size} TXT file(s)\n`);
    
    for (const doc of snapshot.docs) {
      const fileData = doc.data();
      console.log(`─────────────────────────────────────────────`);
      console.log(`File: ${fileData.name}`);
      
      if (!fileData.ocrText || fileData.ocrText.trim().length === 0) {
        try {
          console.log(`  Extracting text...`);
          const file = storage.bucket().file(fileData.storagePath);
          const [buffer] = await file.download();
          const text = buffer.toString('utf-8');
          
          await doc.ref.update({
            ocrText: text,
            ocrStatus: 'done',
            ocrPages: 1,
            ocrConfidence: 100
          });
          
          console.log(`  ✓ SUCCESS: Extracted ${text.length} characters`);
        } catch (e) {
          console.error(`  ✗ ERROR: ${e.message}`);
        }
      } else {
        console.log(`  - Already has text (${fileData.ocrText.length} characters)`);
      }
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    console.log(`\n=== EXTRACTION COMPLETE ===\n`);
  }
}

const matterId = process.argv[2];
if (!matterId) {
  console.log('Usage: node manual-extract.js <matterId>');
  console.log('Example: node manual-extract.js TLsICZdXgD7qRIrvMSND');
  process.exit(1);
}

extractTextForMatter(matterId);


