# CORS Fix for Export Function

## Problem
The frontend was getting a CORS error when trying to call the export generation function:
```
Access to fetch at 'https://us-central1-stenographer-dev.cloudfunctions.net/v1/exports:generate' 
from origin 'https://stenographer-dev.web.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Causes

1. **Incorrect Function URL**: The frontend was calling `/v1/exports:generate`, but Firebase Functions are accessed by function name, not by path. The correct URL should be `/exportGenerate`.

2. **CORS Handling**: While CORS headers were set manually, the `cors` package provides more reliable handling of preflight OPTIONS requests.

## Solution

### 1. Updated Firebase Function (`firebase/functions/src/index.ts`)
- ✅ Installed and imported `cors` package
- ✅ Created a CORS handler with proper configuration
- ✅ Updated `exportGenerate` function to use the `cors` middleware
- ✅ Function now properly handles OPTIONS preflight requests

### 2. Updated Frontend Service (`frontend/src/services/export.service.ts`)
- ✅ Changed function URL from `/v1/exports:generate` to `/exportGenerate`
- ✅ Added fallback URL for direct Firebase Function access
- ✅ Function now calls: `https://us-central1-stenographer-dev.cloudfunctions.net/exportGenerate`

## Changes Made

### Firebase Functions
```typescript
// Added cors import
import cors from 'cors';

// Created CORS handler
const corsHandler = cors({
  origin: true, // Allow all origins
  credentials: true,
});

// Updated exportGenerate to use cors middleware
export const exportGenerate = functions
  .region('us-central1')
  .https
  .onRequest((request, response) => {
    corsHandler(request, response, async () => {
      // Function logic here
    });
  });
```

### Frontend Export Service
```typescript
// Changed from:
`${import.meta.env.VITE_API_BASE_URL}/v1/exports:generate`

// To:
const functionUrl = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/exportGenerate`
  : 'https://us-central1-stenographer-dev.cloudfunctions.net/exportGenerate';
```

## Testing

After deploying the updated function, the CORS error should be resolved. The function will:
1. ✅ Properly handle OPTIONS preflight requests
2. ✅ Set correct CORS headers
3. ✅ Accept requests from the frontend domain

## Deployment

To apply these fixes:
1. Deploy the updated Firebase Function:
   ```bash
   cd firebase/functions
   npm run build
   firebase deploy --only functions:exportGenerate
   ```

2. Rebuild and redeploy the frontend (if needed):
   ```bash
   cd frontend
   npm run build
   # Frontend will use the new function URL
   ```

## Notes

- The `cors` package is already installed in `firebase/functions/package.json`
- The function URL pattern is now consistent with Firebase Functions naming conventions
- Other functions (ocrExtract, draftGenerate, etc.) should be updated similarly if they encounter CORS issues

