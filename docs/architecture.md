# Architecture Overview

High-level architecture and design decisions for the Stenographer application.

## System Architecture

```
┌─────────────────┐
│   React Frontend │
│   (Vite + TS)   │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼─────────────────┐
│   Firebase Functions     │
│   (API Proxy Layer)      │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────────┐
│Firebase│ │ AWS Lambda  │
│Services│ │  Functions  │
└────────┘ └─────────────┘
```

## Component Architecture

### Frontend

**Layered Architecture**:
- **Presentation Layer**: React components and pages
- **Business Logic Layer**: Services and hooks
- **Data Layer**: Firebase SDK and API clients

**State Management**:
- **Global State**: Zustand stores
- **Server State**: TanStack Query
- **Local State**: React useState/useReducer
- **Context**: AuthContext, CollaborationContext

### Backend

**Serverless Architecture**:
- **Firebase Functions**: API gateway and orchestration
- **AWS Lambda**: Heavy processing (OCR, AI, DOCX)
- **Firestore**: Primary database
- **Firebase Storage**: File storage

## Data Flow

### Draft Generation Flow

```
User → Frontend → Firebase Function → AWS Lambda (Drafts)
                                              │
                                              ├─→ OpenAI API
                                              └─→ Firestore (Save)
```

### File Upload Flow

```
User → Frontend → Firebase Storage
                      │
                      └─→ Firestore (Metadata)
                      │
                      └─→ Firebase Function → AWS Lambda (OCR)
                                                │
                                                └─→ AWS Textract
```

### Real-Time Collaboration

```
User 1 → Frontend → Firestore (Collaboration Document)
                          │
User 2 ← Frontend ←───────┘
```

## Security Architecture

### Authentication Flow

1. User authenticates with Firebase Auth
2. Frontend receives ID token
3. Token included in all API requests
4. Firebase Functions validate token
5. AWS Lambda receives validated user context

### Authorization

- **Firestore Rules**: Enforce read/write permissions
- **Storage Rules**: Control file access
- **Function Logic**: Role-based access control

## Scalability Considerations

### Frontend

- Code splitting for reduced initial load
- Lazy loading of routes
- Image optimization
- Caching strategies

### Backend

- **Firebase Functions**: Auto-scaling
- **AWS Lambda**: Auto-scaling with concurrency limits
- **Firestore**: Horizontal scaling
- **Firebase Storage**: CDN-backed

## Performance Optimization

1. **Caching**: TanStack Query for API responses
2. **Debouncing**: Auto-save in editor
3. **Pagination**: Large lists paginated
4. **Lazy Loading**: Components loaded on demand
5. **Batch Operations**: Multiple writes batched

## Monitoring & Logging

- **Firebase Console**: Function logs and metrics
- **CloudWatch**: AWS Lambda logs
- **Error Tracking**: (Sentry recommended)
- **Analytics**: Firebase Analytics (optional)

## Disaster Recovery

- **Backups**: Firestore automated backups
- **Version Control**: All code in Git
- **Environment Separation**: Dev/Staging/Prod
- **Rollback Procedures**: Documented in deployment guide

