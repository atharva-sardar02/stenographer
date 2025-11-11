# Stenographer – Demand Letter Generator
## Product Requirements Document (PRD)

> **Project:** AI-Driven Demand Letter Generation System  
> **Organization:** Steno  
> **Document Version:** 1.0  
> **Last Updated:** November 11, 2025

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Target Users & Personas](#4-target-users--personas)
5. [User Stories](#5-user-stories)
6. [Feature Scope](#6-feature-scope)
7. [Tech Stack](#7-tech-stack)
8. [System Architecture](#8-system-architecture)
9. [Data Model](#9-data-model)
10. [API Surface](#10-api-surface)
11. [Document Structure & AI Strategy](#11-document-structure--ai-strategy)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [User Experience & Design](#13-user-experience--design)
14. [Acceptance Criteria](#14-acceptance-criteria)
15. [Dependencies & Assumptions](#15-dependencies--assumptions)
16. [Risks & Mitigations](#16-risks--mitigations)
17. [Out of Scope](#17-out-of-scope)

---

## 1. Executive Summary

The **Stenographer Demand Letter Generator** is an AI-driven solution designed to streamline the creation of demand letters, a critical component in the litigation process for law firms. By leveraging AI to automate the drafting of these documents, this tool aims to significantly reduce the time attorneys spend on this task—from hours to minutes—thus increasing efficiency and productivity within law firms.

The system allows attorneys and paralegals to upload source materials (police reports, medical bills, case notes), apply firm-specific templates, and generate professionally structured demand letters with AI assistance. The tool provides basic real-time collaboration, change tracking, and exports to DOCX format.

**Key Benefits:**
- Reduce time-to-first-draft from hours → minutes
- Enforce firm style via customizable templates
- Enable collaborative editing between attorneys and paralegals
- Export clean, professional DOCX documents
- Maintain data security with 7-day retention policy

---

## 2. Problem Statement

Lawyers spend considerable time reviewing source documents to draft demand letters, an essential step in litigation. This manual process is time-consuming and can delay the litigation process. Key challenges include:

- **Time-intensive review:** Attorneys must manually review multiple source documents (police reports, medical records, bills, correspondence)
- **Inconsistent formatting:** Without templates, demand letters may lack consistency across cases
- **Manual drafting effort:** Writing comprehensive demand letters from scratch is repetitive and drains attorney time
- **Delayed turnaround:** Manual processes slow down client service and case progression

By utilizing AI to generate draft demand letters from source materials, Steno can offer a solution that saves time, enhances efficiency, and allows legal professionals to focus on higher-value legal analysis and strategy.

---

## 3. Goals & Success Metrics

### Primary Goals
1. **Automate demand letter generation** to increase law firm efficiency
2. **Reduce drafting time** by at least 50% compared to manual processes
3. **Maintain professional quality** through AI-assisted generation and human review
4. **Enable collaboration** between attorneys and paralegals

### Success Metrics
- **Efficiency:** Reduction in time taken to draft demand letters by at least **50%**
- **Adoption:** At least **80% user adoption rate** within the first year among target users
- **Quality:** First draft available within **≤45 seconds** end-to-end under nominal load
- **Satisfaction:** Increase in client retention and satisfaction due to faster turnaround
- **Business Impact:** Generation of new sales leads through innovative AI solutions

---

## 4. Target Users & Personas

### Primary User: Attorney
**Profile:**
- Manages litigation cases requiring demand letters
- Reviews case materials and client communications
- Needs to produce polished, legally sound demand letters quickly
- Values consistency, professionalism, and efficiency

**Needs:**
- Quick first-draft generation from source materials
- Ability to refine and customize AI-generated content
- Firm template compliance
- Professional DOCX export for client delivery

**Pain Points:**
- Spending hours manually drafting demand letters
- Repetitive work across similar cases
- Maintaining consistency in tone and structure
- Managing multiple concurrent cases

### Secondary User: Paralegal / Legal Assistant
**Profile:**
- Assists attorneys in case preparation and document management
- Organizes source materials and case files
- Handles initial document preparation and formatting
- Collaborates with attorneys on document refinement

**Needs:**
- Easy-to-use tools for document preparation
- Ability to upload and organize source materials
- Template creation and management
- Real-time collaboration with attorneys

**Pain Points:**
- Limited time to assist attorneys effectively
- Need for accuracy in document preparation
- Coordinating edits and revisions with attorneys
- Managing multiple cases simultaneously

---

## 5. User Stories

### Attorney User Stories

**US-1: Generate First Draft**
> As an attorney, I want to upload source documents (police reports, medical bills, case notes) and generate a draft demand letter so that I can save time in the litigation process.

**Acceptance:**
- Can upload multiple PDF/DOCX/TXT files (up to 10 files per matter)
- System processes uploaded files (including OCR for scanned PDFs)
- AI generates structured draft with Facts, Liability, Damages, and Demand sections
- First draft available within 45 seconds

**US-2: Edit and Refine Draft**
> As an attorney, I want to edit the AI-generated draft and request refinements to specific sections so that I can produce a polished, accurate demand letter.

**Acceptance:**
- Can directly edit any part of the generated draft
- Can provide instructions to regenerate specific sections
- Changes are tracked and visible
- Refinements maintain document structure and tone

**US-3: Apply Firm Templates**
> As an attorney, I want to create and manage templates for demand letters at a firm level so that my output maintains consistency and adheres to firm standards.

**Acceptance:**
- Can create templates with defined sections
- Can include template variables (e.g., `{{client_name}}`, `{{incident_date}}`, `{{damages_total}}`)
- Can select template before generating draft
- AI respects template structure and incorporates variables

**US-4: Export Final Letter**
> As an attorney, I want to export the final demand letter to a Word document so that I can easily share and print it for official use.

**Acceptance:**
- Can export draft to DOCX format
- Export preserves formatting, headings, and numbering
- Download link is secure and time-limited
- Document is ready for client delivery

**US-5: Collaborate with Paralegal**
> As an attorney, I want to collaborate in real-time with my paralegal on demand letters so that we can work efficiently together.

**Acceptance:**
- Can see paralegal's edits in real-time
- Change tracking shows who made what changes
- Can leave and respond to comments
- No conflicts or lost edits

### Paralegal User Stories

**US-6: Upload and Organize Source Materials**
> As a paralegal, I want to upload source files and see their processing status so that I can ensure all materials are ready for draft generation.

**Acceptance:**
- Can upload PDF, DOCX, and TXT files
- Can see OCR status for scanned PDFs
- Can view uploaded files and their metadata
- Receives clear error messages if upload fails

**US-7: Create and Manage Templates**
> As a paralegal, I want to create and edit demand letter templates with variables so that attorneys can generate consistent letters quickly.

**Acceptance:**
- Can create new templates with section definitions
- Can define template variables with placeholder syntax
- Can edit existing templates
- Can preview how templates will look

**US-8: Real-Time Collaboration**
> As a paralegal, I want to edit and collaborate on demand letters in real-time with attorneys so that I can ensure accuracy and completeness.

**Acceptance:**
- Can edit drafts simultaneously with attorney
- Can add comments and suggestions
- Changes are visible immediately
- Can resolve comment threads

---

## 6. Feature Scope

### P0: Must-Have Features (Core MVP)

#### File Upload & Processing
- Upload source documents: **PDF**, **DOCX**, **TXT**
- File size limit: **10 MB per file**
- Page limit: **100 pages per file**
- Matter limit: **10 files per matter**
- Automatic OCR processing for scanned PDFs via **AWS Textract**
- Display OCR status and processing progress
- Error handling for failed uploads or OCR failures

#### AI Draft Generation
- Generate structured demand letters from uploaded source materials
- Use **OpenAI API** for content generation
- Section-aware generation: **Facts**, **Liability**, **Damages**, **Demand**
- Low temperature (0.2–0.4) for consistent, professional output
- First draft available within **≤45 seconds**

#### Template Management
- Create firm-specific demand letter templates
- Define sections with customizable content and structure
- Support template variables (e.g., `{{client_name}}`, `{{incident_date}}`, `{{damages_total}}`)
- Store templates at firm level
- CRUD operations: Create, Read, Update, Delete templates
- Preview templates before applying

#### Draft Refinement
- Edit generated drafts directly in the editor
- Provide instructions to regenerate specific sections
- AI refines content based on attorney feedback
- Maintain document structure during refinements
- Preserve manual edits when regenerating sections

#### DOCX Export
- Export final demand letters to **Microsoft Word (.docx)** format
- Preserve headings, numbering, and formatting
- Include all sections and content
- Generate secure, time-limited download URLs (valid ≥10 minutes)

#### Data Retention
- Implement **7-day retention policy** for uploaded files
- Automated purge job runs nightly
- Delete files and transient generations older than 7 days
- Templates and finalized drafts persist beyond 7 days
- Clear user notification about retention policy

### P1: Should-Have Features

#### Basic Real-Time Collaboration
- Multiple users can edit the same draft
- Basic change tracking (Google Docs style)
- Show who made what changes and when
- Edits sync across users with **<200ms average latency**
- Handle simultaneous edits without data loss

#### Inline Comments & Suggestions
- Users can add comments to specific parts of the draft
- Comment threads support replies
- Comments can be resolved/unresolved
- Track comment author and timestamp
- Notification when comments are added

#### Customizable AI Prompts
- Allow attorneys to customize instructions for refinement
- Provide prompt templates for common refinement types
- Save frequently used prompts for reuse
- Control tone, level of detail, and focus areas

### P2: Nice-to-Have (Future Considerations)
These features are documented for future phases but **NOT included in current scope**:
- Assignable tasks/checklists per matter
- Analytics dashboard (draft turnaround time, section rewrite counts)
- Advanced collaboration features (presence cursors, suggestion mode with accept/reject)
- User-level templates (in addition to firm-level)

---

## 7. Tech Stack

### Confirmed Technology Decisions

#### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite or Next.js (SPA mode)
- **Hosting:** Firebase Hosting
- **Editor:** TipTap or similar rich text editor with collaboration support
- **State Management:** React Context or Zustand
- **Styling:** Tailwind CSS or Material-UI

#### Authentication
- **Provider:** Firebase Auth
- **Methods:** 
  - Email/Password authentication
  - Google OAuth
- **Token Management:** Firebase ID tokens for API authorization

#### Backend Services
- **Proxy Layer:** Firebase Cloud Functions (Node.js)
  - Validates Firebase ID tokens
  - Adds user/firm claims
  - Routes requests to AWS services
  - Simplifies CORS and API key management
- **Primary APIs:** AWS API Gateway + AWS Lambda (Node.js)
  - OCR processing
  - LLM orchestration
  - Document generation
  - Export services

#### Data & Storage
- **Database:** Firestore (Native mode)
  - App metadata (users, matters, files, drafts)
  - Real-time collaboration data
  - Template storage
- **File Storage:** Firebase Storage
  - Uploaded source documents
  - Generated exports
  - Temporary processing files

#### AI & OCR Services
- **LLM Provider:** OpenAI API
  - Model: GPT-4 or GPT-3.5-turbo
  - Temperature: 0.2–0.4 for consistent, professional output
  - Section-level prompting for controlled generation
- **OCR Service:** AWS Textract
  - Process scanned PDFs
  - Extract text with page-level accuracy
  - Return confidence scores

#### Infrastructure & DevOps
- **Deployment:** Single-firm deployment (no multi-tenancy)
- **Regions:** 
  - Firebase: us-central1
  - AWS: us-east-1
- **CI/CD:** GitHub Actions
- **Secrets Management:** 
  - AWS credentials: AWS Secrets Manager
  - OpenAI API keys: AWS Secrets Manager
  - Firebase admin credentials: Firebase Secrets
- **Monitoring:** Firebase Analytics, AWS CloudWatch

---

## 8. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React SPA (Firebase Hosting)                          │ │
│  │  - TipTap Editor                                       │ │
│  │  - Firebase Auth (Email/Password + Google)            │ │
│  │  - Real-time updates via Firestore listeners          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                    Firebase ID Token
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Services Layer                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Firebase Cloud Function (/api proxy)                  │ │
│  │  - Verify Firebase ID tokens                           │ │
│  │  - Add user/firm claims                                │ │
│  │  - Route to AWS API Gateway                            │ │
│  │  - Handle CORS                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Firestore (Native)                                    │ │
│  │  - Users, Matters, Files, Templates, Drafts            │ │
│  │  - Real-time collaboration data                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Firebase Storage                                      │ │
│  │  - Uploaded source documents                           │ │
│  │  - Generated DOCX exports                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                    Service Auth Token
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      AWS Services Layer                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Gateway → Lambda Functions (Node.js)              │ │
│  │  - /files:uploadInit, /files:finalize                  │ │
│  │  - /ocr:extract (calls Textract)                       │ │
│  │  - /templates (CRUD)                                   │ │
│  │  - /drafts:generate (calls OpenAI)                     │ │
│  │  - /drafts:refineSection (calls OpenAI)                │ │
│  │  - /exports:docx (generates Word doc)                  │ │
│  │  - /retention:purge (scheduled cleanup)                │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AWS Textract                                          │ │
│  │  - OCR processing for scanned PDFs                     │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AWS Secrets Manager                                   │ │
│  │  - OpenAI API keys                                     │ │
│  │  - AWS service credentials                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                    API Calls
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  OpenAI API                                            │ │
│  │  - GPT-4 / GPT-3.5-turbo                               │ │
│  │  - Section-by-section draft generation                 │ │
│  │  - Content refinement                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

#### 1. File Upload Flow
```
User → React App → Firebase Function (verify token) 
     → API Gateway → Lambda (uploadInit) 
     → Generate signed Firebase Storage URL
     → Return to client → Client uploads to Storage
     → Client calls finalize → Lambda creates Firestore doc
     → If PDF: Enqueue OCR job → Textract processes → Update Firestore
```

#### 2. Draft Generation Flow
```
User selects template + files → React App → Firebase Function
     → API Gateway → Lambda (drafts:generate)
     → Fetch files from Storage → Extract text
     → Build section prompts with template structure
     → Call OpenAI API for each section (Facts, Liability, Damages, Demand)
     → Assemble complete draft → Save to Firestore
     → Return draft ID → Client loads draft in editor
```

#### 3. Real-Time Collaboration Flow
```
User A edits draft → Update Firestore draft document
     → Firestore listener triggers on User B's client
     → User B sees change reflected in editor
     → Change tracking records edit metadata
     → Comments stored in Firestore subcollection
```

#### 4. Export Flow
```
User requests export → Firebase Function → API Gateway
     → Lambda (exports:docx) → Fetch draft from Firestore
     → Generate DOCX using library (docx.js)
     → Upload to Firebase Storage
     → Generate signed download URL (10min expiry)
     → Return URL to client → User downloads
```

### Why Firebase Function Proxy?

The Firebase Cloud Function proxy layer provides several key benefits:

1. **Unified Authentication:** Single auth model using Firebase ID tokens across all services
2. **Simplified CORS:** Firebase handles CORS; AWS services don't need public CORS configuration
3. **Security:** AWS API keys and credentials never exposed to client
4. **Request Enrichment:** Proxy adds user ID and firm context before forwarding to AWS
5. **Simplified Client:** React app only needs to know Firebase endpoints
6. **Flexibility:** Easy to add caching, rate limiting, or logging at proxy layer

---

## 9. Data Model

### Firestore Collections (Single-Firm Deployment)

#### `/users/{userId}`
Stores user profile and role information.

```typescript
{
  userId: string,              // Firebase Auth UID
  email: string,               // User email
  displayName: string,         // User's full name
  role: "attorney" | "paralegal",
  createdAt: Timestamp,
  lastLoginAt: Timestamp
}
```

#### `/matters/{matterId}`
Represents a case or matter requiring a demand letter.

```typescript
{
  matterId: string,            // Auto-generated ID
  title: string,               // e.g., "Smith v. Jones - Auto Accident"
  clientName: string,
  status: "active" | "draft" | "completed" | "archived",
  participants: string[],      // Array of userIds (attorney + paralegals)
  createdBy: string,           // userId
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `/matters/{matterId}/files/{fileId}`
Subcollection storing uploaded source files for a matter.

```typescript
{
  fileId: string,              // Auto-generated ID
  matterId: string,            // Parent matter ID
  name: string,                // Original filename
  type: "pdf" | "docx" | "txt",
  size: number,                // Bytes
  storagePath: string,         // Firebase Storage path
  uploadedBy: string,          // userId
  uploadedAt: Timestamp,
  
  // OCR-specific fields (for PDFs)
  ocrStatus: "pending" | "processing" | "done" | "failed" | null,
  ocrText: string | null,      // Extracted text
  ocrConfidence: number | null, // 0-100
  ocrPages: number | null,
  ocrError: string | null,
  
  // Retention
  purgeAt: Timestamp,          // uploadedAt + 7 days
  isPurged: boolean
}
```

#### `/templates/{templateId}`
Firm-level demand letter templates.

```typescript
{
  templateId: string,          // Auto-generated ID
  name: string,                // e.g., "Auto Accident - Standard"
  description: string,
  
  // Template structure
  sections: {
    facts: {
      title: string,           // e.g., "Statement of Facts"
      prompt: string,          // Instructions for AI
      content: string          // Default/example content
    },
    liability: {
      title: string,
      prompt: string,
      content: string
    },
    damages: {
      title: string,
      prompt: string,
      content: string
    },
    demand: {
      title: string,
      prompt: string,
      content: string
    }
  },
  
  // Template variables
  variables: Array<{
    name: string,              // e.g., "client_name"
    label: string,             // e.g., "Client Name"
    type: "text" | "number" | "date",
    required: boolean,
    defaultValue: string | null
  }>,
  
  createdBy: string,           // userId
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isActive: boolean
}
```

#### `/drafts/{draftId}`
Generated demand letter drafts.

```typescript
{
  draftId: string,             // Auto-generated ID
  matterId: string,            // Associated matter
  templateId: string | null,   // Template used for generation
  
  // Draft state
  state: "generating" | "editing" | "final",
  
  // Content (stored as structured data or HTML/Markdown)
  sections: {
    facts: { content: string, generatedAt: Timestamp },
    liability: { content: string, generatedAt: Timestamp },
    damages: { content: string, generatedAt: Timestamp },
    demand: { content: string, generatedAt: Timestamp }
  },
  
  // Template variable values
  variables: Record<string, any>,  // e.g., { client_name: "John Doe" }
  
  // Metadata
  generatedBy: string,         // userId who initiated generation
  lastGeneratedAt: Timestamp,
  lastEditedAt: Timestamp,
  lastEditedBy: string,        // userId
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `/drafts/{draftId}/collaboration`
Real-time collaboration data for a draft (single document per draft).

```typescript
{
  // Change tracking
  changes: Array<{
    changeId: string,
    userId: string,
    userName: string,
    timestamp: Timestamp,
    type: "insert" | "delete" | "format",
    position: number,          // Character position in document
    content: string,           // What was added/removed
    section: "facts" | "liability" | "damages" | "demand" | null
  }>,
  
  // Comments
  comments: Array<{
    commentId: string,
    userId: string,
    userName: string,
    timestamp: Timestamp,
    position: number,          // Character position
    content: string,           // Comment text
    resolved: boolean,
    resolvedBy: string | null,
    resolvedAt: Timestamp | null,
    replies: Array<{
      replyId: string,
      userId: string,
      userName: string,
      timestamp: Timestamp,
      content: string
    }>
  }>,
  
  // Active editors (for basic presence)
  activeEditors: Array<{
    userId: string,
    userName: string,
    lastActiveAt: Timestamp
  }>,
  
  updatedAt: Timestamp
}
```

#### `/exports/{exportId}`
Generated export files (DOCX).

```typescript
{
  exportId: string,            // Auto-generated ID
  draftId: string,             // Source draft
  matterId: string,
  
  format: "docx",
  storagePath: string,         // Firebase Storage path
  downloadUrl: string,         // Signed URL
  urlExpiresAt: Timestamp,     // Download URL expiry
  
  generatedBy: string,         // userId
  generatedAt: Timestamp,
  
  // File metadata
  filename: string,
  fileSize: number,            // Bytes
  
  // Retention
  purgeAt: Timestamp,          // generatedAt + 7 days
  isPurged: boolean
}
```

#### `/jobs/{jobId}`
Background job tracking (OCR, retention purge).

```typescript
{
  jobId: string,               // Auto-generated ID
  type: "ocr" | "retention_purge",
  status: "pending" | "processing" | "completed" | "failed",
  
  // Input references
  inputRefs: {
    matterId: string | null,
    fileId: string | null
  },
  
  // Output references
  outputRefs: {
    fileId: string | null,
    text: string | null,
    pages: number | null,
    confidence: number | null
  },
  
  error: string | null,
  errorDetails: any | null,
  
  createdAt: Timestamp,
  startedAt: Timestamp | null,
  completedAt: Timestamp | null
}
```

### Firestore Security Rules

Basic security rules for single-firm deployment:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users can read/update their own profile
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }
    
    // Matters: authenticated users can read/write
    match /matters/{matterId} {
      allow read, write: if isAuthenticated();
      
      // Files subcollection
      match /files/{fileId} {
        allow read, write: if isAuthenticated();
      }
    }
    
    // Templates: authenticated users can read, only attorneys can write
    match /templates/{templateId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'attorney';
    }
    
    // Drafts: authenticated users can read/write
    match /drafts/{draftId} {
      allow read, write: if isAuthenticated();
      
      // Collaboration subcollection
      match /collaboration {
        allow read, write: if isAuthenticated();
      }
    }
    
    // Exports: authenticated users can read/write their own
    match /exports/{exportId} {
      allow read, write: if isAuthenticated();
    }
    
    // Jobs: read-only for authenticated users
    match /jobs/{jobId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only backend can write
    }
  }
}
```

---

## 10. API Surface

All API endpoints are accessed through the Firebase Cloud Function proxy at `/api/*`. The proxy validates Firebase ID tokens and forwards requests to AWS API Gateway → Lambda.

### Authentication
All requests require a Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### File Management

#### POST `/v1/files:uploadInit`
Initialize a file upload and get a signed Storage URL.

**Request:**
```json
{
  "matterId": "matter123",
  "filename": "police-report.pdf",
  "fileType": "pdf",
  "fileSize": 2048576
}
```

**Response:**
```json
{
  "fileId": "file456",
  "uploadUrl": "https://storage.googleapis.com/...",
  "storagePath": "matters/matter123/files/file456.pdf"
}
```

#### POST `/v1/files:finalize`
Finalize upload after client has uploaded to Storage. Creates Firestore document and enqueues OCR if needed.

**Request:**
```json
{
  "fileId": "file456",
  "matterId": "matter123",
  "storagePath": "matters/matter123/files/file456.pdf"
}
```

**Response:**
```json
{
  "fileId": "file456",
  "ocrStatus": "pending",
  "ocrJobId": "job789"
}
```

### OCR Processing

#### POST `/v1/ocr:extract`
Manually trigger OCR extraction for a file (usually auto-triggered after upload).

**Request:**
```json
{
  "fileId": "file456",
  "matterId": "matter123"
}
```

**Response:**
```json
{
  "jobId": "job789",
  "status": "processing",
  "estimatedCompletionSeconds": 30
}
```

**Webhook/Update:**
OCR completion updates the file document in Firestore:
```json
{
  "ocrStatus": "done",
  "ocrText": "Extracted text content...",
  "ocrConfidence": 94.5,
  "ocrPages": 5
}
```

### Template Management

#### POST `/v1/templates`
Create a new demand letter template.

**Request:**
```json
{
  "name": "Auto Accident - Standard",
  "description": "Standard template for auto accident cases",
  "sections": {
    "facts": {
      "title": "Statement of Facts",
      "prompt": "Summarize the facts of the auto accident based on police report and witness statements",
      "content": ""
    },
    "liability": {
      "title": "Liability",
      "prompt": "Analyze defendant's liability and negligence",
      "content": ""
    },
    "damages": {
      "title": "Damages",
      "prompt": "Detail all damages including medical expenses, lost wages, and pain and suffering",
      "content": ""
    },
    "demand": {
      "title": "Demand for Settlement",
      "prompt": "State clear settlement demand with deadline",
      "content": ""
    }
  },
  "variables": [
    { "name": "client_name", "label": "Client Name", "type": "text", "required": true },
    { "name": "incident_date", "label": "Incident Date", "type": "date", "required": true },
    { "name": "damages_total", "label": "Total Damages", "type": "number", "required": true }
  ]
}
```

**Response:**
```json
{
  "templateId": "template123",
  "createdAt": "2025-11-11T10:00:00Z"
}
```

#### GET `/v1/templates`
List all templates.

**Response:**
```json
{
  "templates": [
    {
      "templateId": "template123",
      "name": "Auto Accident - Standard",
      "description": "...",
      "createdAt": "2025-11-11T10:00:00Z",
      "updatedAt": "2025-11-11T10:00:00Z"
    }
  ]
}
```

#### GET `/v1/templates/{templateId}`
Get a specific template.

#### PUT `/v1/templates/{templateId}`
Update a template (same structure as POST).

#### DELETE `/v1/templates/{templateId}`
Delete a template.

### Draft Generation

#### POST `/v1/drafts:generate`
Generate a first draft demand letter from source files and template.

**Request:**
```json
{
  "matterId": "matter123",
  "templateId": "template123",
  "fileIds": ["file456", "file457", "file458"],
  "variables": {
    "client_name": "John Doe",
    "incident_date": "2025-01-15",
    "damages_total": 50000
  }
}
```

**Response:**
```json
{
  "draftId": "draft789",
  "status": "generating",
  "estimatedCompletionSeconds": 45
}
```

**Completion:**
Draft is saved to Firestore and client receives real-time update:
```json
{
  "draftId": "draft789",
  "state": "editing",
  "sections": {
    "facts": { "content": "...", "generatedAt": "2025-11-11T10:01:00Z" },
    "liability": { "content": "...", "generatedAt": "2025-11-11T10:01:15Z" },
    "damages": { "content": "...", "generatedAt": "2025-11-11T10:01:30Z" },
    "demand": { "content": "...", "generatedAt": "2025-11-11T10:01:45Z" }
  }
}
```

#### POST `/v1/drafts:refineSection`
Regenerate a specific section with additional instructions.

**Request:**
```json
{
  "draftId": "draft789",
  "section": "damages",
  "instruction": "Add more detail about future medical expenses and emphasize pain and suffering",
  "keepExistingContent": false
}
```

**Response:**
```json
{
  "draftId": "draft789",
  "section": "damages",
  "content": "Updated section content...",
  "generatedAt": "2025-11-11T10:05:00Z"
}
```

### Export

#### POST `/v1/exports:docx`
Generate DOCX export of a draft.

**Request:**
```json
{
  "draftId": "draft789",
  "filename": "Demand Letter - Smith v Jones.docx"
}
```

**Response:**
```json
{
  "exportId": "export999",
  "downloadUrl": "https://storage.googleapis.com/...",
  "urlExpiresAt": "2025-11-11T10:20:00Z",
  "fileSize": 45678
}
```

### Retention & Cleanup

#### POST `/v1/retention:purge`
Scheduled job (runs nightly) to purge files older than 7 days.

**Request:**
```json
{
  "dryRun": false,
  "olderThanDays": 7
}
```

**Response:**
```json
{
  "purgedFiles": 23,
  "purgedExports": 15,
  "totalBytesFreed": 125829120,
  "executionTime": "4.5s"
}
```

---

## 11. Document Structure & AI Strategy

### Demand Letter Structure

All generated demand letters follow a standard four-section structure:

#### 1. **Facts (Statement of Facts)**
- Chronological narrative of the incident
- Based on police reports, witness statements, and case notes
- Neutral, factual tone
- Establishes foundation for liability and damages

**AI Prompt Strategy:**
- Extract key facts from uploaded documents
- Organize chronologically
- Use neutral, professional language
- Temperature: 0.2 (highly deterministic)

#### 2. **Liability**
- Legal analysis of defendant's negligence or fault
- Applicable laws and standards of care
- How defendant breached duty
- Causation linking breach to injury/damages

**AI Prompt Strategy:**
- Identify legal theories from template guidance
- Apply facts to liability framework
- Cite general legal principles (no specific caselaw)
- Temperature: 0.3 (balanced)

#### 3. **Damages**
- Itemized list of economic damages (medical bills, lost wages, property damage)
- Non-economic damages (pain and suffering, emotional distress)
- Future damages if applicable
- Total demand amount

**AI Prompt Strategy:**
- Extract monetary amounts from bills and records
- Calculate totals accurately
- Describe impact on client's life
- Temperature: 0.2 (precision required for numbers)

#### 4. **Demand**
- Clear statement of settlement demand
- Deadline for response
- Consequences of non-response (litigation)
- Professional but firm tone

**AI Prompt Strategy:**
- Use template variable for demand amount
- Standard deadline language (e.g., 30 days)
- Professional closing
- Temperature: 0.2 (consistent format)

### Template Variables

Templates support dynamic variables that are replaced during generation:

**Syntax:** `{{variable_name}}`

**Common Variables:**
- `{{client_name}}` - Client's full name
- `{{client_address}}` - Client's address
- `{{defendant_name}}` - Defendant's name
- `{{defendant_address}}` - Defendant's address
- `{{incident_date}}` - Date of incident (formatted)
- `{{incident_location}}` - Location of incident
- `{{damages_medical}}` - Medical expenses total
- `{{damages_lost_wages}}` - Lost wages total
- `{{damages_property}}` - Property damage total
- `{{damages_total}}` - Total damages amount
- `{{demand_amount}}` - Settlement demand amount
- `{{demand_deadline}}` - Deadline for response
- `{{attorney_name}}` - Attorney's name
- `{{attorney_firm}}` - Law firm name
- `{{attorney_contact}}` - Attorney contact information

### AI Generation Strategy

#### Section-by-Section Generation
Rather than generating the entire letter at once, the system generates each section independently:

**Benefits:**
1. **Focused prompts:** Each section has specific instructions and context
2. **Better control:** Temperature and token limits tuned per section
3. **Easier refinement:** Attorneys can regenerate individual sections without affecting others
4. **Stability:** Reduces risk of AI drift or inconsistency in long outputs
5. **Parallelization:** Sections can be generated concurrently (future optimization)

#### Prompt Engineering

**Base Prompt Template:**
```
You are an experienced personal injury attorney drafting the [SECTION_NAME] section of a demand letter. 

Context:
- Client: {{client_name}}
- Incident Date: {{incident_date}}
- Case Type: [Auto Accident / Slip and Fall / etc.]

Source Materials:
[Extracted text from uploaded documents]

Template Instructions:
[Section-specific prompt from template]

Requirements:
- Use professional legal tone
- Be factual and precise
- [Section-specific requirements]
- Format with appropriate headings and numbering

Generate the [SECTION_NAME] section now:
```

**Section-Specific Adjustments:**

**Facts Section:**
- Input: Police reports, witness statements, incident photos/descriptions
- Focus: Chronology, who/what/when/where
- Length: 300-500 words typically

**Liability Section:**
- Input: Facts + legal standards from template
- Focus: Duty, breach, causation
- Length: 200-400 words

**Damages Section:**
- Input: Medical bills, wage statements, receipts
- Focus: Itemization, impact, totals
- Length: 300-600 words (can be longer for complex cases)

**Demand Section:**
- Input: Total damages, template demand language
- Focus: Clear demand amount, deadline, next steps
- Length: 150-250 words

#### LLM Configuration

**OpenAI API Settings:**
- **Model:** GPT-4 (preferred) or GPT-3.5-turbo (cost-effective alternative)
- **Temperature:** 0.2–0.4 (low for consistency and professionalism)
- **Max Tokens:** 
  - Facts: 800 tokens
  - Liability: 600 tokens
  - Damages: 1000 tokens
  - Demand: 400 tokens
- **Top P:** 1.0 (default)
- **Frequency Penalty:** 0.3 (reduce repetition)
- **Presence Penalty:** 0.1 (slight variation)

#### Post-Processing

After AI generation, apply post-processing to ensure quality:

1. **Template Formatting:** Apply headings, numbering, spacing per template
2. **Variable Substitution:** Ensure all `{{variables}}` are replaced
3. **Number Validation:** Check that monetary amounts are formatted correctly
4. **Length Check:** Ensure sections meet minimum/maximum length requirements
5. **Profanity Filter:** Remove any inappropriate language (unlikely but safe)
6. **Consistency Check:** Ensure client name and key facts are consistent across sections

---

## 12. Non-Functional Requirements

### Performance

#### Response Times
- **HTTP Requests:** < 5 seconds for all API calls
- **Database Queries:** < 2 seconds for Firestore reads/writes
- **File Upload:** Support progress tracking for files up to 10MB
- **Draft Generation:** ≤ 45 seconds end-to-end (upload to first draft)
- **Section Refinement:** ≤ 15 seconds per section
- **DOCX Export:** ≤ 10 seconds for typical draft
- **Real-Time Sync:** < 200ms average latency for collaborative edits

#### Throughput
- Support **10 concurrent users** editing/generating simultaneously (single firm)
- Handle **100 file uploads per day**
- Process **50 draft generations per day**

### Scalability

**Current Scope (Single Firm):**
- Optimize for single firm with 5-20 users
- Firestore scales automatically
- Firebase Functions and Lambda scale on demand

**Future Multi-Tenant Considerations (documented but not implemented):**
- Firm-level data isolation
- Per-firm quotas and rate limiting
- Tenant-aware routing

### Security

#### Authentication & Authorization
- **Firebase Auth** for user identity
- **Email/Password** + **Google OAuth** supported
- Session management via Firebase ID tokens (1 hour expiry, auto-refresh)
- Role-based access: Attorney vs. Paralegal

#### Data Encryption
- **In Transit:** TLS 1.2+ for all connections
- **At Rest:** 
  - Firestore: Encrypted by default (Google-managed keys)
  - Firebase Storage: Encrypted by default
  - AWS services: Use AWS-managed encryption

#### API Security
- All API endpoints require valid Firebase ID token
- Firebase Function proxy validates tokens before forwarding
- AWS services not directly exposed to clients
- Signed URLs for file uploads/downloads with time limits (10-60 minutes)
- CORS configured for known origins only

#### Secrets Management
- **OpenAI API Key:** Stored in AWS Secrets Manager
- **AWS Credentials:** Stored in AWS Secrets Manager
- **Firebase Admin SDK:** Uses Firebase Secrets
- No secrets in client code or version control

#### Data Privacy
- User data accessible only to authenticated users
- Firestore security rules enforce access control
- 7-day retention policy minimizes data exposure
- No third-party analytics or tracking beyond Firebase Analytics

### File Constraints

#### Allowed File Types
- **PDF** (.pdf) - Including scanned documents (OCR supported)
- **DOCX** (.docx) - Microsoft Word documents
- **TXT** (.txt) - Plain text files

#### File Size Limits
- **Maximum per file:** 10 MB
- **Maximum pages per PDF:** 100 pages
- **Maximum files per matter:** 10 files
- **Total storage per matter:** ~100 MB

#### Validation
- File type validation on client and server
- Size validation before upload
- Page count validation after OCR
- Virus scanning (optional, future consideration)

### Data Retention Policy

#### 7-Day Purge for Transient Data
- **Uploaded source files:** Deleted 7 days after upload
- **Generated exports:** Deleted 7 days after creation
- **Transient OCR data:** Cleaned up with file deletion
- **Automated job:** Runs nightly via scheduled Cloud Function

#### Persistent Data
- **Templates:** Persist indefinitely (until manually deleted)
- **Draft documents:** Persist indefinitely
- **User accounts:** Persist until account deletion
- **Matter metadata:** Persist indefinitely

#### User Notification
- Clear messaging about 7-day retention during upload
- Warning before data is purged
- Option to export/save important documents before purge

### Reliability

#### Uptime & Availability
- **Target:** 99.5% uptime (excludes scheduled maintenance)
- Firebase and AWS both offer high availability
- Graceful degradation if external services (OpenAI, Textract) are unavailable

#### Error Handling
- Comprehensive error messages for users
- Retry logic for transient failures
- Fallback mechanisms where possible
- Error logging to CloudWatch and Firebase Crashlytics

#### Backup & Recovery
- Firestore automatic daily backups (Firebase manages)
- Point-in-time recovery available
- Storage bucket versioning enabled
- Critical data redundancy across regions

### Monitoring & Observability

#### Logging
- **Firebase Functions:** Cloud Logging (Stackdriver)
- **AWS Lambda:** CloudWatch Logs
- **Application logs:** Structured JSON logs with request IDs

#### Metrics
- API request counts and latencies
- Error rates by endpoint
- File upload/download metrics
- Draft generation times
- OCR success/failure rates

#### Alerting
- Email alerts for critical errors
- Slack integration for operations team
- Threshold-based alerts (e.g., error rate > 5%)

### Accessibility

#### WCAG 2.1 Compliance (Level AA target)
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast (4.5:1 minimum)
- Alt text for images/icons
- Proper ARIA labels
- Focus indicators on interactive elements

#### Internationalization (Future)
- English only for initial release
- Architecture supports future i18n (React i18next)

### Browser Support

#### Supported Browsers
- Chrome 90+ (primary)
- Firefox 88+
- Safari 14+
- Edge 90+

#### Mobile Browsers (basic support)
- Mobile Chrome (Android)
- Mobile Safari (iOS)
- Note: Mobile app out of scope, but responsive design should allow basic usage

---

## 13. User Experience & Design

### Design Principles

1. **Simplicity:** Reduce complexity; guide users through clear workflows
2. **Efficiency:** Minimize clicks and time to complete tasks
3. **Professional:** Legal industry aesthetics; trustworthy and polished
4. **Collaborative:** Make teamwork between attorneys and paralegals seamless
5. **Transparent:** Show processing status; no mysterious "loading" states

### Key User Flows

#### Flow 1: Attorney Generates First Draft

```
1. Login (Google OAuth or Email/Password)
2. Navigate to "Matters" → Click "New Matter"
3. Enter matter details (client name, case type, etc.) → Save
4. Click "Upload Documents"
5. Drag-and-drop or select files (police report, bills, notes)
6. See upload progress and OCR status for each file
7. Once files processed, click "Generate Draft"
8. Select template from dropdown (e.g., "Auto Accident - Standard")
9. Fill in template variables (client name, incident date, damages total)
10. Click "Generate" → See progress indicator
11. Draft appears in editor after ~45 seconds
12. Review and edit as needed
13. Click "Export to Word" → Download DOCX
```

#### Flow 2: Paralegal Creates Template

```
1. Login
2. Navigate to "Templates" → Click "New Template"
3. Enter template name and description
4. Define four sections (Facts, Liability, Damages, Demand)
5. For each section:
   - Enter section title
   - Write AI prompt instructions
   - Optionally add default content
6. Add template variables (client_name, incident_date, etc.)
7. Preview template
8. Save template
9. Template now available for attorney draft generation
```

#### Flow 3: Real-Time Collaboration

```
1. Attorney opens a draft in the editor
2. Paralegal opens the same draft (sees attorney's presence indicator)
3. Paralegal makes edits to "Facts" section
4. Attorney sees changes appear in real-time
5. Attorney adds comment on "Damages" section: "Need more detail on future medical"
6. Paralegal sees comment notification
7. Paralegal replies to comment and updates section
8. Attorney marks comment as resolved
9. Both users continue editing without conflicts
```

### UI Components & Layout

#### Main Navigation
- Top nav bar with logo, matter selector, and user menu
- Left sidebar with:
  - Dashboard
  - Matters (list view)
  - Templates
  - Settings
  - Help

#### Matter Detail View
- Tabs:
  - **Overview:** Matter details, participants, status
  - **Files:** Uploaded documents with OCR status
  - **Drafts:** Generated drafts (list with preview)
  - **Activity:** Recent changes and comments

#### Draft Editor View
- **Header:** 
  - Matter name and client name
  - Save status indicator
  - Export button
  - Share/invite collaborators button
- **Toolbar:** 
  - Rich text formatting (bold, italic, lists, headings)
  - Comment button
  - Refine section button (AI regenerate)
- **Main Editor:** 
  - TipTap rich text editor
  - Sections visually separated (Facts, Liability, Damages, Demand)
  - Presence indicators (colored cursors with names)
- **Right Sidebar:**
  - Comments thread
  - Change history
  - Template variables

#### Template Builder
- Form-based interface
- Section editor with tabs for each section
- Variable manager (add/edit/remove)
- Live preview pane

### Design Patterns

#### Loading States
- Skeleton screens for content loading
- Progress bars for file uploads and generation
- Spinners for quick actions (<2 seconds)
- Estimated completion times for long operations

#### Empty States
- Welcoming illustrations for new matters, templates, drafts
- Clear call-to-action buttons
- Brief explanatory text

#### Error States
- Friendly error messages with actionable guidance
- Retry buttons where applicable
- Contact support link for critical errors

#### Success Feedback
- Toast notifications for successful actions
- Check marks and green highlights
- Confirmation modals for destructive actions (delete)

### Accessibility Considerations

- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Readers:** Proper semantic HTML and ARIA labels
- **Focus Management:** Clear focus indicators; logical tab order
- **Color Contrast:** Minimum 4.5:1 for text; 3:1 for large text
- **Alt Text:** All images and icons have descriptive alt text
- **Form Labels:** Every input has associated label
- **Error Announcements:** Screen reader announces errors in forms

---

## 14. Acceptance Criteria

### Upload & OCR

**AC-1: Successful File Upload**
- **Given:** User is authenticated and viewing a matter
- **When:** User uploads a valid PDF file ≤10MB with ≤100 pages
- **Then:** 
  - Upload progress bar shows percentage
  - File appears in matter's file list upon completion
  - OCR status shows "Processing" for scanned PDFs
  - OCR completes within 60 seconds for typical file
  - OCR status updates to "Done" with extracted text available

**AC-2: OCR Error Handling**
- **Given:** User uploads a poor-quality scanned PDF
- **When:** OCR fails or confidence is very low (<50%)
- **Then:**
  - OCR status shows "Needs Review"
  - User sees banner: "OCR quality is low. You may want to re-scan this document."
  - User can still proceed with draft generation using available text
  - Error message includes actionable guidance

**AC-3: File Validation**
- **Given:** User attempts to upload an invalid file
- **When:** File exceeds 10MB, is wrong type, or exceeds page limit
- **Then:**
  - Upload is rejected before attempting
  - Clear error message explains the issue
  - User is not charged for failed upload

### Draft Generation

**AC-4: First Draft Generation**
- **Given:** User has uploaded at least one source file and selected a template
- **When:** User clicks "Generate Draft" and fills in required variables
- **Then:**
  - Progress indicator shows generation status
  - First draft completes within ≤45 seconds under normal load
  - Draft contains all four sections: Facts, Liability, Damages, Demand
  - Template variables are correctly substituted
  - Content is coherent and professionally written
  - Draft is automatically saved to Firestore

**AC-5: Section Refinement**
- **Given:** User has a generated draft open in the editor
- **When:** User selects "Damages" section and clicks "Refine" with instruction: "Add more detail on future medical expenses"
- **Then:**
  - Section regenerates within ≤15 seconds
  - New content reflects the refinement instruction
  - Other sections remain unchanged
  - Change is tracked in collaboration history
  - User can undo to previous version

**AC-6: Generation Error Handling**
- **Given:** OpenAI API is temporarily unavailable or rate-limited
- **When:** User attempts to generate a draft
- **Then:**
  - System retries up to 3 times with exponential backoff
  - If all retries fail, user sees: "Generation failed. Please try again in a few minutes."
  - Partial progress (completed sections) is saved
  - User can resume generation later

### Real-Time Collaboration & Change Tracking

**AC-7: Basic Real-Time Edits**
- **Given:** Two users (Attorney A and Paralegal B) have the same draft open
- **When:** Attorney A types in the "Facts" section
- **Then:**
  - Paralegal B sees the changes appear within <200ms average latency
  - No edit conflicts or data loss occurs
  - Both users can continue editing different sections simultaneously

**AC-8: Change Tracking**
- **Given:** User has made multiple edits to a draft
- **When:** User views the "Change History" panel
- **Then:**
  - All edits are listed with: user name, timestamp, section, and description
  - Changes are displayed in reverse chronological order
  - User can click a change to see the affected text highlighted

**AC-9: Comments & Resolution**
- **Given:** User wants to leave feedback on a section
- **When:** User selects text in "Damages" section and clicks "Add Comment"
- **Then:**
  - Comment box appears with selected text highlighted
  - User can type comment and submit
  - Comment appears in right sidebar with user name and timestamp
  - Other users see comment notification
  - Comment thread supports replies
  - User can mark comment as "Resolved"

### Export

**AC-10: DOCX Export**
- **Given:** User has completed editing a draft
- **When:** User clicks "Export to Word"
- **Then:**
  - DOCX file generates within ≤10 seconds
  - Download link appears with filename and file size
  - Download URL is valid for ≥10 minutes
  - Downloaded DOCX preserves:
    - All section content
    - Headings and formatting
    - Numbered and bulleted lists
    - Template variables are filled in
  - File opens correctly in Microsoft Word and Google Docs

**AC-11: Export Expiry**
- **Given:** User has generated an export
- **When:** 10+ minutes have passed since generation
- **Then:**
  - Download URL expires and returns 403 Forbidden
  - User can regenerate export with fresh link
  - Expired exports are still listed in export history

### Data Retention

**AC-12: 7-Day Purge**
- **Given:** Files and exports were created 8 days ago
- **When:** Nightly retention job runs
- **Then:**
  - Files older than 7 days are marked as `isPurged: true` in Firestore
  - Actual files are deleted from Firebase Storage
  - Exports older than 7 days are similarly purged
  - Templates and draft documents are NOT purged
  - Purge job logs summary: number of files/exports purged, bytes freed

**AC-13: Retention Warning**
- **Given:** User is uploading a file
- **When:** File upload page loads
- **Then:**
  - Prominent message states: "Files are automatically deleted after 7 days. Export important documents to save permanently."
  - Message includes icon and stands out visually

### Authentication & Security

**AC-14: Login & Role Assignment**
- **Given:** New user signs up with email/password or Google
- **When:** User completes authentication
- **Then:**
  - User profile is created in Firestore
  - User is assigned role (Attorney or Paralegal) based on registration form
  - User is redirected to dashboard
  - Firebase ID token is issued and stored securely

**AC-15: Unauthorized Access**
- **Given:** User is not authenticated
- **When:** User attempts to access `/matters` or any protected route
- **Then:**
  - User is redirected to login page
  - After successful login, user is redirected back to originally requested page

---

## 15. Dependencies & Assumptions

### External Service Dependencies

#### OpenAI API
- **Dependency:** Access to OpenAI API (GPT-4 or GPT-3.5-turbo)
- **Assumption:** OpenAI API will be available with 99.9% uptime
- **Assumption:** API rate limits are sufficient for projected usage (~50 generations/day)
- **Risk:** API costs may vary; need to monitor usage
- **Mitigation:** Implement rate limiting; optimize prompts for token efficiency; consider caching common sections

#### AWS Textract
- **Dependency:** AWS Textract for OCR on scanned PDFs
- **Assumption:** Textract can process typical legal documents (police reports, medical records) with acceptable accuracy
- **Assumption:** Processing time is reasonable (<60 seconds for 100-page document)
- **Risk:** OCR quality depends on scan quality; may fail on extremely poor scans
- **Mitigation:** Set confidence thresholds; provide "needs review" warnings; allow manual text entry

#### Firebase Services
- **Dependency:** Firebase Auth, Firestore, Storage, Hosting, Cloud Functions
- **Assumption:** Firebase services provide required scalability and reliability
- **Assumption:** Single-firm deployment fits within Firebase quotas and pricing tiers
- **Risk:** Cost increases with storage and function invocations
- **Mitigation:** 7-day retention policy; optimize function cold starts; monitor usage

#### AWS Services
- **Dependency:** AWS API Gateway, Lambda, Secrets Manager
- **Assumption:** Lambda cold starts are acceptable (<2 seconds) or can be mitigated with provisioned concurrency
- **Assumption:** API Gateway can handle expected request volume
- **Risk:** Cross-region latency between Firebase (us-central1) and AWS (us-east-1)
- **Mitigation:** Consider co-locating regions or caching frequently accessed data

### Technical Assumptions

- **Internet Connectivity:** Users have reliable internet connection (required for cloud services)
- **Browser Compatibility:** Users access system via modern desktop browsers (Chrome, Firefox, Safari, Edge)
- **File Formats:** Source documents are in standard PDF, DOCX, or TXT formats (no exotic formats)
- **Legal Language:** AI can generate acceptable demand letter content in English for US jurisdiction
- **Team Size:** Single firm with 5-20 users (parallelization and advanced scaling not required initially)

### Business Assumptions

- **User Training:** Users will receive basic training or onboarding on how to use the system
- **Sample Data:** Client provides sample demand letters and source documents for testing and AI prompt refinement
- **Legal Review:** Legal domain experts are available to review and refine AI outputs during development
- **Template Creation:** Client will create initial templates or provide examples for us to model
- **Feedback Loop:** Users will provide feedback during development for iterative improvements

### Data Assumptions

- **Source Document Quality:** Uploaded documents are legible and contain relevant case information
- **OCR Accuracy:** For scanned documents, OCR will achieve >70% accuracy on average
- **Template Variables:** Client can provide list of common variables used in their demand letters
- **Reasonable File Sizes:** Most documents will be 1-5 MB; 10 MB limit is adequate
- **7-Day Retention:** 7 days is sufficient for users to generate drafts and export; no long-term file storage needed

---

## 16. Risks & Mitigations

### Technical Risks

#### Risk 1: OCR Variability on Low-Quality Scans
**Impact:** High  
**Probability:** Medium

**Description:**  
Scanned PDFs with poor image quality (faded, handwritten, skewed) may result in inaccurate OCR, leading to missing or incorrect information in drafts.

**Mitigation:**
- Set confidence thresholds (e.g., <50% triggers warning)
- Display "needs review" banner for low-confidence OCR
- Allow users to re-upload better scans
- Provide manual text entry option as fallback
- Test with variety of scan qualities during development

#### Risk 2: LLM Drift in Tone/Structure
**Impact:** High  
**Probability:** Medium

**Description:**  
AI-generated content may occasionally deviate from professional legal tone, include inappropriate language, or fail to follow template structure.

**Mitigation:**
- Use low temperature (0.2–0.4) for consistency
- Section-by-section generation with focused prompts
- Post-processing validation and formatting
- Template-based structure enforcement
- Regular review of generated outputs during development
- User testing with legal professionals to refine prompts

#### Risk 3: Real-Time Collaboration Conflicts
**Impact:** Medium  
**Probability:** Low

**Description:**  
Simultaneous edits to the same text by multiple users could result in conflicts, lost edits, or inconsistent state.

**Mitigation:**
- Use Firestore's real-time listeners and optimistic locking
- Implement basic conflict detection (last-write-wins for now)
- Test with concurrent users during QA
- Document known edge cases and workarounds
- Consider CRDT implementation in future if conflicts arise

#### Risk 4: Cross-Region Latency
**Impact:** Medium  
**Probability:** Medium

**Description:**  
Firebase services in us-central1 and AWS services in us-east-1 may introduce latency (50-100ms) in API calls.

**Mitigation:**
- Cache templates and frequently accessed data in Firebase
- Batch API calls where possible (e.g., generate all sections in one Lambda invocation)
- Monitor latency metrics; optimize if exceeds thresholds
- Consider co-locating Firebase and AWS in same region if latency is problematic

#### Risk 5: Lambda Cold Starts
**Impact:** Low  
**Probability:** High

**Description:**  
Lambda functions may experience cold starts (1-3 second delays) during first invocation or after periods of inactivity.

**Mitigation:**
- Use lightweight Lambda runtimes (Node.js, not Java)
- Keep function code small; minimize dependencies
- Consider provisioned concurrency for critical functions (costs extra)
- Set user expectations with loading states ("Generating draft, this may take 30-60 seconds")

### Operational Risks

#### Risk 6: OpenAI API Costs
**Impact:** Medium  
**Probability:** Medium

**Description:**  
If usage is higher than expected, OpenAI API costs (per token) could exceed budget.

**Mitigation:**
- Set file upload limits (10 files, 10 MB each) to control input size
- Use efficient prompts; avoid unnecessary context
- Monitor token usage per generation
- Implement rate limiting per user/firm
- Consider GPT-3.5-turbo (cheaper) if GPT-4 costs are prohibitive
- 7-day retention reduces storage costs

#### Risk 7: AWS Textract Costs
**Impact:** Low  
**Probability:** Low

**Description:**  
Textract charges per page processed. High OCR volume could increase costs.

**Mitigation:**
- 100-page limit per file
- Only OCR when necessary (not for digital PDFs with selectable text)
- Cache OCR results; don't re-process same file
- Monitor Textract usage and costs
- Provide option to skip OCR if not needed

#### Risk 8: Service Downtime (OpenAI, AWS, Firebase)
**Impact:** High  
**Probability:** Low

**Description:**  
External service outages would prevent draft generation, OCR, or file access.

**Mitigation:**
- Implement retry logic with exponential backoff
- Display user-friendly error messages ("Service temporarily unavailable, please try again shortly")
- Save partial progress where possible
- Monitor service status pages for OpenAI/AWS/Firebase
- Have support contact info visible for critical issues

### User Experience Risks

#### Risk 9: User Expectations of AI Quality
**Impact:** High  
**Probability:** Medium

**Description:**  
Users may expect AI to generate perfect, final-ready demand letters without any editing, which is unrealistic.

**Mitigation:**
- Set expectations during onboarding: "AI generates a first draft; attorney review required"
- Emphasize that system saves time but doesn't replace legal expertise
- Show examples of typical output during training
- Gather feedback early and iterate on prompt quality
- Provide "refine section" feature so users can guide AI

#### Risk 10: Learning Curve for Collaboration Features
**Impact:** Low  
**Probability:** Medium

**Description:**  
Users unfamiliar with real-time collaboration may be confused by change tracking or presence indicators.

**Mitigation:**
- Provide guided onboarding tour for collaboration features
- Use familiar patterns from Google Docs
- Include help tooltips and documentation
- Keep collaboration UI simple and intuitive
- Monitor user feedback and adjust UI as needed

---

## 17. Out of Scope

The following features and integrations are **explicitly excluded** from the current project scope. These may be considered for future phases.

### Excluded Features

#### 1. Deep DMS/Firm System Integrations
- **iManage**, **NetDocs**, **Worldox** integration
- **Clio**, **MyCase**, **PracticePanther** practice management integrations
- Automated document syncing with external systems
- SSO via firm-specific identity providers (beyond Google OAuth)

**Rationale:** Integration complexity adds significant development time; can be added later based on client needs.

#### 2. eSignature & Sending Workflows
- Embedded eSignature (DocuSign, Adobe Sign)
- Automatic sending of demand letters to opposing counsel
- Delivery confirmation and read receipts
- Follow-up reminders for unanswered demands

**Rationale:** Out of core scope; users can export DOCX and handle sending separately.

#### 3. Legal Research & Caselaw Retrieval
- Integration with legal research databases (Westlaw, LexisNexis)
- Automatic citation of relevant case law
- Legal issue spotting and research suggestions

**Rationale:** Highly complex and expensive; focused on document generation, not research.

#### 4. Named Version Snapshots & Diff Views
- Save named versions (v1, v2, final)
- Visual diff/comparison between versions
- Rollback to previous versions

**Rationale:** Change tracking provides basic version awareness; full version control adds complexity.

#### 5. Advanced Collaboration Features
- Presence cursors (showing where other users are typing in real-time)
- Suggestion mode with accept/reject for each change
- Video/voice calling within app
- Threaded discussions beyond simple comments

**Rationale:** Basic real-time editing and comments are sufficient for MVP; advanced features can be added later.

#### 6. Mobile Applications
- Native iOS app
- Native Android app
- Optimized mobile web experience

**Rationale:** Desktop-focused for initial release; responsive design provides basic mobile access.

#### 7. Multi-Tenant / Multi-Firm Deployment
- Full multi-tenant architecture with firm isolation
- Per-firm billing and quotas
- Firm admin portal for user management

**Rationale:** Single-firm deployment simplifies architecture; multi-tenancy can be added if product scales.

#### 8. Advanced Analytics & Reporting
- Dashboard with usage metrics
- Draft turnaround time reports
- AI refinement frequency analysis
- User productivity reports

**Rationale:** Focus on core workflow first; analytics are nice-to-have.

#### 9. Custom Document Types Beyond Demand Letters
- Complaints, motions, discovery requests, briefs
- Generic document generation

**Rationale:** Demand letters are the focused use case; expanding to other documents requires different templates and AI strategies.

#### 10. Third-Party API Access
- Public API for external integrations
- Webhooks for events
- API key management for developers

**Rationale:** Internal use only for now; API access requires additional security and documentation.

#### 11. PDF Export (Only DOCX)
- Native PDF generation

**Rationale:** Users can convert DOCX to PDF using Microsoft Word or other tools; DOCX is the primary format for editing.

#### 12. Advanced AI Features
- Multi-language support
- Legal jurisdiction-specific templates (international)
- AI training on firm-specific past demand letters
- Predictive settlement amount recommendations

**Rationale:** These require significant AI/ML work and legal expertise beyond current scope.

---

## Appendix A: Glossary

- **Attorney:** Primary user who drafts and finalizes demand letters
- **Paralegal:** Secondary user who assists attorneys with document preparation and collaboration
- **Demand Letter:** Formal letter requesting settlement before litigation; includes facts, liability analysis, damages, and settlement demand
- **Draft:** AI-generated or manually created demand letter document in progress
- **Matter:** A legal case requiring a demand letter; container for files, drafts, and metadata
- **OCR (Optical Character Recognition):** Technology to extract text from scanned images/PDFs
- **Template:** Pre-defined structure and prompts for generating demand letters with consistent format
- **Template Variable:** Placeholder (e.g., `{{client_name}}`) replaced with actual values during generation
- **CRDT (Conflict-free Replicated Data Type):** Data structure for real-time collaboration without conflicts (future consideration)
- **Firebase ID Token:** JWT issued by Firebase Auth; used to authenticate API requests
- **Section:** One of four parts of a demand letter: Facts, Liability, Damages, Demand
- **Refinement:** AI regeneration of a specific section based on attorney instructions

---

## Appendix B: References

- **Stenotrapper PRD v1:** Original technical PRD (source document 1)
- **PRD Steno Demand Letter Generator:** Business requirements from Steno (source document 2)
- **OpenAI API Documentation:** https://platform.openai.com/docs
- **AWS Textract Documentation:** https://docs.aws.amazon.com/textract/
- **Firebase Documentation:** https://firebase.google.com/docs
- **TipTap Editor:** https://tiptap.dev/ (collaborative rich text editor)

---

## Document Change Log

| Version | Date       | Author | Changes                                      |
|---------|------------|--------|----------------------------------------------|
| 1.0     | 2025-11-11 | AI     | Initial comprehensive PRD based on two source documents and stakeholder clarifications |

---

**End of Product Requirements Document**

*This PRD serves as the authoritative specification for the Stenographer Demand Letter Generator. All development, design, and testing should reference this document. Changes to scope or requirements must be approved and documented via formal change requests.*

