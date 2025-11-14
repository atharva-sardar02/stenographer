const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'stenographer-dev',
  storageBucket: 'stenographer-dev.firebasestorage.app',
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function checkFile() {
  const matterId = 'TLsICZdXgD7qRIrvMSND';
  
  // List all files
  const filesRef = db.collection('matters').doc(matterId).collection('files');
  const snapshot = await filesRef.get();
  
  console.log(`\nFound ${snapshot.size} files:\n`);
  
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`--- File: ${doc.id} ---`);
    console.log('  Name:', data.name);
    console.log('  Type:', data.type);
    console.log('  OCR Status:', data.ocrStatus || 'null');
    console.log('  OCR Text length:', data.ocrText ? data.ocrText.length : 0);
    if (data.ocrText && data.name === 'text-success.txt') {
      console.log('  Text preview:', data.ocrText.substring(0, 300));
    }
    console.log('');
  });
}

checkFile().catch(console.error);

