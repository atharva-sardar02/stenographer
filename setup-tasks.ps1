# PowerShell script to add all 18 PRs as tasks in task-master
# Run this script to automatically set up all tasks from TASK_LIST.md

Write-Host "Adding all 18 PRs as tasks to task-master..." -ForegroundColor Green

# PR #1: Project Setup & Infrastructure
task-master add-task --prompt="PR #1: Project Setup & Infrastructure - Initialize project structure, configure build tools, set up Firebase and AWS infrastructure. Files: README.md, .gitignore, frontend/package.json, firebase/firebase.json, aws-lambda setup, GitHub Actions workflows" --priority=high

# PR #2: Authentication & User Management  
task-master add-task --prompt="PR #2: Authentication & User Management - Implement Firebase Authentication with Email/Password and Google OAuth, create user profiles in Firestore. Files: auth.service.ts, AuthContext.tsx, Login.tsx, Signup.tsx, Firebase Functions triggers" --priority=high --dependencies=1

# PR #3: Firestore Schema & Security Rules
task-master add-task --prompt="PR #3: Firestore Schema & Security Rules - Define Firestore data model, implement security rules for all collections. Files: firestore.rules, firestore.indexes.json, shared/types/*.ts, data-model.md" --priority=high --dependencies=1

# PR #4: Matter Management
task-master add-task --prompt="PR #4: Matter Management (Dashboard & CRUD) - Implement matter creation, listing, and detail views in the UI. Files: matter.service.ts, Dashboard.tsx, MatterDetail.tsx, MatterCard.tsx, CreateMatterModal.tsx" --priority=high --dependencies=2,3

# PR #5: File Upload & Storage
task-master add-task --prompt="PR #5: File Upload & Storage - Implement file upload to Firebase Storage with progress tracking and validation. Files: file.service.ts, FileUpload.tsx, FileList.tsx, storage.rules, AWS Lambda upload handlers" --priority=high --dependencies=3,4

# PR #6: OCR Processing
task-master add-task --prompt="PR #6: OCR Processing (AWS Textract) - Implement OCR for scanned PDFs using AWS Textract, update file status. Files: aws-lambda/ocr/src/index.ts, OcrStatusBadge.tsx, Textract integration" --priority=high --dependencies=5

# PR #7: Template Management
task-master add-task --prompt="PR #7: Template Management (CRUD) - Implement template creation, editing, listing, and preview. Files: template.service.ts, Templates.tsx, TemplateForm.tsx, SectionEditor.tsx, VariableManager.tsx, AWS Lambda template handlers" --priority=high --dependencies=3

# PR #8: AI Draft Generation
task-master add-task --prompt="PR #8: AI Draft Generation (OpenAI) - Implement AI-powered draft generation from source files and templates using OpenAI API. Files: aws-lambda/drafts/src/generate.ts, prompts.ts, openai.ts, GenerateDraftModal.tsx, GenerationProgress.tsx" --priority=high --dependencies=5,6,7

# PR #9: Draft Refinement
task-master add-task --prompt="PR #9: Draft Refinement (Section Regeneration) - Allow users to regenerate specific sections with custom instructions. Files: aws-lambda/drafts/src/refine.ts, RefineSectionModal.tsx" --priority=medium --dependencies=8

# PR #10: Rich Text Editor
task-master add-task --prompt="PR #10: Rich Text Editor Integration (TipTap) - Integrate TipTap editor for draft editing with formatting tools. Files: TipTapEditor.tsx, EditorToolbar.tsx, DraftEditor.tsx, useEditor.ts" --priority=high --dependencies=8

# PR #11: Real-Time Collaboration
task-master add-task --prompt="PR #11: Real-Time Collaboration & Change Tracking - Implement basic real-time collaboration with change tracking and presence indicators. Files: CollaborationContext.tsx, useCollaboration.ts, PresenceIndicator.tsx, ChangeHistory.tsx" --priority=high --dependencies=10

# PR #12: Comments System
task-master add-task --prompt="PR #12: Comments System - Implement inline comments and threaded replies. Files: CommentThread.tsx, CommentItem.tsx, CommentsSidebar.tsx, comment.service.ts" --priority=medium --dependencies=11

# PR #13: DOCX Export
task-master add-task --prompt="PR #13: DOCX Export - Generate and download DOCX files from drafts. Files: aws-lambda/exports/src/docx-generator.ts, export.service.ts, ExportButton.tsx, ExportModal.tsx" --priority=high --dependencies=10

# PR #14: Data Retention
task-master add-task --prompt="PR #14: Data Retention & Purge Job - Implement 7-day retention policy with automated purge job. Files: firebase/functions/src/scheduled/retention.ts, RetentionWarning.tsx" --priority=medium --dependencies=5,13

# PR #15: Error Handling
task-master add-task --prompt="PR #15: Error Handling & Edge Cases - Comprehensive error handling, loading states, empty states, and edge case handling. Files: ErrorBoundary.tsx, LoadingSpinner.tsx, EmptyState.tsx, errorHandler.ts" --priority=medium --dependencies=4

# PR #16: UI/UX Polish
task-master add-task --prompt="PR #16: UI/UX Polish & Accessibility - Polish UI, improve UX flows, add accessibility features, and responsive design. Files: Button.tsx, Modal.tsx, Navigation.tsx, accessibility utilities" --priority=medium --dependencies=2,4,10

# PR #17: Integration Testing
task-master add-task --prompt="PR #17: Integration Testing & End-to-End Tests - Comprehensive integration tests and end-to-end test suite. Files: tests/integration/*.test.ts, tests/e2e/user-journey.spec.ts, test setup" --priority=high --dependencies=8,11,13

# PR #18: Documentation & Deployment
task-master add-task --prompt="PR #18: Documentation & Deployment - Complete documentation, deployment scripts, and production readiness. Files: README.md, docs/*.md, deployment scripts, production checklist" --priority=high --dependencies=17

Write-Host "`n✅ All 18 PRs added as tasks!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. View tasks: task-master list" -ForegroundColor Cyan
Write-Host "2. Find next task: task-master next" -ForegroundColor Cyan
Write-Host "3. Set task status: task-master set-status --id=1 --status=in-progress" -ForegroundColor Cyan

