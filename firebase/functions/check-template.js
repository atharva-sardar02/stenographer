const admin = require('firebase-admin');

// Initialize Firebase Admin with correct bucket
admin.initializeApp({
  projectId: 'stenographer-dev',
  storageBucket: 'stenographer-dev.firebasestorage.app'
});

const db = admin.firestore();

async function checkTemplate(templateId) {
  try {
    const templateDoc = await db.collection('templates').doc(templateId).get();
    
    if (!templateDoc.exists) {
      console.log('❌ Template not found');
      return;
    }
    
    const template = templateDoc.data();
    console.log('\n=== TEMPLATE:', template.name, '===\n');
    
    console.log('📄 FACTS SECTION:');
    console.log('Prompt:', template.sections.facts.prompt);
    console.log('\n---\n');
    
    console.log('⚖️  LIABILITY SECTION:');
    console.log('Prompt:', template.sections.liability.prompt);
    console.log('\n---\n');
    
    console.log('💰 DAMAGES SECTION:');
    console.log('Prompt:', template.sections.damages.prompt);
    console.log('\n---\n');
    
    console.log('📨 DEMAND SECTION:');
    console.log('Prompt:', template.sections.demand.prompt);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get template ID from command line
const templateId = process.argv[2];

if (!templateId) {
  console.log('Usage: node check-template.js <templateId>');
  console.log('\nTo find template ID, check your Firestore templates collection');
  process.exit(1);
}

checkTemplate(templateId).then(() => process.exit(0));


