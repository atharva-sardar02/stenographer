"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
async function createTemplates() {
    const userId = 'system'; // System user for auto-created templates
    // Template 1: Slip and Fall Demand Letter
    const slipAndFallTemplate = {
        name: 'Slip and Fall Demand Letter',
        description: 'Comprehensive demand letter template for slip and fall accidents, including premises liability, negligence, and injury documentation.',
        sections: {
            facts: {
                title: 'Statement of Facts',
                prompt: `Based on the source documents provided, create a clear, chronological narrative of the slip and fall incident. Include:
- Date, time, and exact location of the incident
- Weather conditions and lighting
- Condition of the walking surface (wet, uneven, debris, etc.)
- Client's activity at the time (walking, shopping, etc.)
- What the client was wearing (shoes, clothing)
- How the fall occurred (sequence of events)
- Immediate injuries and symptoms
- Witness information and statements
- Property owner/manager response
- Any photographs or evidence collected
- Medical attention sought

Use a neutral, factual tone. Organize the information chronologically. Cite specific details from the source documents such as incident reports, witness statements, and medical records.`,
                content: `On {{dateOfIncident}}, at approximately {{timeOfIncident}}, {{clientName}} was {{activityDescription}} at {{locationOfIncident}} when they slipped and fell due to {{hazardousCondition}}.

[The AI will generate a detailed chronological narrative based on the source documents provided, including the sequence of events, hazardous conditions, witness statements, and immediate response.]`
            },
            liability: {
                title: 'Premises Liability Analysis',
                prompt: `Based on the source documents provided, analyze the property owner's liability. Include:
- Legal theory of premises liability (duty of care, breach, causation, damages)
- Applicable state laws or statutes regarding property maintenance
- How the property owner breached their duty of care (failure to maintain, warn, or inspect)
- Notice of the dangerous condition (actual or constructive notice)
- Causation linking the breach to the fall and injuries
- Any aggravating factors (repeated incidents, known hazards, lack of warning signs)
- Evidence supporting liability (incident reports, maintenance records, witness statements, photographs)
- Assessment of comparative fault (if applicable, otherwise state 0%)

Cite specific evidence from the source documents such as incident reports, maintenance logs, witness statements, and photographs. Use professional legal language.`,
                content: `The fall and resulting injuries were caused solely by the negligence of {{propertyOwnerName}} and/or their agents, employees, or representatives.

[The AI will generate a detailed premises liability analysis based on the source documents, including:
- Legal theory of negligence
- Breach of duty of care
- Evidence supporting liability
- Assessment of fault]`
            },
            damages: {
                title: 'Damages',
                prompt: `Based on the source documents provided, itemize all damages. Include:

**Medical Specials:**
- List all medical providers, dates of service, and amounts billed
- Itemize ER visits, doctor visits, physical therapy, imaging studies, medications, surgeries
- Calculate total medical specials
- Note which bills are paid vs. outstanding
- Future medical expenses if applicable

**Wage Loss:**
- Client's occupation and hourly rate/salary
- Dates and hours missed from work
- Calculation of lost wages
- Loss of future earning capacity if applicable
- Include partial days if applicable

**Property Damage:**
- Damage to personal property (clothing, phone, etc.)
- Replacement or repair costs

**Pain and Suffering:**
- Description of injuries and symptoms
- Impact on daily life, sleep, work, and activities
- Duration of symptoms and treatment
- Emotional impact (fear, anxiety, depression, loss of independence)
- Loss of enjoyment of activities
- Permanent impairment or disability if applicable

**Total Demand:**
- Sum of all economic damages
- Non-economic damages assessment
- Total settlement demand amount

Extract specific dollar amounts, dates, and details from the source documents. Be precise with calculations.`,
                content: `{{clientName}} has incurred the following damages as a result of this slip and fall incident:

**Medical Specials:**
[The AI will generate an itemized list of all medical bills, providers, dates, and amounts based on the source documents.]

**Wage Loss:**
[The AI will calculate lost wages based on employment information, hours missed, and compensation rate from the source documents.]

**Property Damage:**
[The AI will itemize any property damage costs from the source documents.]

**Pain and Suffering:**
[The AI will describe the impact of injuries on the client's life based on medical records and treatment notes in the source documents.]

**Total Economic Damages:** $\${totalEconomicDamages}
**Non-Economic Damages:** [Based on severity and duration of injuries]
**Total Settlement Demand:** $\${demandAmount}`
            },
            demand: {
                title: 'Settlement Demand',
                prompt: `Based on the damages calculated and the source documents, create a professional settlement demand. Include:
- Clear statement of the total demand amount (use variable \${demandAmount})
- Reference to the evidence and documentation provided
- Professional but firm tone
- Deadline for response (typically 30 days from date of letter)
- Consequences of non-response (litigation)
- Request for insurance information if applicable
- Professional closing

Maintain a professional, respectful tone while being clear about the seriousness of the matter.`,
                content: `Based on the foregoing, we demand settlement in the amount of $\${demandAmount} to resolve this matter. This demand is inclusive of all damages, including but not limited to medical expenses, lost wages, property damage, and pain and suffering.

We have provided documentation supporting this demand, including medical records, bills, wage loss documentation, incident reports, and photographs. We are prepared to provide additional documentation upon request.

We request a response to this demand within thirty (30) days from the date of this letter. If we do not receive a satisfactory response within this timeframe, we will have no alternative but to pursue litigation to protect our client's interests.

Please contact us to discuss this matter further. We are available to negotiate in good faith to reach a fair resolution.

Very truly yours,

[Attorney Name]
[Law Firm Name]
[Contact Information]`
            }
        },
        variables: [
            { name: 'clientName', label: 'Client Name', type: 'text', required: true, defaultValue: null },
            { name: 'dateOfIncident', label: 'Date of Incident', type: 'date', required: true, defaultValue: null },
            { name: 'timeOfIncident', label: 'Time of Incident', type: 'text', required: false, defaultValue: null },
            { name: 'locationOfIncident', label: 'Location of Incident', type: 'text', required: true, defaultValue: null },
            { name: 'activityDescription', label: 'Client Activity', type: 'text', required: false, defaultValue: null },
            { name: 'hazardousCondition', label: 'Hazardous Condition', type: 'text', required: false, defaultValue: null },
            { name: 'propertyOwnerName', label: 'Property Owner/Defendant Name', type: 'text', required: true, defaultValue: null },
            { name: 'demandAmount', label: 'Settlement Demand Amount', type: 'number', required: true, defaultValue: null },
            { name: 'totalEconomicDamages', label: 'Total Economic Damages', type: 'number', required: false, defaultValue: null }
        ],
        createdBy: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
    };
    // Template 2: Workplace Injury Demand Letter
    const workplaceInjuryTemplate = {
        name: 'Workplace Injury Demand Letter',
        description: 'Comprehensive demand letter template for workplace injuries, including employer negligence, OSHA violations, and workers compensation considerations.',
        sections: {
            facts: {
                title: 'Statement of Facts',
                prompt: `Based on the source documents provided, create a clear, chronological narrative of the workplace injury. Include:
- Date, time, and exact location of the incident
- Client's job title, department, and duties
- Description of the work being performed at the time
- Equipment, machinery, or tools involved
- Safety procedures that should have been followed
- How the injury occurred (sequence of events)
- Immediate injuries and symptoms
- Witness information and statements
- Employer response and incident reporting
- OSHA reporting requirements (if applicable)
- Medical attention sought
- Return to work status

Use a neutral, factual tone. Organize the information chronologically. Cite specific details from the source documents such as incident reports, witness statements, medical records, and OSHA reports.`,
                content: `On {{dateOfInjury}}, at approximately {{timeOfInjury}}, {{clientName}} was performing their duties as a {{jobTitle}} at {{employerName}} when they sustained injuries due to {{causeOfInjury}}.

[The AI will generate a detailed chronological narrative based on the source documents provided, including the sequence of events, workplace conditions, safety violations, and immediate response.]`
            },
            liability: {
                title: 'Employer Negligence Analysis',
                prompt: `Based on the source documents provided, analyze the employer's liability. Include:
- Legal theory of employer negligence (duty to provide safe workplace, breach, causation, damages)
- Applicable OSHA regulations or state workplace safety laws violated
- How the employer breached their duty of care (failure to train, maintain equipment, provide safety equipment, or follow safety protocols)
- Notice of the dangerous condition or unsafe practice
- Causation linking the breach to the injury
- Any aggravating factors (repeated violations, willful disregard for safety, lack of safety training)
- Evidence supporting liability (incident reports, OSHA citations, safety inspection records, witness statements)
- Assessment of comparative fault (if applicable, otherwise state 0%)

Cite specific evidence from the source documents such as incident reports, OSHA citations, safety inspection records, witness statements, and training records. Use professional legal language.`,
                content: `The workplace injury and resulting damages were caused solely by the negligence of {{employerName}} and/or their agents, employees, or representatives.

[The AI will generate a detailed employer negligence analysis based on the source documents, including:
- Legal theory of negligence
- OSHA or safety law violations
- Evidence supporting liability
- Assessment of fault]`
            },
            damages: {
                title: 'Damages',
                prompt: `Based on the source documents provided, itemize all damages. Include:

**Medical Specials:**
- List all medical providers, dates of service, and amounts billed
- Itemize ER visits, doctor visits, physical therapy, imaging studies, medications, surgeries
- Calculate total medical specials
- Note which bills are paid vs. outstanding
- Future medical expenses if applicable
- Workers compensation payments received (if applicable)

**Wage Loss:**
- Client's occupation, job title, and compensation rate
- Dates and hours missed from work
- Calculation of lost wages
- Loss of future earning capacity if applicable
- Disability benefits received (if applicable)
- Include partial days if applicable

**Pain and Suffering:**
- Description of injuries and symptoms
- Impact on daily life, sleep, work, and activities
- Duration of symptoms and treatment
- Emotional impact (anxiety, depression, fear of returning to work)
- Loss of enjoyment of activities
- Permanent impairment or disability if applicable
- Impact on ability to perform job duties

**Total Demand:**
- Sum of all economic damages
- Non-economic damages assessment
- Total settlement demand amount

Extract specific dollar amounts, dates, and details from the source documents. Be precise with calculations.`,
                content: `{{clientName}} has incurred the following damages as a result of this workplace injury:

**Medical Specials:**
[The AI will generate an itemized list of all medical bills, providers, dates, and amounts based on the source documents.]

**Wage Loss:**
[The AI will calculate lost wages based on employment information, hours missed, and compensation rate from the source documents.]

**Pain and Suffering:**
[The AI will describe the impact of injuries on the client's life and ability to work based on medical records and treatment notes in the source documents.]

**Total Economic Damages:** $\${totalEconomicDamages}
**Non-Economic Damages:** [Based on severity and duration of injuries]
**Total Settlement Demand:** $\${demandAmount}`
            },
            demand: {
                title: 'Settlement Demand',
                prompt: `Based on the damages calculated and the source documents, create a professional settlement demand. Include:
- Clear statement of the total demand amount (use variable \${demandAmount})
- Reference to the evidence and documentation provided
- Professional but firm tone
- Deadline for response (typically 30 days from date of letter)
- Consequences of non-response (litigation)
- Reference to workers compensation considerations if applicable
- Professional closing

Maintain a professional, respectful tone while being clear about the seriousness of the matter.`,
                content: `Based on the foregoing, we demand settlement in the amount of $\${demandAmount} to resolve this matter. This demand is inclusive of all damages, including but not limited to medical expenses, lost wages, and pain and suffering.

We have provided documentation supporting this demand, including medical records, bills, wage loss documentation, incident reports, and OSHA records (if applicable). We are prepared to provide additional documentation upon request.

We request a response to this demand within thirty (30) days from the date of this letter. If we do not receive a satisfactory response within this timeframe, we will have no alternative but to pursue litigation to protect our client's interests.

Please contact us to discuss this matter further. We are available to negotiate in good faith to reach a fair resolution.

Very truly yours,

[Attorney Name]
[Law Firm Name]
[Contact Information]`
            }
        },
        variables: [
            { name: 'clientName', label: 'Client Name', type: 'text', required: true, defaultValue: null },
            { name: 'dateOfInjury', label: 'Date of Injury', type: 'date', required: true, defaultValue: null },
            { name: 'timeOfInjury', label: 'Time of Injury', type: 'text', required: false, defaultValue: null },
            { name: 'jobTitle', label: 'Job Title', type: 'text', required: false, defaultValue: null },
            { name: 'employerName', label: 'Employer/Defendant Name', type: 'text', required: true, defaultValue: null },
            { name: 'causeOfInjury', label: 'Cause of Injury', type: 'text', required: false, defaultValue: null },
            { name: 'demandAmount', label: 'Settlement Demand Amount', type: 'number', required: true, defaultValue: null },
            { name: 'totalEconomicDamages', label: 'Total Economic Damages', type: 'number', required: false, defaultValue: null }
        ],
        createdBy: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
    };
    try {
        // Create Slip and Fall template
        const slipAndFallRef = await db.collection('templates').add(slipAndFallTemplate);
        console.log(`✓ Created Slip and Fall template: ${slipAndFallRef.id}`);
        // Create Workplace Injury template
        const workplaceInjuryRef = await db.collection('templates').add(workplaceInjuryTemplate);
        console.log(`✓ Created Workplace Injury template: ${workplaceInjuryRef.id}`);
        console.log('\n✅ Successfully created 2 new templates!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating templates:', error);
        process.exit(1);
    }
}
// Run the script
createTemplates();
//# sourceMappingURL=createTemplates.js.map