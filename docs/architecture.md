# Architecture Overview

High-level architecture and design decisions for the Stenographer application.

## System Architecture

```
┌─────────────────┐
│   React Frontend │
│   (Vite + TS)   │
└────────┬────────┘
         │
         │ HTTP/REST + WebSocket
         │
┌────────▼─────────────────┐
│   Firebase Functions     │
│   (Serverless API)       │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────────┐
│Firebase│ │  OpenAI API │
│Services│ │  (GPT-4)   │
└────────┘ └─────────────┘
```

## Component Architecture

### Frontend

**Layered Architecture**:
- **Presentation Layer**: React components and pages
- **Business Logic Layer**: Services and hooks
- **Data Layer**: Firebase SDK (Firestore, Storage, Auth)

**State Management**:
- **Global State**: React Context (AuthContext, CollaborationContext)
- **Server State**: Firestore real-time listeners
- **Local State**: React useState/useReducer
- **Form State**: Component-level state management

**Key Components**:
- `Dashboard.tsx`: Main landing page with matter list
- `MatterDetail.tsx`: Matter overview with tabs
- `DraftEditor.tsx`: Rich text editor for drafts
- `TemplateForm.tsx`: Template creation/editing
- `ActivityTimeline.tsx`: Activity tracking component

### Backend

**Serverless Architecture**:
- **Firebase Functions**: API endpoints and triggers
- **Firestore**: Primary database (NoSQL)
- **Firebase Storage**: File storage
- **Firebase Auth**: User authentication

**Key Functions**:
- `draftGenerate`: AI-powered draft generation
- `onFileCreate`: Automatic text extraction from files
- `exportGenerate`: DOCX export generation

## Data Flow

### Draft Generation Flow

```
User → Frontend → Firebase Function (draftGenerate)
                      │
                      ├─→ Fetch source files from Firestore
                      ├─→ Extract text content
                      ├─→ Build context from files
                      ├─→ OpenAI API (Generate sections)
                      └─→ Save draft to Firestore
```

### File Upload Flow

```
User → Frontend → Firebase Storage (Upload file)
                      │
                      └─→ Firestore (Create file document)
                      │
                      └─→ onFileCreate Trigger
                            │
                            ├─→ Download from Storage
                            ├─→ Extract text (.txt files)
                            └─→ Update Firestore (ocrText field)
```

### Real-Time Collaboration

```
User 1 → Frontend → Firestore (Update draft)
                          │
User 2 ← Frontend ←───────┘ (Real-time listener)
```

### Activity Tracking

```
Firestore Events → ActivityTimeline Component
    │
    ├─→ Matter creation/updates
    ├─→ File uploads
    └─→ Draft generation/updates
```

## Security Architecture

### Authentication Flow

1. User authenticates with Firebase Auth (Email/Password or Google OAuth)
2. Frontend receives ID token
3. Token automatically included in Firestore/Storage requests
4. Firestore Rules validate user permissions
5. Functions receive authenticated user context

### Authorization

- **Firestore Rules**: Enforce read/write permissions based on user role
- **Storage Rules**: Control file access by matter ownership
- **Function Logic**: Role-based access control (Attorney vs Paralegal)

### Role-Based Access Control

- **Attorney**: Full access to all matters, can manage participants
- **Paralegal**: Access to assigned matters, can create drafts and files

## Scalability Considerations

### Frontend

- Code splitting via Vite
- Lazy loading of routes
- Image optimization (logo.png)
- Efficient Firestore queries with indexes

### Backend

- **Firebase Functions**: Auto-scaling based on demand
- **Firestore**: Horizontal scaling, automatic indexing
- **Firebase Storage**: CDN-backed global distribution
- **OpenAI API**: Rate limiting and retry logic

## Performance Optimization

1. **Caching**: Browser caching for static assets
2. **Debouncing**: Auto-save in editor (debounced)
3. **Lazy Loading**: Components loaded on demand
4. **Batch Operations**: Firestore batch writes where possible
5. **Efficient Queries**: Firestore indexes for common queries

## File Processing

### Current Implementation

- **Text Files (.txt)**: Automatic extraction via `onFileCreate` trigger
- **Process**: Download from Storage → Extract UTF-8 text → Save to Firestore
- **Status Tracking**: `ocrStatus` field ('pending', 'done', 'failed')

### Future Enhancements

- PDF text extraction
- Image OCR (if needed)
- Document parsing and structuring

## Monitoring & Logging

- **Firebase Console**: Function logs and metrics
- **Firestore Console**: Database usage and performance
- **Browser Console**: Frontend debugging
- **Function Logs**: Structured logging with `logger.info/error`

## Deployment Architecture

### Frontend Deployment

1. Build with Vite (`npm run build`)
2. Copy `dist/` to `firebase/public/`
3. Deploy via Firebase Hosting
4. CDN distribution automatically handled

### Functions Deployment

1. TypeScript compilation (`npm run build`)
2. Deploy via Firebase CLI (`firebase deploy --only functions`)
3. Automatic versioning and rollback support

## Data Retention

- **Files**: 7-day retention policy (configurable)
- **Exports**: 7-day retention policy (configurable)
- **Drafts**: Retained indefinitely (user-controlled)
- **Matters**: Retained indefinitely (user-controlled)

## Error Handling

- **Frontend**: Error boundaries and user-friendly error messages
- **Functions**: Try-catch blocks with detailed error logging
- **Firestore**: Transaction rollback on errors
- **Storage**: Retry logic for upload failures

## Disaster Recovery

- **Backups**: Firestore automated backups (if enabled)
- **Version Control**: All code in Git
- **Environment Separation**: Dev/Staging/Prod (via Firebase projects)
- **Rollback Procedures**: Firebase function versioning
