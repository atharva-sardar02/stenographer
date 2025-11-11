# Stenographer - Development Task List

> **Purpose:** This document breaks down the implementation of the Stenographer Demand Letter Generator into Pull Requests (PRs) with subtasks, file changes, and testing requirements.

---

## Project File Structure

```
stenographer/
├── frontend/                           # React SPA
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── auth/                  # Auth-related components
│   │   │   ├── editor/                # Editor components
│   │   │   ├── files/                 # File upload/management
│   │   │   ├── templates/             # Template components
│   │   │   ├── matters/               # Matter components
│   │   │   ├── drafts/                # Draft components
│   │   │   ├── collaboration/         # Collaboration UI
│   │   │   └── common/                # Common UI (buttons, modals, etc.)
│   │   ├── pages/                     # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MatterDetail.tsx
│   │   │   ├── DraftEditor.tsx
│   │   │   └── Templates.tsx
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useFirestore.ts
│   │   │   ├── useStorage.ts
│   │   │   └── useCollaboration.ts
│   │   ├── services/                  # API service layer
│   │   │   ├── api.ts                 # Firebase Function API client
│   │   │   ├── auth.service.ts
│   │   │   ├── matter.service.ts
│   │   │   ├── file.service.ts
│   │   │   ├── template.service.ts
│   │   │   ├── draft.service.ts
│   │   │   └── export.service.ts
│   │   ├── contexts/                  # React Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   └── CollaborationContext.tsx
│   │   ├── utils/                     # Utility functions
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   ├── types/                     # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── public/
│   ├── tests/                         # Frontend tests
│   │   ├── unit/
│   │   └── integration/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── firebase/                           # Firebase services
│   ├── functions/
│   │   ├── src/
│   │   │   ├── index.ts               # Main entry point
│   │   │   ├── proxy/                 # Proxy to AWS
│   │   │   │   ├── index.ts
│   │   │   │   └── aws-client.ts
│   │   │   ├── scheduled/             # Scheduled jobs
│   │   │   │   └── retention.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   └── errorHandler.ts
│   │   │   └── utils/
│   │   │       └── logger.ts
│   │   ├── tests/                     # Function tests
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── firestore.rules                # Firestore security rules
│   ├── storage.rules                  # Storage security rules
│   ├── firestore.indexes.json         # Firestore indexes
│   └── firebase.json                  # Firebase config
├── aws-lambda/                         # AWS Lambda functions
│   ├── shared/                        # Shared code
│   │   ├── utils/
│   │   └── types/
│   ├── upload/                        # File upload handlers
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── template.yaml
│   ├── ocr/                           # OCR processing
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── template.yaml
│   ├── templates/                     # Template CRUD
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── template.yaml
│   ├── drafts/                        # Draft generation & refinement
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── generate.ts
│   │   │   ├── refine.ts
│   │   │   └── prompts.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── template.yaml
│   ├── exports/                       # DOCX export
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── template.yaml
│   └── retention/                     # Data purge
│       ├── src/
│       │   └── index.ts
│       ├── tests/
│       ├── package.json
│       └── template.yaml
├── shared/                            # Shared types across services
│   ├── types/
│   │   ├── user.ts
│   │   ├── matter.ts
│   │   ├── file.ts
│   │   ├── template.ts
│   │   ├── draft.ts
│   │   └── api.ts
│   └── package.json
├── docs/                              # Documentation
│   ├── setup.md
│   ├── deployment.md
│   └── api.md
├── .github/                           # GitHub workflows
│   └── workflows/
│       ├── deploy-frontend.yml
│       ├── deploy-firebase.yml
│       └── deploy-lambda.yml
├── prd_stenographer.md                # PRD document
├── TASK_LIST.md                       # This file
├── README.md
└── .gitignore
```

---

## Pull Requests & Tasks

### **PR #1: Project Setup & Infrastructure** 🏗️

**Description:** Initialize project structure, configure build tools, set up Firebase and AWS infrastructure.

**Files Created/Modified:**
- `README.md` - Project overview and setup instructions
- `.gitignore` - Ignore node_modules, env files, build artifacts
- `frontend/package.json` - React, Vite, TailwindCSS, Firebase SDK
- `frontend/vite.config.ts` - Vite configuration
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/.env.example` - Environment variable template
- `firebase/firebase.json` - Firebase project configuration
- `firebase/functions/package.json` - Firebase Functions dependencies
- `firebase/functions/tsconfig.json` - TypeScript config for functions
- `aws-lambda/shared/package.json` - Shared Lambda dependencies
- `shared/package.json` - Shared types package
- `.github/workflows/deploy-frontend.yml` - Frontend CI/CD
- `.github/workflows/deploy-firebase.yml` - Firebase CI/CD
- `.github/workflows/deploy-lambda.yml` - Lambda CI/CD

#### Subtasks:
- [ ] **1.1** Initialize monorepo structure with folders
- [ ] **1.2** Set up Frontend (React + Vite + TypeScript)
  - Install dependencies: `react`, `react-dom`, `react-router-dom`, `firebase`, `@tanstack/react-query`
  - Configure Vite for development and production
  - Set up TailwindCSS for styling
- [ ] **1.3** Set up Firebase project
  - Create Firebase project in console
  - Initialize Firebase SDK
  - Configure environments (dev, staging, prod)
- [ ] **1.4** Set up AWS infrastructure
  - Create IAM roles for Lambda execution
  - Set up API Gateway
  - Configure AWS Secrets Manager
- [ ] **1.5** Create shared types package
  - Define base TypeScript interfaces
- [ ] **1.6** Set up GitHub Actions CI/CD pipelines
  - Automate build and deployment
- [ ] **1.7** Create initial documentation
  - `docs/setup.md` - Development setup guide
  - `docs/deployment.md` - Deployment instructions

**Testing:** ✅
- [ ] **Unit Test:** Validate build configurations (Vite, TypeScript compile successfully)
- [ ] **Integration Test:** Deploy "Hello World" to Firebase Hosting and verify access

---

### **PR #2: Authentication & User Management** 🔐

**Description:** Implement Firebase Authentication with Email/Password and Google OAuth, create user profiles in Firestore.

**Files Created/Modified:**
- `frontend/src/services/auth.service.ts` - Auth service wrapper
- `frontend/src/contexts/AuthContext.tsx` - Auth context provider
- `frontend/src/hooks/useAuth.ts` - Auth custom hook
- `frontend/src/pages/Login.tsx` - Login page UI
- `frontend/src/pages/Signup.tsx` - Signup page UI
- `frontend/src/components/auth/LoginForm.tsx` - Login form component
- `frontend/src/components/auth/GoogleAuthButton.tsx` - Google OAuth button
- `frontend/src/utils/validators.ts` - Email/password validation
- `firebase/functions/src/index.ts` - Add user creation trigger
- `frontend/src/types/index.ts` - Add User type

#### Subtasks:
- [ ] **2.1** Enable Firebase Auth in Firebase Console
  - Enable Email/Password provider
  - Enable Google OAuth provider
- [ ] **2.2** Create auth service (`auth.service.ts`)
  - `signUp(email, password, displayName, role)`
  - `signIn(email, password)`
  - `signInWithGoogle()`
  - `signOut()`
  - `onAuthStateChanged(callback)`
- [ ] **2.3** Create AuthContext and hook
  - Provide user state across app
  - Handle loading and error states
- [ ] **2.4** Build Login/Signup UI
  - Login form with email/password
  - Google OAuth button
  - Role selection (Attorney/Paralegal)
  - Form validation
- [ ] **2.5** Create Firebase Function trigger for user creation
  - On new user signup, create `/users/{userId}` document in Firestore
  - Store email, displayName, role, timestamps
- [ ] **2.6** Add protected route wrapper
  - Redirect unauthenticated users to login
  - Redirect authenticated users away from login

**Testing:** ✅
- [ ] **Unit Test:** Validate email/password format (`validators.ts`)
- [ ] **Unit Test:** Mock auth service methods and verify correct Firebase SDK calls
- [ ] **Integration Test:** End-to-end signup flow (create user, verify Firestore document)
- [ ] **Integration Test:** Login with email/password and Google OAuth, verify token received

---

### **PR #3: Firestore Schema & Security Rules** 🗄️

**Description:** Define Firestore data model, implement security rules for all collections.

**Files Created/Modified:**
- `firebase/firestore.rules` - Security rules
- `firebase/firestore.indexes.json` - Composite indexes
- `shared/types/user.ts` - User type definitions
- `shared/types/matter.ts` - Matter type definitions
- `shared/types/file.ts` - File type definitions
- `shared/types/template.ts` - Template type definitions
- `shared/types/draft.ts` - Draft type definitions
- `docs/data-model.md` - Data model documentation

#### Subtasks:
- [ ] **3.1** Define TypeScript types for all collections
  - User, Matter, File, Template, Draft, Export, Job types
- [ ] **3.2** Write Firestore security rules
  - Users: read all, write own profile
  - Matters: authenticated users can read/write
  - Files: authenticated users can read/write within their matters
  - Templates: read all, write for attorneys only
  - Drafts: authenticated users can read/write
  - Exports: authenticated users can read/write own exports
  - Jobs: read-only (backend writes only)
- [ ] **3.3** Define composite indexes for common queries
  - Matters by userId and status
  - Files by matterId and uploadedAt
  - Drafts by matterId
- [ ] **3.4** Deploy Firestore rules and indexes
- [ ] **3.5** Document data model in `docs/data-model.md`

**Testing:** ✅
- [ ] **Unit Test:** Use `@firebase/rules-unit-testing` to test security rules
  - Verify authenticated users can read/write matters
  - Verify unauthenticated users are blocked
  - Verify attorneys can write templates, paralegals cannot
- [ ] **Integration Test:** Simulate various user roles and verify Firestore access patterns

---

### **PR #4: Matter Management (Dashboard & CRUD)** 📁

**Description:** Implement matter creation, listing, and detail views in the UI.

**Files Created/Modified:**
- `frontend/src/services/matter.service.ts` - Matter CRUD operations
- `frontend/src/pages/Dashboard.tsx` - Dashboard with matter list
- `frontend/src/pages/MatterDetail.tsx` - Matter detail view
- `frontend/src/components/matters/MatterCard.tsx` - Matter list item
- `frontend/src/components/matters/CreateMatterModal.tsx` - Create matter form
- `frontend/src/components/matters/MatterTabs.tsx` - Tabs for Overview/Files/Drafts/Activity
- `frontend/src/hooks/useFirestore.ts` - Generic Firestore hook

#### Subtasks:
- [ ] **4.1** Create matter service (`matter.service.ts`)
  - `createMatter(data)` - Create new matter
  - `getMatters(userId)` - List user's matters
  - `getMatter(matterId)` - Get single matter
  - `updateMatter(matterId, data)` - Update matter
  - `deleteMatter(matterId)` - Delete matter (soft delete)
- [ ] **4.2** Build Dashboard page
  - List all matters for authenticated user
  - Filter by status (active, draft, completed, archived)
  - Search matters by client name or title
  - "Create New Matter" button
- [ ] **4.3** Build CreateMatterModal component
  - Form: title, client name, status
  - Validation
  - Submit to Firestore
- [ ] **4.4** Build MatterDetail page
  - Display matter metadata
  - Tabs: Overview, Files, Drafts, Activity
  - Edit matter details inline
- [ ] **4.5** Add navigation and routing
  - `/dashboard` - Matter list
  - `/matters/:matterId` - Matter detail

**Testing:** ✅
- [ ] **Unit Test:** Validate matter form inputs (required fields, max lengths)
- [ ] **Integration Test:** Create matter and verify Firestore document created
- [ ] **Integration Test:** List matters and verify filtering/search works

---

### **PR #5: File Upload & Storage** 📤

**Description:** Implement file upload to Firebase Storage with progress tracking and validation.

**Files Created/Modified:**
- `frontend/src/services/file.service.ts` - File upload service
- `frontend/src/components/files/FileUpload.tsx` - Drag-and-drop upload UI
- `frontend/src/components/files/FileList.tsx` - List uploaded files
- `frontend/src/components/files/FileCard.tsx` - Single file display
- `frontend/src/utils/validators.ts` - File validation (type, size, pages)
- `firebase/storage.rules` - Storage security rules
- `firebase/functions/src/index.ts` - Add file finalize trigger
- `aws-lambda/upload/src/index.ts` - uploadInit and finalize handlers

#### Subtasks:
- [ ] **5.1** Set up Firebase Storage rules
  - Allow authenticated users to upload to `matters/{matterId}/files/`
  - Enforce size limits (10MB)
- [ ] **5.2** Create AWS Lambda for `uploadInit`
  - Generate signed Firebase Storage URL
  - Return `{ fileId, uploadUrl, storagePath }`
- [ ] **5.3** Create Firebase Function proxy endpoint
  - `POST /api/v1/files:uploadInit`
  - Verify Firebase ID token, forward to Lambda
- [ ] **5.4** Build file upload UI
  - Drag-and-drop zone
  - File type validation (PDF, DOCX, TXT only)
  - File size validation (≤10MB)
  - Upload progress bar
- [ ] **5.5** Create file service (`file.service.ts`)
  - `initiateUpload(matterId, file)` - Get signed URL
  - `uploadToStorage(url, file)` - Upload file to Storage
  - `finalizeUpload(fileId, matterId)` - Create Firestore doc
  - `getFiles(matterId)` - List files for matter
  - `deleteFile(fileId)` - Delete file
- [ ] **5.6** Create AWS Lambda for `finalize`
  - Create `/matters/{matterId}/files/{fileId}` document in Firestore
  - Set `purgeAt` to `uploadedAt + 7 days`
  - Return file metadata
- [ ] **5.7** Build FileList component
  - Display uploaded files with metadata (name, size, type, upload date)
  - Show OCR status badge (pending/done/failed)
  - Delete file button
- [ ] **5.8** Integrate into MatterDetail page
  - "Files" tab displays FileList and FileUpload

**Testing:** ✅
- [ ] **Unit Test:** File validation logic (type, size, extension)
- [ ] **Unit Test:** Verify `purgeAt` calculation is correct (+7 days)
- [ ] **Integration Test:** Full upload flow (initiate, upload to Storage, finalize, verify Firestore doc)
- [ ] **Integration Test:** Upload oversized file and verify rejection with error message

---

### **PR #6: OCR Processing (AWS Textract)** 🔍

**Description:** Implement OCR for scanned PDFs using AWS Textract, update file status.

**Files Created/Modified:**
- `aws-lambda/ocr/src/index.ts` - OCR extraction handler
- `aws-lambda/ocr/src/textract.ts` - Textract API wrapper
- `firebase/functions/src/index.ts` - Add proxy endpoint for OCR
- `frontend/src/components/files/OcrStatusBadge.tsx` - OCR status UI
- `frontend/src/services/file.service.ts` - Add `triggerOcr()` method

#### Subtasks:
- [ ] **6.1** Create AWS Lambda for OCR (`/v1/ocr:extract`)
  - Retrieve file from Firebase Storage
  - Call AWS Textract `DetectDocumentText` API
  - Parse response: extract text, page count, confidence scores
  - Update Firestore file document with OCR results
  - Handle errors (low quality, unsupported format)
- [ ] **6.2** Modify file finalize handler to auto-trigger OCR
  - If file type is PDF, create OCR job
  - Update file `ocrStatus` to "processing"
- [ ] **6.3** Create Firebase Function proxy for OCR
  - `POST /api/v1/ocr:extract`
- [ ] **6.4** Build OcrStatusBadge component
  - Display status: Pending (yellow), Processing (blue), Done (green), Failed (red)
  - Show confidence score for completed OCR
  - "Needs Review" warning if confidence <50%
- [ ] **6.5** Add manual OCR trigger button
  - In FileCard, add "Re-run OCR" button for failed OCR
- [ ] **6.6** Handle OCR completion in UI
  - Real-time Firestore listener updates OCR status
  - Show success toast when OCR completes

**Testing:** ✅
- [ ] **Unit Test:** Mock Textract API response and verify parsing logic
- [ ] **Unit Test:** Verify confidence threshold logic (<50% = needs review)
- [ ] **Integration Test:** Upload scanned PDF, trigger OCR, verify text extracted and stored in Firestore
- [ ] **Integration Test:** Upload non-scanned PDF, verify OCR is skipped or returns selectable text

---

### **PR #7: Template Management (CRUD)** 📋

**Description:** Implement template creation, editing, listing, and preview.

**Files Created/Modified:**
- `frontend/src/services/template.service.ts` - Template CRUD service
- `frontend/src/pages/Templates.tsx` - Template list page
- `frontend/src/components/templates/TemplateCard.tsx` - Template list item
- `frontend/src/components/templates/TemplateForm.tsx` - Create/edit template form
- `frontend/src/components/templates/SectionEditor.tsx` - Edit section (title, prompt, content)
- `frontend/src/components/templates/VariableManager.tsx` - Add/edit template variables
- `frontend/src/components/templates/TemplatePreview.tsx` - Preview template
- `aws-lambda/templates/src/index.ts` - Template CRUD Lambda handlers

#### Subtasks:
- [ ] **7.1** Create AWS Lambda for template CRUD
  - `POST /v1/templates` - Create template
  - `GET /v1/templates` - List templates
  - `GET /v1/templates/:id` - Get single template
  - `PUT /v1/templates/:id` - Update template
  - `DELETE /v1/templates/:id` - Delete template
  - Store in Firestore `/templates/{templateId}`
- [ ] **7.2** Create Firebase Function proxy endpoints
  - Forward template requests to Lambda
  - Verify user role (attorneys only for write operations)
- [ ] **7.3** Build template service (`template.service.ts`)
  - `createTemplate(data)`
  - `getTemplates()`
  - `getTemplate(templateId)`
  - `updateTemplate(templateId, data)`
  - `deleteTemplate(templateId)`
- [ ] **7.4** Build Templates list page
  - Display all firm templates
  - Filter by active/inactive
  - Search by name
  - "Create New Template" button (attorneys only)
- [ ] **7.5** Build TemplateForm component
  - Name and description fields
  - Four section editors (Facts, Liability, Damages, Demand)
  - For each section: title, prompt instructions, default content
  - Variable manager (add variables with name, label, type, required)
  - Save/Cancel buttons
- [ ] **7.6** Build SectionEditor component
  - Text inputs for section title and prompt
  - Textarea for default content
  - Help text explaining AI prompt format
- [ ] **7.7** Build VariableManager component
  - List current variables
  - Add new variable (name, label, type, required)
  - Delete variable
  - Show syntax example: `{{variable_name}}`
- [ ] **7.8** Build TemplatePreview component
  - Render template structure with placeholders
  - Show how variables will be replaced
- [ ] **7.9** Add template selection in draft generation flow
  - Dropdown to select template before generating draft

**Testing:** ✅
- [ ] **Unit Test:** Template validation (required fields, section structure)
- [ ] **Unit Test:** Variable syntax validation (alphanumeric + underscores only)
- [ ] **Integration Test:** Create template, verify saved to Firestore with correct structure
- [ ] **Integration Test:** Attorney can create/edit templates, paralegal can only read
- [ ] **Integration Test:** Delete template and verify removed from list

---

### **PR #8: AI Draft Generation (OpenAI)** 🤖

**Description:** Implement AI-powered draft generation from source files and templates using OpenAI API.

**Files Created/Modified:**
- `aws-lambda/drafts/src/index.ts` - Draft Lambda entry point
- `aws-lambda/drafts/src/generate.ts` - Generation logic
- `aws-lambda/drafts/src/prompts.ts` - Prompt templates
- `aws-lambda/drafts/src/openai.ts` - OpenAI API wrapper
- `firebase/functions/src/index.ts` - Add draft proxy endpoints
- `frontend/src/services/draft.service.ts` - Draft service
- `frontend/src/components/drafts/GenerateDraftModal.tsx` - Generation UI
- `frontend/src/components/drafts/VariableInputForm.tsx` - Template variable inputs
- `frontend/src/components/drafts/GenerationProgress.tsx` - Progress indicator

#### Subtasks:
- [ ] **8.1** Set up OpenAI API credentials in AWS Secrets Manager
  - Store API key securely
- [ ] **8.2** Create OpenAI wrapper (`openai.ts`)
  - `generateSection(prompt, context, temperature, maxTokens)`
  - Error handling and retry logic
- [ ] **8.3** Create prompt templates (`prompts.ts`)
  - Base prompt structure
  - Section-specific prompts (Facts, Liability, Damages, Demand)
  - Variable substitution logic
- [ ] **8.4** Create draft generation handler (`generate.ts`)
  - `POST /v1/drafts:generate`
  - Fetch template from Firestore
  - Retrieve source files and extracted text (from OCR)
  - Build context from source materials
  - Generate each section sequentially (Facts → Liability → Damages → Demand)
  - Apply template variables
  - Save draft to Firestore `/drafts/{draftId}`
  - Post-process: format headings, validate output
- [ ] **8.5** Create Firebase Function proxy
  - `POST /api/v1/drafts:generate`
  - Forward to Lambda
- [ ] **8.6** Build draft service (`draft.service.ts`)
  - `generateDraft(matterId, templateId, fileIds, variables)`
  - `getDrafts(matterId)`
  - `getDraft(draftId)`
  - `deleteDraft(draftId)`
- [ ] **8.7** Build GenerateDraftModal component
  - Template selector dropdown
  - Source file checklist (select which files to use)
  - Template variable inputs (dynamic form based on template)
  - "Generate Draft" button
  - Estimated time notice (45 seconds)
- [ ] **8.8** Build GenerationProgress component
  - Show which section is currently being generated
  - Progress bar (25% per section)
  - Estimated time remaining
- [ ] **8.9** Handle draft completion
  - Navigate to DraftEditor page when done
  - Show success toast
- [ ] **8.10** Add error handling
  - OpenAI rate limits: retry with backoff
  - Token limits exceeded: truncate context
  - Display user-friendly error messages

**Testing:** ✅
- [ ] **Unit Test:** Prompt template generation with variable substitution
- [ ] **Unit Test:** Mock OpenAI API response and verify parsing
- [ ] **Unit Test:** Test retry logic for transient API failures
- [ ] **Integration Test:** End-to-end draft generation with real OpenAI API (use test key/low cost model)
  - Upload sample files, select template, generate draft
  - Verify all 4 sections are generated
  - Verify variables are substituted correctly
- [ ] **Integration Test:** Test with missing/invalid template and verify error handling

---

### **PR #9: Draft Refinement (Section Regeneration)** ✨

**Description:** Allow users to regenerate specific sections with custom instructions.

**Files Created/Modified:**
- `aws-lambda/drafts/src/refine.ts` - Section refinement logic
- `firebase/functions/src/index.ts` - Add refine endpoint proxy
- `frontend/src/services/draft.service.ts` - Add `refineSection()` method
- `frontend/src/components/drafts/RefineSectionModal.tsx` - Refinement UI
- `frontend/src/pages/DraftEditor.tsx` - Add refine button per section

#### Subtasks:
- [ ] **9.1** Create refinement handler (`refine.ts`)
  - `POST /v1/drafts:refineSection`
  - Parameters: `draftId`, `section`, `instruction`, `keepExistingContent`
  - Fetch existing draft and section content
  - Build refined prompt with user instruction
  - Call OpenAI API with existing content + instruction
  - Update only the specified section in Firestore
  - Track refinement in change history
- [ ] **9.2** Create Firebase Function proxy
  - `POST /api/v1/drafts:refineSection`
- [ ] **9.3** Add `refineSection()` to draft service
  - `refineSection(draftId, section, instruction, keepExistingContent)`
- [ ] **9.4** Build RefineSectionModal component
  - Dropdown to select section (Facts, Liability, Damages, Demand)
  - Textarea for refinement instruction
  - Checkbox: "Keep existing content and expand" vs "Rewrite completely"
  - Submit button
- [ ] **9.5** Add "Refine Section" buttons in DraftEditor
  - Small icon button on each section header
  - Opens RefineSectionModal with section pre-selected
- [ ] **9.6** Show refinement progress
  - Loading spinner on section being refined
  - Real-time update when refinement completes
- [ ] **9.7** Track refinements in collaboration history
  - Record who refined, when, which section, and instruction used

**Testing:** ✅
- [ ] **Unit Test:** Verify refined prompt includes original content + user instruction
- [ ] **Integration Test:** Generate draft, then refine "Damages" section with instruction "Add more detail on pain and suffering"
  - Verify section is updated
  - Verify other sections remain unchanged
- [ ] **Integration Test:** Test "keep existing content" vs "rewrite completely" modes

---

### **PR #10: Rich Text Editor Integration (TipTap)** ✍️

**Description:** Integrate TipTap editor for draft editing with formatting tools.

**Files Created/Modified:**
- `frontend/src/components/editor/TipTapEditor.tsx` - Main editor component
- `frontend/src/components/editor/EditorToolbar.tsx` - Formatting toolbar
- `frontend/src/components/editor/EditorMenuBar.tsx` - Menu bar with save/export
- `frontend/src/pages/DraftEditor.tsx` - Draft editor page
- `frontend/src/hooks/useEditor.ts` - Editor state hook
- `frontend/package.json` - Add TipTap dependencies

#### Subtasks:
- [ ] **10.1** Install TipTap dependencies
  - `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*`
- [ ] **10.2** Build TipTapEditor component
  - Initialize TipTap editor with extensions (Bold, Italic, Heading, BulletList, OrderedList, etc.)
  - Load draft content from Firestore
  - Handle content changes
  - Auto-save to Firestore (debounced, every 2 seconds)
- [ ] **10.3** Build EditorToolbar component
  - Bold, Italic, Underline buttons
  - Heading levels (H1, H2, H3)
  - Bullet list, Numbered list
  - Undo, Redo
- [ ] **10.4** Build DraftEditor page
  - Header: matter name, client name, save status
  - TipTapEditor in center
  - Section separators (Facts, Liability, Damages, Demand)
  - Right sidebar placeholder for comments (to be implemented in PR #11)
- [ ] **10.5** Create `useEditor` hook
  - Manage editor state (loading, saving, error)
  - Handle auto-save logic
  - Provide save/load methods
- [ ] **10.6** Add routing
  - `/matters/:matterId/drafts/:draftId` - Draft editor page
- [ ] **10.7** Style editor
  - Professional legal document appearance
  - Proper spacing, fonts, line height
  - Print-friendly styles

**Testing:** ✅
- [ ] **Unit Test:** Verify auto-save debounce logic (doesn't save on every keystroke)
- [ ] **Integration Test:** Load draft, make edits, verify changes saved to Firestore
- [ ] **Integration Test:** Test undo/redo functionality

---

### **PR #11: Real-Time Collaboration & Change Tracking** 👥

**Description:** Implement basic real-time collaboration with change tracking and presence indicators.

**Files Created/Modified:**
- `frontend/src/contexts/CollaborationContext.tsx` - Collaboration state
- `frontend/src/hooks/useCollaboration.ts` - Collaboration hook
- `frontend/src/components/collaboration/PresenceIndicator.tsx` - Active editors display
- `frontend/src/components/collaboration/ChangeHistory.tsx` - Change history panel
- `frontend/src/components/collaboration/ChangeItem.tsx` - Single change item
- `frontend/src/pages/DraftEditor.tsx` - Integrate collaboration UI
- `firebase/functions/src/collaboration/presence.ts` - Presence tracking

#### Subtasks:
- [ ] **11.1** Set up Firestore listeners for collaboration
  - Listen to `/drafts/{draftId}/collaboration` document
  - Real-time updates on content changes
- [ ] **11.2** Implement presence tracking
  - When user opens draft, add to `activeEditors` array
  - Update `lastActiveAt` timestamp every 10 seconds
  - Remove from `activeEditors` on disconnect or 30s inactivity
- [ ] **11.3** Create CollaborationContext
  - Manage active editors list
  - Track changes array
  - Sync with Firestore real-time
- [ ] **11.4** Build PresenceIndicator component
  - Display avatars/names of active editors
  - Show count: "3 people editing"
- [ ] **11.5** Implement change tracking
  - On editor content change, record:
    - `userId`, `userName`, `timestamp`, `type` (insert/delete/format)
    - `position`, `content`, `section`
  - Append to `changes` array in Firestore
  - Limit to last 100 changes (performance)
- [ ] **11.6** Build ChangeHistory component
  - Right sidebar panel
  - List recent changes in reverse chronological order
  - Show user name, timestamp, change description
  - Highlight changed text on hover
- [ ] **11.7** Integrate into DraftEditor page
  - PresenceIndicator in header
  - ChangeHistory in right sidebar
- [ ] **11.8** Handle basic conflict resolution
  - Use Firestore's last-write-wins for now
  - Display toast if user's edit conflicts with another user's recent change

**Testing:** ✅
- [ ] **Unit Test:** Presence tracking logic (add, update, remove)
- [ ] **Integration Test:** Open same draft in two browser sessions, make edits in one, verify other session sees changes within <200ms
- [ ] **Integration Test:** Verify change history captures edits correctly (user, timestamp, content)
- [ ] **Integration Test:** User disconnects, verify they're removed from active editors after 30s

---

### **PR #12: Comments System** 💬

**Description:** Implement inline comments and threaded replies.

**Files Created/Modified:**
- `frontend/src/components/collaboration/CommentThread.tsx` - Comment thread UI
- `frontend/src/components/collaboration/CommentItem.tsx` - Single comment
- `frontend/src/components/collaboration/AddCommentButton.tsx` - Add comment trigger
- `frontend/src/components/collaboration/CommentsSidebar.tsx` - All comments panel
- `frontend/src/services/comment.service.ts` - Comment CRUD
- `frontend/src/hooks/useComments.ts` - Comments hook
- `frontend/src/pages/DraftEditor.tsx` - Integrate comments UI

#### Subtasks:
- [ ] **12.1** Design comment data structure in Firestore
  - Store in `/drafts/{draftId}/collaboration` under `comments` array
  - Fields: `commentId`, `userId`, `userName`, `timestamp`, `position`, `content`, `resolved`, `replies[]`
- [ ] **12.2** Create comment service (`comment.service.ts`)
  - `addComment(draftId, position, content)`
  - `replyToComment(draftId, commentId, content)`
  - `resolveComment(draftId, commentId)`
  - `deleteComment(draftId, commentId)`
- [ ] **12.3** Build AddCommentButton component
  - Icon button in editor toolbar
  - On click: capture selected text position, open comment input
- [ ] **12.4** Build CommentThread component
  - Display comment with user name, timestamp, content
  - Show replies nested
  - Reply input box
  - "Resolve" button
  - Highlight associated text in editor
- [ ] **12.5** Build CommentsSidebar component
  - List all comments for draft
  - Filter: All / Unresolved / Resolved
  - Click comment to scroll to position in editor
- [ ] **12.6** Add text highlighting for comments
  - Use TipTap marks or custom CSS to highlight commented text
  - Different colors for unresolved (yellow) vs resolved (green)
- [ ] **12.7** Integrate into DraftEditor page
  - CommentsSidebar in right sidebar (below or tabbed with ChangeHistory)
  - AddCommentButton in toolbar
- [ ] **12.8** Real-time comment updates
  - Firestore listener updates comment list live
  - Show notification toast when new comment added

**Testing:** ✅
- [ ] **Unit Test:** Comment validation (required fields, max length)
- [ ] **Integration Test:** Add comment to draft, verify saved to Firestore
- [ ] **Integration Test:** Reply to comment, verify reply appended
- [ ] **Integration Test:** Resolve comment, verify status updated and UI reflects change
- [ ] **Integration Test:** Multiple users commenting simultaneously, verify no conflicts

---

### **PR #13: DOCX Export** 📄

**Description:** Generate and download DOCX files from drafts.

**Files Created/Modified:**
- `aws-lambda/exports/src/index.ts` - Export Lambda entry point
- `aws-lambda/exports/src/docx-generator.ts` - DOCX generation logic
- `firebase/functions/src/index.ts` - Add export proxy endpoint
- `frontend/src/services/export.service.ts` - Export service
- `frontend/src/components/drafts/ExportButton.tsx` - Export UI
- `frontend/src/components/drafts/ExportModal.tsx` - Export options modal
- `aws-lambda/exports/package.json` - Add `docx` library

#### Subtasks:
- [ ] **13.1** Install `docx` npm package in Lambda
  - `npm install docx` (for generating DOCX files)
- [ ] **13.2** Create DOCX generation logic (`docx-generator.ts`)
  - Fetch draft from Firestore
  - Parse sections (Facts, Liability, Damages, Demand)
  - Create DOCX document with:
    - Headings for each section
    - Paragraph text with formatting (bold, italic, lists)
    - Proper spacing and numbering
  - Return DOCX buffer
- [ ] **13.3** Create export handler (`index.ts`)
  - `POST /v1/exports:docx`
  - Generate DOCX from draft
  - Upload DOCX to Firebase Storage (`exports/{exportId}.docx`)
  - Generate signed download URL (10-minute expiry)
  - Create export record in Firestore `/exports/{exportId}`
  - Set `purgeAt` to `generatedAt + 7 days`
  - Return `{ exportId, downloadUrl, urlExpiresAt, fileSize }`
- [ ] **13.4** Create Firebase Function proxy
  - `POST /api/v1/exports:docx`
- [ ] **13.5** Build export service (`export.service.ts`)
  - `exportDraft(draftId, filename)`
  - `getExports(matterId)` - List exports for a matter
- [ ] **13.6** Build ExportButton component
  - "Export to Word" button in DraftEditor header
  - Shows loading spinner during generation
  - Downloads file automatically when ready
- [ ] **13.7** Build ExportModal (optional enhancement)
  - Filename input
  - Format options (for future: PDF, if scope changes)
  - "Export" button
- [ ] **13.8** Handle export completion
  - Show success toast with download link
  - Add export to matter's export history

**Testing:** ✅
- [ ] **Unit Test:** DOCX generation with mock draft data, verify structure
- [ ] **Unit Test:** Verify `purgeAt` calculation (+7 days)
- [ ] **Integration Test:** Generate export from real draft, download DOCX, open in Microsoft Word
  - Verify all sections present
  - Verify formatting preserved (headings, lists, bold/italic)
  - Verify variables substituted
- [ ] **Integration Test:** Test signed URL expiry (wait 11 minutes, verify URL returns 403)

---

### **PR #14: Data Retention & Purge Job** 🗑️

**Description:** Implement 7-day retention policy with automated purge job.

**Files Created/Modified:**
- `firebase/functions/src/scheduled/retention.ts` - Retention purge job
- `firebase/functions/src/index.ts` - Schedule retention job
- `frontend/src/components/common/RetentionWarning.tsx` - Retention notice UI
- `aws-lambda/retention/src/index.ts` - Purge handler (optional, if using Lambda)

#### Subtasks:
- [ ] **14.1** Create retention purge Cloud Function
  - Scheduled to run daily at midnight (Firebase Scheduler)
  - Query files where `purgeAt < now` and `isPurged = false`
  - Query exports where `purgeAt < now` and `isPurged = false`
  - Delete files from Firebase Storage
  - Update Firestore documents: set `isPurged = true`
  - Log summary: files purged, bytes freed, execution time
- [ ] **14.2** Schedule function in Firebase
  - Use `schedule('every day 00:00')` in Firebase Functions
  - Or use Cloud Scheduler with HTTP target
- [ ] **14.3** Add manual purge endpoint (optional for testing)
  - `POST /api/v1/retention:purge`
  - Parameters: `dryRun` (boolean), `olderThanDays` (number)
  - Returns summary without deleting if `dryRun = true`
- [ ] **14.4** Build RetentionWarning component
  - Banner on file upload page: "Files are automatically deleted after 7 days. Export important documents to save permanently."
  - Icon and prominent styling
- [ ] **14.5** Add retention info to FileCard
  - Show "Expires on [date]" for each file
  - Countdown: "6 days remaining"
- [ ] **14.6** Add retention info to export list
  - Similar expiry date display
- [ ] **14.7** Send reminder notification (optional)
  - Email users when files are about to be purged (day before)
  - Requires email integration (future enhancement)

**Testing:** ✅
- [ ] **Unit Test:** Query logic for files/exports older than 7 days
- [ ] **Unit Test:** Verify purge job correctly calculates `purgeAt`
- [ ] **Integration Test:** Create file with `purgeAt` in the past, run purge job, verify file deleted from Storage and Firestore updated
- [ ] **Integration Test:** Create file with `purgeAt` in the future, run purge job, verify file NOT deleted
- [ ] **Integration Test:** Test `dryRun` mode, verify summary returned without actual deletion

---

### **PR #15: Error Handling & Edge Cases** ⚠️

**Description:** Comprehensive error handling, loading states, empty states, and edge case handling.

**Files Created/Modified:**
- `frontend/src/components/common/ErrorBoundary.tsx` - React error boundary
- `frontend/src/components/common/LoadingSpinner.tsx` - Loading component
- `frontend/src/components/common/EmptyState.tsx` - Empty state component
- `frontend/src/components/common/ErrorMessage.tsx` - Error message component
- `frontend/src/components/common/Toast.tsx` - Toast notification system
- `frontend/src/utils/errorHandler.ts` - Centralized error handling
- `firebase/functions/src/middleware/errorHandler.ts` - Backend error middleware
- `frontend/src/services/api.ts` - Add error interceptors

#### Subtasks:
- [ ] **15.1** Create ErrorBoundary component
  - Catch React errors and display fallback UI
  - Log errors to console (or monitoring service)
- [ ] **15.2** Build LoadingSpinner component
  - Reusable spinner for async operations
  - Full-page overlay option
- [ ] **15.3** Build EmptyState component
  - Friendly illustrations and messages
  - Call-to-action buttons
  - Use for empty matter lists, file lists, draft lists
- [ ] **15.4** Build ErrorMessage component
  - Display API errors with actionable messages
  - Retry button where applicable
  - Contact support link for critical errors
- [ ] **15.5** Build Toast notification system
  - Success, error, warning, info toasts
  - Auto-dismiss after 5 seconds
  - Queue multiple toasts
- [ ] **15.6** Centralize error handling
  - Create `errorHandler.ts` utility
  - Map Firebase/API error codes to user-friendly messages
  - Handle common errors: network, auth, permission denied, not found
- [ ] **15.7** Add error middleware to Firebase Functions
  - Catch unhandled errors
  - Return consistent error response format
  - Log errors with context
- [ ] **15.8** Add API error interceptors
  - Axios/fetch interceptor to catch HTTP errors
  - Refresh Firebase ID token on 401
  - Retry on 5xx errors (with backoff)
- [ ] **15.9** Handle edge cases
  - No internet connection: show offline banner
  - File upload interrupted: allow resume (or clear partial upload)
  - Draft generation timeout: partial save, allow resume
  - Multiple users editing same section: show conflict warning
  - OCR fails on all files: allow draft generation with manual text input
- [ ] **15.10** Add loading states to all async operations
  - File upload progress
  - Draft generation progress
  - Export generation progress
  - Form submission loading

**Testing:** ✅
- [ ] **Unit Test:** Error handler maps error codes correctly
- [ ] **Unit Test:** Toast queue handles multiple toasts
- [ ] **Integration Test:** Simulate network error, verify offline banner appears and retry works
- [ ] **Integration Test:** Simulate 401 error, verify token refresh is attempted
- [ ] **Integration Test:** Upload very large file (>10MB), verify error message displayed

---

### **PR #16: UI/UX Polish & Accessibility** 🎨

**Description:** Polish UI, improve UX flows, add accessibility features, and responsive design.

**Files Created/Modified:**
- `frontend/src/styles/globals.css` - Global styles and theme
- `frontend/src/components/common/Button.tsx` - Reusable button component
- `frontend/src/components/common/Modal.tsx` - Accessible modal component
- `frontend/src/components/common/Dropdown.tsx` - Accessible dropdown
- `frontend/src/components/layout/Navigation.tsx` - Main navigation
- `frontend/src/components/layout/Sidebar.tsx` - Sidebar navigation
- `frontend/src/components/layout/Header.tsx` - Page header
- `frontend/src/utils/accessibility.ts` - Accessibility utilities

#### Subtasks:
- [ ] **16.1** Design system setup
  - Define color palette (primary, secondary, neutral, success, error, warning)
  - Typography scale (headings, body, small text)
  - Spacing scale (4px, 8px, 16px, 24px, 32px, etc.)
  - Border radius, shadows, transitions
- [ ] **16.2** Build reusable Button component
  - Variants: primary, secondary, outline, ghost, danger
  - Sizes: small, medium, large
  - States: default, hover, active, disabled, loading
  - Accessible: keyboard focus, ARIA labels
- [ ] **16.3** Build accessible Modal component
  - Focus trap (tab cycles within modal)
  - Close on Esc key
  - Focus returns to trigger element on close
  - ARIA roles: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] **16.4** Build accessible Dropdown component
  - Keyboard navigation (arrow keys, Enter, Esc)
  - ARIA roles: `role="menu"`, `aria-haspopup`, `aria-expanded`
  - Focus management
- [ ] **16.5** Build Navigation component
  - Top nav bar with logo, matter selector, user menu
  - Highlight active page
  - Mobile responsive (hamburger menu)
- [ ] **16.6** Build Sidebar component
  - Left sidebar with Dashboard, Matters, Templates, Settings, Help
  - Collapsible on mobile
  - Sticky positioning
- [ ] **16.7** Ensure keyboard navigation
  - All interactive elements focusable via Tab
  - Skip to main content link
  - Logical tab order
- [ ] **16.8** Add ARIA labels and roles
  - Buttons: `aria-label` for icon-only buttons
  - Forms: `aria-describedby` for error messages
  - Landmarks: `<nav>`, `<main>`, `<aside>`, `<footer>`
- [ ] **16.9** Check color contrast
  - Minimum 4.5:1 for normal text
  - Minimum 3:1 for large text (18pt+)
  - Use contrast checker tool
- [ ] **16.10** Responsive design
  - Mobile (320px+): stacked layout, full-width components
  - Tablet (768px+): two-column layout
  - Desktop (1024px+): three-column layout with sidebars
  - Test on various screen sizes
- [ ] **16.11** Add focus indicators
  - Visible focus ring on all interactive elements
  - Custom focus styles (outline or shadow)
- [ ] **16.12** Add screen reader support
  - Alt text for images
  - ARIA live regions for dynamic content (toasts, loading states)
  - Descriptive link text (not "click here")

**Testing:** ✅
- [ ] **Manual Test:** Keyboard navigation through entire app (no mouse)
- [ ] **Manual Test:** Screen reader test (NVDA/JAWS on Windows, VoiceOver on Mac)
- [ ] **Automated Test:** Lighthouse accessibility audit (score 90+)
- [ ] **Automated Test:** axe-core accessibility linting
- [ ] **Manual Test:** Color contrast checker on all text elements

---

### **PR #17: Integration Testing & End-to-End Tests** 🧪

**Description:** Comprehensive integration tests and end-to-end test suite.

**Files Created/Modified:**
- `frontend/tests/integration/auth.test.ts` - Auth flow tests
- `frontend/tests/integration/matter.test.ts` - Matter CRUD tests
- `frontend/tests/integration/file-upload.test.ts` - File upload tests
- `frontend/tests/integration/ocr.test.ts` - OCR tests
- `frontend/tests/integration/template.test.ts` - Template CRUD tests
- `frontend/tests/integration/draft-generation.test.ts` - Draft generation tests
- `frontend/tests/integration/collaboration.test.ts` - Collaboration tests
- `frontend/tests/integration/export.test.ts` - Export tests
- `frontend/tests/e2e/user-journey.spec.ts` - End-to-end user journeys
- `frontend/tests/setup.ts` - Test setup and utilities
- `package.json` - Add testing dependencies (Jest, Playwright, etc.)

#### Subtasks:
- [ ] **17.1** Set up testing framework
  - Install Jest for unit/integration tests
  - Install Playwright or Cypress for E2E tests
  - Configure test environment
- [ ] **17.2** Write auth integration tests
  - Signup flow
  - Login flow (email/password and Google)
  - Logout flow
  - Protected route redirection
- [ ] **17.3** Write matter CRUD integration tests
  - Create matter
  - List matters
  - Update matter
  - Delete matter
- [ ] **17.4** Write file upload integration tests
  - Upload valid file
  - Upload invalid file (type, size)
  - OCR processing
  - File list display
- [ ] **17.5** Write template CRUD integration tests
  - Create template with sections and variables
  - List templates
  - Update template
  - Delete template
  - Role-based access (attorney vs paralegal)
- [ ] **17.6** Write draft generation integration tests
  - Generate draft from files and template
  - Verify all sections generated
  - Verify variables substituted
  - Handle generation errors
- [ ] **17.7** Write collaboration integration tests
  - Multiple users editing same draft
  - Change tracking
  - Comments and replies
  - Presence indicators
- [ ] **17.8** Write export integration tests
  - Generate DOCX export
  - Verify download link
  - Verify file content (open and parse DOCX)
- [ ] **17.9** Write E2E user journey tests
  - **Attorney Journey:** Login → Create matter → Upload files → Generate draft → Edit draft → Export DOCX
  - **Paralegal Journey:** Login → Create template → Upload files to matter → Collaborate on draft → Add comments
  - **Multi-user Journey:** Two users collaborate on same draft in real-time
- [ ] **17.10** Set up CI pipeline to run tests
  - Run unit tests on every PR
  - Run integration tests on every PR
  - Run E2E tests on merge to main

**Testing:** ✅ (This PR is all about testing)
- All integration tests written and passing
- E2E tests cover critical user journeys
- CI pipeline runs tests automatically

---

### **PR #18: Documentation & Deployment** 📚

**Description:** Complete documentation, deployment scripts, and production readiness.

**Files Created/Modified:**
- `README.md` - Project overview, setup, and contributing guide
- `docs/setup.md` - Detailed development setup instructions
- `docs/deployment.md` - Deployment guide for Firebase and AWS
- `docs/api.md` - API endpoint documentation
- `docs/architecture.md` - System architecture documentation
- `docs/testing.md` - Testing guide
- `docs/troubleshooting.md` - Common issues and solutions
- `.github/workflows/deploy-production.yml` - Production deployment workflow
- `firebase/functions/.env.production` - Production environment variables
- `aws-lambda/deploy.sh` - AWS Lambda deployment script

#### Subtasks:
- [ ] **18.1** Write comprehensive README
  - Project description and features
  - Tech stack
  - Quick start guide
  - Folder structure
  - Contributing guidelines
- [ ] **18.2** Write setup documentation
  - Prerequisites (Node.js, Firebase CLI, AWS CLI)
  - Step-by-step development setup
  - Environment variable configuration
  - Running locally
  - Troubleshooting common setup issues
- [ ] **18.3** Write deployment documentation
  - Firebase deployment (Hosting, Functions, Firestore rules)
  - AWS Lambda deployment (SAM or Serverless Framework)
  - Environment-specific deployments (dev, staging, prod)
  - Secrets management (AWS Secrets Manager)
- [ ] **18.4** Write API documentation
  - List all endpoints with descriptions
  - Request/response examples
  - Error codes and messages
  - Authentication requirements
- [ ] **18.5** Write architecture documentation
  - System architecture diagram
  - Data model diagram
  - Request flow diagrams
  - Tech stack rationale
- [ ] **18.6** Write testing documentation
  - How to run tests
  - How to write new tests
  - Test coverage requirements
- [ ] **18.7** Create deployment scripts
  - `deploy-frontend.sh` - Build and deploy React app to Firebase Hosting
  - `deploy-firebase-functions.sh` - Deploy Firebase Functions
  - `deploy-lambda.sh` - Deploy AWS Lambda functions (SAM deploy)
- [ ] **18.8** Set up production environment
  - Firebase production project
  - AWS production account/resources
  - Configure secrets in AWS Secrets Manager
  - Set up monitoring and alerts
- [ ] **18.9** Create production deployment workflow
  - GitHub Action triggers on tag push (e.g., `v1.0.0`)
  - Runs tests
  - Deploys to production
  - Sends deployment notification
- [ ] **18.10** Final production checklist
  - All secrets configured
  - Firestore security rules deployed
  - Storage security rules deployed
  - CORS configured correctly
  - Error monitoring enabled (Sentry or similar)
  - Performance monitoring enabled (Firebase Performance)
  - Backup strategy documented

**Testing:** ✅
- [ ] **Manual Test:** Deploy to staging environment and verify all features work
- [ ] **Manual Test:** Run production deployment workflow and verify successful deployment
- [ ] **Manual Test:** Load production app and complete full user journey

---

## Testing Summary

### PR-Level Testing Requirements

| PR # | Unit Tests | Integration Tests | E2E Tests | Notes |
|------|-----------|------------------|-----------|-------|
| 1 | ✅ | ✅ | - | Build validation, hello world deploy |
| 2 | ✅ | ✅ | - | Auth flows, validators, role-based access |
| 3 | ✅ | ✅ | - | Firestore security rules testing |
| 4 | ✅ | ✅ | - | Matter CRUD operations |
| 5 | ✅ | ✅ | - | File upload, validation, storage |
| 6 | ✅ | ✅ | - | OCR extraction, confidence thresholds |
| 7 | ✅ | ✅ | - | Template CRUD, variable validation |
| 8 | ✅ | ✅ | - | Draft generation, OpenAI integration |
| 9 | ✅ | ✅ | - | Section refinement |
| 10 | ✅ | ✅ | - | Editor auto-save, undo/redo |
| 11 | ✅ | ✅ | - | Real-time sync, presence tracking |
| 12 | ✅ | ✅ | - | Comments CRUD, threading |
| 13 | ✅ | ✅ | - | DOCX generation, download |
| 14 | ✅ | ✅ | - | Retention purge job |
| 15 | ✅ | ✅ | - | Error handling, edge cases |
| 16 | - | - | - | Manual accessibility testing |
| 17 | - | - | ✅ | Full E2E test suite |
| 18 | - | ✅ | - | Deployment verification |

### Critical Integration Test Scenarios

1. **Full Draft Generation Flow:** Upload → OCR → Select Template → Generate → Edit → Export
2. **Multi-User Collaboration:** Two users edit same draft, verify real-time sync
3. **Error Recovery:** Network failures, API rate limits, token expiry
4. **Data Retention:** File purge after 7 days
5. **Security:** Role-based access, unauthenticated requests blocked

---

## Estimated Timeline

Assuming 1-2 developers working full-time:

| PR Range | Estimated Duration | Milestone |
|----------|-------------------|-----------|
| PR #1-3 | 1 week | Infrastructure & Auth |
| PR #4-5 | 1 week | Matter & File Management |
| PR #6-7 | 1 week | OCR & Templates |
| PR #8-9 | 1.5 weeks | AI Draft Generation |
| PR #10-12 | 1.5 weeks | Editor & Collaboration |
| PR #13-14 | 1 week | Export & Retention |
| PR #15-16 | 1 week | Polish & Accessibility |
| PR #17-18 | 1 week | Testing & Deployment |

**Total:** ~8-9 weeks (matches PRD estimate of 6 weeks with 3 sprints at higher velocity)

---

## Development Workflow

### For Each PR:

1. **Create Feature Branch:** `git checkout -b feature/pr-XX-description`
2. **Implement Subtasks:** Check off tasks as you complete them
3. **Write Tests:** Add unit tests and integration tests as specified
4. **Run Tests Locally:** Ensure all tests pass
5. **Commit Changes:** `git commit -m "feat: PR#XX - Description"`
6. **Push to GitHub:** `git push origin feature/pr-XX-description`
7. **Create Pull Request:** Open PR with description of changes
8. **Review & Merge:** After review, merge to `main` or `develop`
9. **Deploy (if applicable):** Trigger deployment to dev/staging environment

### Git Commit Convention:

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `style:` - Formatting, missing semicolons, etc.
- `chore:` - Updating build tasks, package manager configs, etc.

Example: `feat: PR#8 - Add OpenAI draft generation with section-by-section prompting`

---

## Notes

- **Dependencies:** Some PRs depend on previous PRs being completed. Follow the order.
- **Testing:** Don't skip tests! They're critical for verifying code quality and catching regressions.
- **Code Review:** Even solo developers benefit from self-review. Pause before merging and review your own PR.
- **Documentation:** Update docs as you go, not at the end.
- **Incremental Deployment:** Deploy to dev/staging frequently to catch issues early.

---

**Good luck! 🚀 Track your progress by checking off tasks in this document.**

