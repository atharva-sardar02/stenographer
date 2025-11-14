// Quick script to update the existing file
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json'); // We'll use console instead

// For console.firebase.google.com Firestore Data Editor:
console.log(`
===========================================
MANUAL FIRESTORE UPDATE INSTRUCTIONS
===========================================

1. Go to: https://console.firebase.google.com/project/stenographer-dev/firestore/data/~2Fmatters~2FTLsICZdXgD7qRIrvMSND~2Ffiles~2FuvvNKDYdObeKIgiphkBF

2. Click on the document "uvvNKDYdObeKIgiphkBF"

3. Edit these fields:
   - ocrStatus: Change from "null" to "done" (string)
   - ocrPages: Add new field, type: number, value: 1
   - ocrConfidence: Add new field, type: number, value: 100
   - ocrText: Add new field, type: string, value: [PASTE THE TEXT FROM demo-case.txt]

4. Click "Update"

OR... I can create a script that uses the Firebase Admin SDK if you have a service account key.

===========================================
`);


