const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'stenographer-dev',
  storageBucket: 'stenographer-dev.firebasestorage.app'
});

const db = admin.firestore();
const storage = admin.storage();

// The content from demo-case.txt
const demoText = `DEMAND LETTER INPUTS — DEMO CASE PACKET This is a demo document containing realistic, synthetic facts that an attorney or paralegal might upload to generate a draft demand letter. Replace placeholders with real case data. 1) Client & Case Metadata Client Name Jordan Patel Date of Birth 07/14/1993 Address 1420 Oak Crest Dr, Unit 3C, Austin, TX 78741 Phone / Email (512) 555-0186 • jordan.patel@example.com Insured/Defendant Riverside Logistics, LLC (Driver: Marcus Dean) Claim No. RL-2025-AC-01987 Date of Loss (DOL) 02/18/2025 Location of Loss I-35 S @ Riverside Dr, Austin, TX Weather/Conditions Clear, dry pavement Police Report No. APD #25-0218-9331 2) Incident Summary On February 18, 2025, at approximately 5:40 PM, Jordan Patel was driving a 2018 Honda Civic southbound on I‑35 in the middle lane near the Riverside Dr exit. Traffic slowed abruptly; Jordan decelerated safely. A Riverside Logistics box truck (USDOT 3482191) following behind failed to maintain a safe distance and rear‑ended Jordan's vehicle at an estimated 25–30 mph. The impact pushed Jordan's vehicle forward ~15 feet. Airbags did not deploy. APD responded; the truck driver admitted he was 'checking the onboard tablet' at the time of impact. 3) Liability Evidence • Police Report APD #25-0218-9331 cites the truck driver for failure to control speed (Transp. Code 545.351). • Dashcam stills from a nearby rideshare show the truck closing distance without braking for ~3 seconds pre‑impact. • Event Data Recorder (EDR) from the truck indicates throttle at 22% and no brake application until <0.6s before contact. • Two independent eyewitness statements corroborate inattentive driving and tailgating. 4) Injuries & Symptoms Primary: Cervical strain/sprain (whiplash), lumbar myofascial pain, concussion (mild, no LOC). Secondary: Left shoulder tendinopathy; headaches; sleep disturbance; anxiety while driving. 5) Treatment Timeline (Medical Chronology) Date Provider/Facility Diagnosis/Services Notes 02/18/2025 St. David's ER CT head; X‑ray C‑spine; meds No acute fx; Dx: cervical strain, concussion (mild) 02/21/2025 Austin Ortho Clinic Ortho eval Prescribed PT 3x/week x 8 weeks; MRI shoulder ordered 03/03/2025 ATX Physical Therapy PT eval + sessions ROM deficits; HEP given 03/12/2025 Imaging Center MRI left shoulder Supraspinatus tendinopathy; no full‑thickness tear 04/18/2025 ATX Physical Therapy Ongoing PT Gradual improvement; headaches persist 05/22/2025 Austin Ortho Clinic Follow‑up PT extended x 4 weeks; work restrictions eased 6) Medical Specials (Bills to Date) Provider Billed Paid/Outstanding St. David's ER $3,250.00 $3,250.00 (paid via PIP) Austin Ortho Clinic $1,420.00 $1,420.00 (outstanding) ATX Physical Therapy (12 visits) $2,160.00 $2,160.00 (outstanding) Imaging Center (MRI) $1,080.00 $1,080.00 (outstanding) Subtotal medical specials to date: $7,910.00 7) Wage Loss Client works as a Customer Success Associate at ClearPath Software earning $27.50/hour. Missed 6 full days and 4 partial days on light duty between 02/19/2025 and 03/10/2025. Dates Hours Lost Amount 02/19–02/25/2025 (3 days) 24 $660.00 02/26–03/01/2025 (3 days) 24 $660.00 Partial days (4x 3 hrs) 12 $330.00 Total wage loss to date: $1,650.00 8) Property Damage Rear bumper cover, energy absorber, and reinforcement bar replaced; trunk alignment corrected. Body shop estimate: $2,980.17. Rental car for 5 days at $38/day. 9) Pain & Suffering — Narrative Highlights • Persistent neck stiffness and headaches impacting sleep 3–4 nights/week for two months post‑collision. • Anxiety while merging/braking in freeway traffic; client avoids driving after dusk. • Missed planned half‑marathon; temporarily stopped gym routine, resulting in decreased overall well‑being. 10) Insurance Information At‑Fault Insurer Pioneer Casualty Insurance Policy No. PCI‑TX‑442198‑B BI Limits $100,000 / $300,000 Adjuster Cameron Lee, Senior Adjuster Adjuster Email cameron.lee@pioneer‑cas.com Adjuster Phone (737) 555‑2297 11) Demand Framing (For LLM) • Theory of liability: rear‑end + distracted driving; clear negligence, comparative fault 0%. • Aggravating factor: commercial driver using onboard tablet while moving. • Ask: Include citations to evidence (police report, EDR, eyewitnesses) and clear, professional tone. • Settlement posture: Opening demand $62,500 inclusive of fees/costs; reserve discretion to negotiate to mid‑$40k range. • Non‑economic damages: Emphasize headaches, sleep disturbance, driving anxiety, loss of enjoyment. 12) Attachments Checklist (Placeholders) ☑ APD Police Report #25-0218-9331 (PDF) ☑ ER records & itemized bill (PDF) ☑ PT records (PDF) ☑ MRI report (PDF) ☑ Body shop estimate & photos (PDF/Images) ☑ Employer wage verification letter (PDF) Note: This file is synthetic demo content for testing. Names, numbers, and entities are fictitious.`;

async function fixExistingFile() {
  const matterId = 'TLsICZdXgD7qRIrvMSND';
  const fileId = 'uvvNKDYdObeKIgiphkBF';
  
  console.log('\n=== FIXING EXISTING FILE ===\n');
  
  try {
    const fileRef = db.collection('matters').doc(matterId).collection('files').doc(fileId);
    
    console.log(`Updating file: ${fileId}`);
    console.log(`Text length: ${demoText.length} characters\n`);
    
    await fileRef.update({
      ocrText: demoText,
      ocrStatus: 'done',
      ocrPages: 1,
      ocrConfidence: 100
    });
    
    console.log('✅ SUCCESS! File updated in Firestore.');
    console.log('\nNow try generating a draft - it should work!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nIf this fails, just upload a NEW file instead.\n');
  }
}

fixExistingFile();


