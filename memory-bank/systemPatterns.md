# System Patterns: Architecture & Design Decisions

## Architecture Overview
Monorepo structure with:
- `frontend/`: React application
- `firebase/`: Firebase Functions and configuration
- `aws-lambda/`: AWS Lambda functions (OCR, drafts, exports, retention)
- `shared/`: Shared TypeScript types

## Frontend Architecture

### Service Layer Pattern
All data operations go through service classes:
- `AuthService`: Authentication operations
- `MatterService`: Matter CRUD operations
- `FileService`: File upload/download/delete
- `TemplateService`: Template CRUD operations
- `DraftService`: (To be implemented) Draft operations

### Context Pattern
- `AuthContext`: Global authentication state and user profile
- Uses React Context API for state management

### Component Structure
```
components/
  auth/          # Authentication components
  matters/       # Matter-related components
  files/         # File management components
  templates/     # Template management components
  drafts/        # Draft editing components (to be implemented)
```

### Routing
- Public routes: `/login`, `/signup`
- Protected routes: `/dashboard`, `/matters/:id`, `/templates/*`
- `ProtectedRoute` component wraps protected routes

## Backend Architecture

### Firebase Functions
- `onUserCreate`: Firestore trigger for user document creation
- `onFileCreate`: Firestore trigger for auto-OCR on PDF uploads
- `updateUserProfile`: Callable function for profile updates
- `ocrExtract`: HTTP function proxy for OCR requests (to AWS Lambda)
- `api`: General API proxy (placeholder)

### AWS Lambda Functions
- `ocr/extract`: OCR processing using AWS Textract
- `drafts/generate`: (To be implemented) AI draft generation
- `exports/generate`: (To be implemented) DOCX export
- `retention/purge`: (To be implemented) 7-day auto-purge

## Data Model Patterns

### Firestore Collections
- `users/{userId}`: User profiles
- `matters/{matterId}`: Matters
  - `files/{fileId}`: Files subcollection
- `templates/{templateId}`: Templates
- `drafts/{draftId}`: Drafts (to be implemented)
  - `collaboration`: Collaboration subcollection
- `exports/{exportId}`: Exports (to be implemented)
- `jobs/{jobId}`: Background jobs (to be implemented)

### Security Rules Pattern
- Authentication required for all operations
- Role-based access: Attorneys can write templates, paralegals can read
- User ownership: Users can only modify their own data
- Backend-only writes: Jobs and exports only writable by backend

## State Management

### Local State
- Component-level state with `useState`
- Form state managed locally

### Global State
- `AuthContext` for authentication
- Firestore real-time listeners for data synchronization

### Future Considerations
- Zustand for complex state management (if needed)
- TanStack Query for server state caching (if needed)

## Error Handling

### Frontend
- Try-catch blocks in async functions
- Error state in components
- User-friendly error messages

### Backend
- Try-catch in Firebase Functions
- Error logging to console
- Status updates in Firestore for async operations

## File Upload Pattern
1. Validate file (type, size)
2. Upload to Firebase Storage with progress tracking
3. Create Firestore document with metadata
4. Trigger OCR if PDF (via Firestore trigger)
5. Update status in real-time

## Template Pattern
1. Templates stored in Firestore
2. Four sections: Facts, Liability, Damages, Demand
3. Variables use `{{variable_name}}` syntax
4. AI prompts per section guide generation
5. Default content provides structure

## Type Safety
- Shared types in `shared/types/`
- TypeScript strict mode enabled
- Interfaces for all data models

