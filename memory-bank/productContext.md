# Product Context: Stenographer

## Problem Statement
Legal professionals spend significant time manually creating demand letters from source documents. The process involves:
- Reviewing multiple source documents (medical records, police reports, etc.)
- Extracting relevant facts
- Structuring information into legal format
- Writing persuasive content
- Ensuring consistency across similar cases

## Solution
Stenographer automates this workflow by:
1. **Document Processing**: Upload source files, extract text (OCR for scanned PDFs)
2. **Template-Based Generation**: Use pre-configured templates with customizable sections
3. **AI-Powered Content**: Generate structured content using OpenAI based on source documents and template prompts
4. **Collaborative Editing**: Multiple users can edit drafts in real-time
5. **Export**: Generate final DOCX documents ready for use

## User Personas

### Attorney
- **Primary Role**: Create and manage templates, review and approve drafts
- **Permissions**: Full access (create/edit templates, generate drafts, export)
- **Workflow**: Create templates → Review generated drafts → Edit/Approve → Export

### Paralegal
- **Primary Role**: Generate drafts, edit content, manage matters
- **Permissions**: Limited access (read templates, generate drafts, edit, export)
- **Workflow**: Upload files → Select template → Generate draft → Edit → Export

## Key Features

### 1. Matter Management
- Create matters with client information
- Organize files by matter
- Track matter status (active, draft, completed, archived)

### 2. File Upload & Processing
- Support for PDF, DOCX, TXT files
- Automatic OCR for scanned PDFs
- File validation (size, type, page count)
- Progress tracking

### 3. Template System
- Four customizable sections: Facts, Liability, Damages, Demand
- Template variables for dynamic content
- AI prompt instructions per section
- Default content templates
- Active/inactive status

### 4. AI Draft Generation
- Generate content from source files using templates
- Variable substitution
- Section-by-section generation
- Confidence scoring

### 5. Real-time Collaboration
- Multiple users can edit drafts simultaneously
- Change tracking
- User presence indicators

### 6. Export
- DOCX format only
- Professional formatting
- Variable replacement

## Success Metrics
- Time saved per demand letter
- Template reuse rate
- User adoption
- Draft quality (reduction in manual edits)

