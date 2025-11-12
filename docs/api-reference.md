# API Reference

Complete API reference for Stenographer backend services.

## Table of Contents

- [Firebase Functions](#firebase-functions)
- [AWS Lambda Functions](#aws-lambda-functions)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

## Firebase Functions

Base URL: `https://us-central1-{project-id}.cloudfunctions.net`

### Authentication

All endpoints require Firebase ID token in the `Authorization` header:
```
Authorization: Bearer <firebase-id-token>
```

### API Proxy

**Endpoint**: `POST /api/v1/*`

Proxies requests to AWS Lambda functions. The path after `/api/v1/` determines which Lambda function is called.

**Example**:
```typescript
POST /api/v1/ocr:extract
POST /api/v1/drafts:generate
POST /api/v1/drafts:refine
POST /api/v1/exports:generate
```

### Export Generation

**Endpoint**: `POST /api/v1/exports:generate`

Generate a DOCX export from a draft.

**Request Body**:
```json
{
  "draftId": "string",
  "matterId": "string",
  "content": {
    "facts": "string",
    "liability": "string",
    "damages": "string",
    "demand": "string"
  },
  "options": {
    "matterTitle": "string",
    "clientName": "string",
    "includeHeader": true,
    "includeFooter": true
  }
}
```

**Response**:
```json
{
  "exportId": "string",
  "downloadUrl": "string",
  "storagePath": "string"
}
```

### Manual Purge

**Endpoint**: `POST /manualPurge` (Callable Function)

Manually trigger retention purge job.

**Request**:
```json
{
  "dryRun": false,
  "olderThanDays": 7
}
```

**Response**:
```json
{
  "success": true,
  "filesPurged": 10,
  "exportsPurged": 5,
  "bytesFreed": 10485760,
  "errors": []
}
```

## AWS Lambda Functions

### OCR Processing

**Function**: `stenographer-ocr`

**Input**:
```json
{
  "matterId": "string",
  "fileId": "string",
  "storagePath": "string",
  "bucket": "string"
}
```

**Output**:
```json
{
  "fileId": "string",
  "ocrText": "string",
  "confidence": 0.95,
  "pages": 5,
  "status": "done"
}
```

### Draft Generation

**Function**: `stenographer-drafts`

**Input**:
```json
{
  "matterId": "string",
  "templateId": "string",
  "fileIds": ["string"],
  "variableValues": {
    "variableName": "value"
  }
}
```

**Output**:
```json
{
  "draftId": "string",
  "sections": {
    "facts": {
      "content": "string",
      "generatedAt": "timestamp"
    },
    "liability": { ... },
    "damages": { ... },
    "demand": { ... }
  }
}
```

### Section Refinement

**Function**: `stenographer-drafts` (refine endpoint)

**Input**:
```json
{
  "draftId": "string",
  "section": "facts" | "liability" | "damages" | "demand",
  "instruction": "string",
  "keepExistingContent": true
}
```

**Output**:
```json
{
  "section": "facts",
  "content": "string",
  "generatedAt": "timestamp"
}
```

### DOCX Export

**Function**: `stenographer-exports`

**Input**:
```json
{
  "draftId": "string",
  "matterId": "string",
  "content": {
    "facts": "string",
    "liability": "string",
    "damages": "string",
    "demand": "string"
  },
  "options": {
    "matterTitle": "string",
    "clientName": "string"
  }
}
```

**Output**:
```json
{
  "exportId": "string",
  "storagePath": "string",
  "downloadUrl": "string"
}
```

## Authentication

### Sign Up

```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth';

const userCredential = await createUserWithEmailAndPassword(
  auth,
  email,
  password
);
```

### Sign In

```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';

const userCredential = await signInWithEmailAndPassword(
  auth,
  email,
  password
);
```

### Get ID Token

```typescript
const token = await auth.currentUser?.getIdToken();
```

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `UNAUTHENTICATED`: User not authenticated
- `PERMISSION_DENIED`: User lacks required permissions
- `NOT_FOUND`: Resource not found
- `INVALID_ARGUMENT`: Invalid request parameters
- `INTERNAL`: Internal server error
- `TIMEOUT`: Request timeout

### Error Handling Example

```typescript
try {
  const response = await fetch('/api/v1/drafts:generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
} catch (error) {
  console.error('API Error:', error);
  throw error;
}
```

## Rate Limiting

- Firebase Functions: 100 requests/second per function
- AWS Lambda: Based on account limits
- Firestore: 10,000 writes/second per database

## Best Practices

1. **Always include authentication token** in API requests
2. **Handle errors gracefully** with user-friendly messages
3. **Implement retry logic** for transient failures
4. **Cache responses** when appropriate
5. **Validate input** before sending requests
6. **Use TypeScript** for type safety

