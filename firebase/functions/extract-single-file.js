const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'stenographer-dev',
  storageBucket: 'stenographer-dev.firebasestorage.app',
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();
console.log('Firestore initialized');

const storage = admin.storage();
console.log('Storage initialized');

async function extractText(matterId, fileId) {
  console.log(`\n=== EXTRACTING TEXT ===`);
  console.log(`Matter: ${matterId}`);
  console.log(`File: ${fileId}\n`);
  
  try {
    // First, list all files to see what's actually there
    console.log('Listing all files in subcollection...');
    const filesRef = db.collection('matters').doc(matterId).collection('files');
    const allFiles = await filesRef.get();
    console.log(`Found ${allFiles.size} file(s) total\n`);
    
    allFiles.forEach(doc => {
      console.log(`- ${doc.id}: ${doc.data().name}`);
    });
    console.log('');
    
    const fileRef = db.collection('matters').doc(matterId).collection('files').doc(fileId);
    const fileDoc = await fileRef.get();
    
    if (!fileDoc.exists) {
      console.error('❌ Specific file not found in Firestore');
      return;
    }
    
    const fileData = fileDoc.data();
    console.log(`File name: ${fileData.name}`);
    console.log(`Storage path: ${fileData.storagePath}`);
    console.log(`Current ocrText: ${fileData.ocrText ? `${fileData.ocrText.length} chars` : 'null'}\n`);
    
    // Download from Storage
    console.log('Downloading from Storage...');
    const file = storage.bucket().file(fileData.storagePath);
    const [exists] = await file.exists();
    
    if (!exists) {
      console.error('❌ File not found in Storage!');
      return;
    }
    
    const [buffer] = await file.download();
    const text = buffer.toString('utf-8');
    
    console.log(`✓ Downloaded ${text.length} characters\n`);
    console.log('First 200 characters:');
    console.log(text.substring(0, 200) + '...\n');
    
    // Update Firestore
    console.log('Updating Firestore...');
    await fileRef.update({
      ocrText: text,
      ocrStatus: 'done',
      ocrPages: 1,
      ocrConfidence: 100
    });
    
    console.log('✓ SUCCESS! Text extracted and saved to Firestore\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

const matterId = process.argv[2];
const fileId = process.argv[3];

if (!matterId || !fileId) {
  console.log('Usage: node extract-single-file.js <matterId> <fileId>');
  console.log('Example: node extract-single-file.js TLsICZdXgD7qRIrvMSND uvvNKDYd0beKIgiphkBF');
  process.exit(1);
}

extractText(matterId, fileId);

