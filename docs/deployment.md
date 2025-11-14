# Deployment Guide

This guide covers deployment of all components of the Stenographer application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Deploy](#quick-deploy)
- [Firebase Deployment](#firebase-deployment)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment Verification](#post-deployment-verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Firebase Account**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication, Firestore, Storage, Functions, and Hosting
   - Link a billing account (required for Storage access from Functions)

2. **API Keys**
   - OpenAI API key (for draft generation)

3. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

## Quick Deploy

### Using PowerShell Script (Windows)

```powershell
.\deploy.ps1
```

This script will:
1. Build the frontend (`npm run build`)
2. Copy build files to `firebase/public/`
3. Copy logo to `firebase/public/`
4. Deploy to Firebase Hosting

### Manual Deployment

See detailed steps below.

## Firebase Deployment

### 1. Initialize Firebase

```bash
cd firebase
firebase login
firebase use your-project-id
```

### 2. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Storage Rules

```bash
firebase deploy --only storage:rules
```

### 4. Deploy Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

**Note**: Ensure `OPENAI_API_KEY` is set as a Firebase secret:
```bash
firebase functions:secrets:set OPENAI_API_KEY
```

### 5. Deploy Hosting

#### Option A: Using Deployment Script (Recommended)

```powershell
# Windows PowerShell
.\deploy.ps1
```

#### Option B: Manual Steps

```bash
# Build frontend
cd frontend
npm run build

# Copy files to firebase/public
# Windows PowerShell:
Remove-Item -Recurse -Force ..\firebase\public\*
Copy-Item -Recurse -Force dist\* ..\firebase\public\
Copy-Item public\logo.png ..\firebase\public\

# Deploy
cd ../firebase
firebase deploy --only hosting
```

### 6. Create Firestore Indexes (if needed)

After deploying, create composite indexes in Firebase Console if you add new queries:
- Go to Firestore → Indexes
- Create indexes as needed

Or use:
```bash
firebase deploy --only firestore:indexes
```

## Environment Configuration

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important**: The Storage bucket name should be `your-project.firebasestorage.app` (not `.appspot.com`)

### Firebase Functions Environment

Set secrets in Firebase Console or via CLI:

```bash
# Via CLI
firebase functions:secrets:set OPENAI_API_KEY
# Enter your OpenAI API key when prompted
```

Or via Firebase Console:
- Go to Functions → Configuration → Secrets
- Add secret: `OPENAI_API_KEY`

## Post-Deployment Verification

### 1. Test Authentication

- Navigate to your deployed app
- Sign up a new user
- Sign in with email/password
- Sign in with Google OAuth (if enabled)

### 2. Test Core Features

- **Create a matter**: Dashboard → Create Matter
- **Upload a file**: Matter Detail → Files tab → Upload .txt file
- **Verify file processing**: Check that `ocrText` field is populated in Firestore
- **Generate a draft**: Matter Detail → Drafts tab → Generate Draft
- **Edit draft**: Click on draft → Edit in Draft Editor
- **Export to DOCX**: Draft Editor → Export DOCX button

### 3. Monitor Logs

```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only draftGenerate

# View hosting logs
firebase hosting:channel:list
```

### 4. Check Function Status

- Go to Firebase Console → Functions
- Verify all functions show as "Active"
- Check function execution count and errors

### 5. Verify File Processing

1. Upload a .txt file to a matter
2. Check Firestore: `matters/{matterId}/files/{fileId}`
3. Verify `ocrStatus` is `'done'`
4. Verify `ocrText` field contains the file content

## Production Checklist

- [ ] All environment variables configured
- [ ] Firebase billing account linked
- [ ] Security rules deployed and tested
- [ ] Functions deployed with correct region (`us-central1`)
- [ ] `OPENAI_API_KEY` secret configured
- [ ] Frontend build successful
- [ ] Logo file copied to `firebase/public/`
- [ ] Hosting deployed successfully
- [ ] Test user created and role assigned
- [ ] File upload and processing tested
- [ ] Draft generation tested
- [ ] DOCX export tested
- [ ] Error monitoring configured (optional)

## Troubleshooting

### Functions Not Deploying

- **Check Node.js version**: Should be 18+
  ```bash
  node --version
  ```
- **Verify dependencies**: Run `npm install` in `firebase/functions`
- **Check Firebase CLI**: Update with `npm install -g firebase-tools@latest`
- **Check TypeScript compilation**: Run `npm run build` in `firebase/functions`

### Frontend Build Fails

- **Check for TypeScript errors**: Run `npm run build` and fix errors
- **Verify environment variables**: Check `frontend/.env` file
- **Clear node_modules**: Delete `node_modules` and `package-lock.json`, then `npm install`

### File Processing Not Working

- **Check billing**: Ensure billing account is linked to Firebase project
- **Verify trigger**: Check that `onFileCreate` function is deployed
- **Check logs**: `firebase functions:log --only onFileCreate`
- **Verify Storage bucket**: Check that bucket name matches in `.env` file

### Draft Generation Fails

- **Check OpenAI API key**: Verify secret is set correctly
- **Check function logs**: `firebase functions:log --only draftGenerate`
- **Verify file content**: Ensure files have `ocrText` field populated
- **Check context length**: Very large files may exceed token limits

### CORS Issues

- Firebase Callable Functions handle CORS automatically
- If issues persist, check browser console for specific errors
- Verify Firebase project configuration

### Hosting Not Updating

- **Clear browser cache**: Use Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- **Check deployment**: Verify files were copied to `firebase/public/`
- **Check Firebase Console**: Verify hosting deployment succeeded
- **Wait for CDN propagation**: May take a few minutes

## Rollback Procedure

### Firebase Hosting

```bash
# List previous deployments
firebase hosting:channel:list

# View deployment history in Firebase Console
# Go to Hosting → Releases
```

### Firebase Functions

```bash
# List function versions
firebase functions:list

# Functions are automatically versioned
# Rollback via Firebase Console → Functions → Select function → Versions
```

## Deployment Best Practices

1. **Test locally first**: Always test changes locally before deploying
2. **Build verification**: Run `npm run build` before deploying
3. **Incremental deployment**: Deploy functions and hosting separately if needed
4. **Monitor logs**: Check function logs after deployment
5. **User testing**: Test critical flows after deployment
6. **Version control**: Commit all changes before deploying

## Continuous Deployment

For automated deployments, consider:

1. **GitHub Actions**: Set up CI/CD pipeline
2. **Firebase App Distribution**: For testing builds
3. **Staging environment**: Use separate Firebase project for staging

## Support

For deployment issues:
- Check Firebase Console for error messages
- Review function logs: `firebase functions:log`
- Check browser console for frontend errors
- Review this documentation for common issues
