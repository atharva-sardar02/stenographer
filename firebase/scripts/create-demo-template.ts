import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

const demoTemplate = {
  name: 'Standard Auto Accident Demand Letter',
  description: 'Comprehensive demand letter template for auto accident cases with rear-end collisions, medical treatment, and property damage.',
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
      content: `{{clientName}} has incurred the following damages as a result of this collision:

**Medical Specials:**
[The AI will generate an itemized list of all medical bills, providers, dates, and amounts based on the source documents.]

**Wage Loss:**
[The AI will calculate lost wages based on employment information, hours missed, and hourly rate from the source documents.]

**Property Damage:**
[The AI will itemize vehicle repair costs and rental expenses from the source documents.]

**Pain and Suffering:**
[The AI will describe the impact of injuries on the client's life based on medical records and treatment notes in the source documents.]

**Total Economic Damages:** ${{totalEconomicDamages}}
**Non-Economic Damages:** [Based on severity and duration of injuries]
**Total Settlement Demand:** ${{demandAmount}}`
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
      content: `Based on the foregoing, we demand settlement in the amount of ${{demandAmount}} to resolve this matter. This demand is inclusive of all damages, including but not limited to medical expenses, lost wages, property damage, and pain and suffering.

We have provided documentation supporting this demand, including medical records, bills, wage loss documentation, and property damage estimates. We are prepared to provide additional documentation upon request.

We request a response to this demand within thirty (30) days from the date of this letter. If we do not receive a satisfactory response within this timeframe, we will have no alternative but to pursue litigation to protect our client's interests.

Please contact us to discuss this matter further. We are available to negotiate in good faith to reach a fair resolution.

Very truly yours,

[Attorney Name]
[Law Firm Name]
[Contact Information]`
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
  isActive: true
};

async function createTemplate() {
  try {
    // You'll need to provide a userId - using a placeholder for now
    // In production, this would be set by the authenticated user
    const userId = 'system'; // Replace with actual user ID or get from auth
    
    const templateData = {
      ...demoTemplate,
      createdBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('templates').add(templateData);
    console.log('Template created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createTemplate()
    .then(() => {
      console.log('Template creation complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Template creation failed:', error);
      process.exit(1);
    });
}

export { createTemplate, demoTemplate };


