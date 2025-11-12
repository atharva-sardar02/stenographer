# Deployment Guide

This guide covers deployment of all components of the Stenographer application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Firebase Deployment](#firebase-deployment)
- [AWS Lambda Deployment](#aws-lambda-deployment)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment Verification](#post-deployment-verification)

## Prerequisites

1. **Firebase Account**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication, Firestore, Storage, Functions, and Hosting

2. **AWS Account**
   - Create an AWS account
   - Set up IAM user with appropriate permissions
   - Create S3 bucket for Lambda deployment packages

3. **API Keys**
   - OpenAI API key
   - AWS Access Key ID and Secret Access Key

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

### 5. Deploy Hosting

```bash
# Build frontend first
cd ../frontend
npm run build

# Deploy
cd ../firebase
firebase deploy --only hosting
```

### 6. Create Firestore Indexes

After deploying, create composite indexes in Firebase Console:
- `files` collection: `purgeAt` + `isPurged`
- `exports` collection: `purgeAt` + `isPurged`

Or use:
```bash
firebase deploy --only firestore:indexes
```

## AWS Lambda Deployment

### 1. OCR Lambda

```bash
cd aws-lambda/ocr
npm install
npm run build

# Package for deployment
zip -r function.zip dist/ node_modules/ package.json

# Deploy using AWS CLI
aws lambda update-function-code \
  --function-name stenographer-ocr \
  --zip-file fileb://function.zip
```

### 2. Drafts Lambda

```bash
cd aws-lambda/drafts
npm install
npm run build
zip -r function.zip dist/ node_modules/ package.json

aws lambda update-function-code \
  --function-name stenographer-drafts \
  --zip-file fileb://function.zip
```

### 3. Exports Lambda

```bash
cd aws-lambda/exports
npm install
npm run build
zip -r function.zip dist/ node_modules/ package.json

aws lambda update-function-code \
  --function-name stenographer-exports \
  --zip-file fileb://function.zip
```

### 4. Configure Lambda Environment Variables

```bash
# OCR Lambda
aws lambda update-function-configuration \
  --function-name stenographer-ocr \
  --environment Variables="{AWS_REGION=us-east-1}"

# Drafts Lambda
aws lambda update-function-configuration \
  --function-name stenographer-drafts \
  --environment Variables="{OPENAI_API_KEY=your_key}"

# Exports Lambda
aws lambda update-function-configuration \
  --function-name stenographer-exports \
  --environment Variables="{FIREBASE_PROJECT_ID=your_project}"
```

### 5. Set Up API Gateway

1. Create REST API in API Gateway
2. Create resources for each Lambda function
3. Enable CORS
4. Deploy API to a stage
5. Update Firebase Function proxy URLs

## Environment Configuration

### Frontend Environment Variables

Create `frontend/.env.production`:

```env
VITE_FIREBASE_API_KEY=your_production_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=https://us-central1-your-project.cloudfunctions.net
```

### Firebase Functions Environment

Set secrets in Firebase:

```bash
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set AWS_ACCESS_KEY_ID
firebase functions:secrets:set AWS_SECRET_ACCESS_KEY
```

## Post-Deployment Verification

### 1. Test Authentication

- Sign up a new user
- Sign in with email/password
- Sign in with Google OAuth

### 2. Test Core Features

- Create a matter
- Upload a file
- Generate a draft
- Export to DOCX

### 3. Monitor Logs

```bash
# Firebase Functions logs
firebase functions:log

# AWS Lambda logs
aws logs tail /aws/lambda/stenographer-ocr --follow
```

### 4. Check Scheduled Jobs

Verify `retentionPurge` is scheduled:
- Check Firebase Console → Functions → Scheduled
- Should run daily at midnight (America/New_York)

## Production Checklist

- [ ] All environment variables configured
- [ ] Firestore indexes created
- [ ] Security rules deployed and tested
- [ ] Functions deployed with correct region
- [ ] Lambda functions have proper IAM roles
- [ ] API Gateway endpoints configured
- [ ] CORS enabled on all endpoints
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Analytics configured (if needed)
- [ ] Backup strategy in place
- [ ] Documentation updated with production URLs

## Troubleshooting

### Functions Not Deploying

- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Check Firebase CLI is up to date: `firebase --version`

### Lambda Timeout Errors

- Increase timeout in Lambda configuration
- Check CloudWatch logs for errors
- Verify API Gateway timeout settings

### CORS Issues

- Ensure CORS headers are set in API Gateway
- Check Firebase Function CORS configuration
- Verify frontend is using correct API base URL

## Rollback Procedure

### Firebase

```bash
# List previous deployments
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:channel:deploy previous-version
```

### AWS Lambda

```bash
# List versions
aws lambda list-versions-by-function --function-name stenographer-ocr

# Update alias to previous version
aws lambda update-alias \
  --function-name stenographer-ocr \
  --name PROD \
  --function-version previous-version
```
