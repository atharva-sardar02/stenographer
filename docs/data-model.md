# Firestore Data Model Documentation

This document describes the data model for the Stenographer Demand Letter Generator application.

## Overview

The application uses Firestore (Native mode) as its primary database. All collections are organized to support efficient querying and secure access patterns.

## Collections

### 1. Users (`/users/{userId}`)

Stores user profile information.

**Type:** `User`

```typescript
interface User {
  userId: string;              // Document ID (matches Firebase Auth UID)
  email: string;
  displayName: string;
  role: 'attorney' | 'paralegal';
  createdAt: Date | string;
  lastLoginAt: Date | string;
}
```

**Security Rules:**
- Read: Authenticated users can read all user profiles
- Write: Users can only write their own profile

**Indexes:**
- None required (single document lookups by userId)

---

### 2. Matters (`/matters/{matterId}`)

Represents a legal matter/case that contains files and drafts.

**Type:** `Matter`

```typescript
interface Matter {
  matterId: string;            // Document ID
  title: string;
  clientName: string;
  status: 'active' | 'draft' | 'completed' | 'archived';
  participants: string[];      // Array of userIds
  createdBy: string;           // userId
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

**Security Rules:**
- Read/Write: Authenticated users can read/write all matters

**Indexes:**
- `createdBy` (ASC) + `status` (ASC) + `createdAt` (DESC) - For user dashboard queries
- `participants` (ARRAY_CONTAINS) + `status` (ASC) + `createdAt` (DESC) - For participant-based queries

**Subcollections:**
- `/matters/{matterId}/files/{fileId}` - Files associated with this matter

---

### 3. Files (`/matters/{matterId}/files/{fileId}`)

Represents uploaded source documents (PDFs, DOCX, TXT) for a matter.

**Type:** `File`

```typescript
interface File {
  fileId: string;             // Document ID
  matterId: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt';
  size: number;                // Bytes
  storagePath: string;        // Path in Firebase Storage
  uploadedBy: string;          // userId
  uploadedAt: Date | string;
  ocrStatus: 'pending' | 'processing' | 'done' | 'failed' | null;
  ocrText: string | null;      // Extracted text from OCR
  ocrConfidence: number | null; // 0-100
  ocrPages: number | null;
  ocrError: string | null;
  purgeAt: Date | string;     // Auto-purge date (7 days)
  isPurged: boolean;
}
```

**Security Rules:**
- Read/Write: Authenticated users can access files within matters

**Indexes:**
- `matterId` (ASC) + `uploadedAt` (DESC) - For listing files by matter

**Storage:**
- Files are stored in Firebase Storage at: `matters/{matterId}/files/{fileName}`

---

### 4. Templates (`/templates/{templateId}`)

Predefined templates for generating demand letters.

**Type:** `Template`

```typescript
interface Template {
  templateId: string;          // Document ID
  name: string;
  description: string;
  sections: {
    facts: TemplateSection;
    liability: TemplateSection;
    damages: TemplateSection;
    demand: TemplateSection;
  };
  variables: TemplateVariable[];
  createdBy: string;           // userId (must be attorney)
  createdAt: Date | string;
  updatedAt: Date | string;
  isActive: boolean;
}

interface TemplateSection {
  title: string;
  prompt: string;
  content: string;
}

interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date';
  required: boolean;
  defaultValue: string | null;
}
```

**Security Rules:**
- Read: Authenticated users can read all templates
- Write: Only attorneys can create/update templates

**Indexes:**
- None required (typically fetched by templateId or listed all)

---

### 5. Drafts (`/drafts/{draftId}`)

Generated and edited demand letter drafts.

**Type:** `Draft`

```typescript
interface Draft {
  draftId: string;             // Document ID
  matterId: string;
  templateId: string | null;
  state: 'generating' | 'editing' | 'final';
  sections: {
    facts: DraftSection;
    liability: DraftSection;
    damages: DraftSection;
    demand: DraftSection;
  };
  variables: Record<string, any>;
  generatedBy: string;        // userId
  lastGeneratedAt: Date | string;
  lastEditedAt: Date | string;
  lastEditedBy: string;       // userId
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface DraftSection {
  content: string;
  generatedAt: Date | string;
}
```

**Security Rules:**
- Read/Write: Authenticated users can read/write all drafts

**Indexes:**
- `matterId` (ASC) + `lastEditedAt` (DESC) - For listing drafts by matter

**Subcollections:**
- `/drafts/{draftId}/collaboration` - Real-time collaboration data

---

### 6. Exports (`/exports/{exportId}`)

Exported DOCX files generated from drafts.

**Type:** `Export`

```typescript
interface Export {
  exportId: string;            // Document ID
  draftId: string;
  matterId: string;
  format: 'docx';             // Only DOCX supported
  storagePath: string;        // Path in Firebase Storage
  exportedBy: string;         // userId
  exportedAt: Date | string;
  fileSize: number;           // Bytes
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string | null;
  purgeAt: Date | string;     // Auto-purge date (7 days)
  isPurged: boolean;
}
```

**Security Rules:**
- Read/Write: Authenticated users can read/write their own exports

**Indexes:**
- `exportedBy` (ASC) + `exportedAt` (DESC) - For listing user's exports
- `matterId` (ASC) + `exportedAt` (DESC) - For listing exports by matter

**Storage:**
- Exported files are stored in Firebase Storage at: `exports/{exportId}/{fileName}`

---

### 7. Jobs (`/jobs/{jobId}`)

Background job tracking for async operations (OCR, draft generation, etc.).

**Type:** `Job`

```typescript
interface Job {
  jobId: string;              // Document ID
  type: 'ocr' | 'draft_generation' | 'draft_refinement' | 'export';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  matterId: string | null;
  draftId: string | null;
  fileId: string | null;
  exportId: string | null;
  createdBy: string;          // userId
  createdAt: Date | string;
  startedAt: Date | string | null;
  completedAt: Date | string | null;
  error: string | null;
  metadata: Record<string, any>; // Job-specific data
}
```

**Security Rules:**
- Read: Authenticated users can read jobs
- Write: Only backend (Firebase Functions/AWS Lambda) can write jobs

**Indexes:**
- `createdBy` (ASC) + `status` (ASC) + `createdAt` (DESC) - For listing user's jobs
- `type` (ASC) + `status` (ASC) + `createdAt` (DESC) - For listing jobs by type

---

## Data Relationships

```
User
  └── creates → Matter
       ├── contains → File (subcollection)
       └── has → Draft
            └── generates → Export
                 └── tracked by → Job
```

## Auto-Purge Policy

Files and exports are automatically purged after 7 days:

- **Files:** `purgeAt` field set to `createdAt + 7 days`
- **Exports:** `purgeAt` field set to `exportedAt + 7 days`
- **Purge Process:** Firebase Function scheduled job runs daily to delete expired documents

## Security Rules Summary

| Collection | Read | Write |
|------------|------|-------|
| Users | Authenticated | Own profile only |
| Matters | Authenticated | Authenticated |
| Files | Authenticated | Authenticated |
| Templates | Authenticated | Attorneys only |
| Drafts | Authenticated | Authenticated |
| Exports | Authenticated | Own exports |
| Jobs | Authenticated | Backend only |

## Query Patterns

### Common Queries

1. **User Dashboard - List Matters**
   ```typescript
   collection('matters')
     .where('createdBy', '==', userId)
     .where('status', '==', 'active')
     .orderBy('createdAt', 'desc')
   ```

2. **Matter Files**
   ```typescript
   collection('matters').doc(matterId)
     .collection('files')
     .orderBy('uploadedAt', 'desc')
   ```

3. **Matter Drafts**
   ```typescript
   collection('drafts')
     .where('matterId', '==', matterId)
     .orderBy('lastEditedAt', 'desc')
   ```

4. **User Exports**
   ```typescript
   collection('exports')
     .where('exportedBy', '==', userId)
     .orderBy('exportedAt', 'desc')
   ```

5. **Active Templates**
   ```typescript
   collection('templates')
     .where('isActive', '==', true)
   ```

## Indexes

All composite indexes are defined in `firebase/firestore.indexes.json`:

1. Matters by `createdBy` + `status` + `createdAt`
2. Matters by `participants` (array) + `status` + `createdAt`
3. Files by `matterId` + `uploadedAt`
4. Drafts by `matterId` + `lastEditedAt`

Additional indexes may be created automatically by Firestore when needed, or can be added manually through the Firebase Console.

---

_Last Updated: PR #3 Implementation_

