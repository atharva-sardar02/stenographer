# Next Steps: Production Deployment Checklist

Now that all 18 PRs are complete, here's what you need to do to get the application running in production.

## 🎯 Immediate Next Steps

### 1. Set Up Firebase Project

- [ ] **Create Firebase Project**
  - Go to [Firebase Console](https://console.firebase.google.com)
  - Create a new project (e.g., `stenographer-prod`)
  - Enable billing (required for Functions and Storage)

- [ ] **Enable Firebase Services**
  - ✅ Authentication (Email/Password + Google OAuth)
  - ✅ Firestore Database (Native mode)
  - ✅ Cloud Storage
  - ✅ Cloud Functions
  - ✅ Hosting

- [ ] **Configure Authentication**
  - Enable Email/Password authentication
  - Enable Google OAuth provider
  - Add authorized domains for OAuth

- [ ] **Get Firebase Configuration**
  - Go to Project Settings → General → Your apps
  - Create a web app if not already created
  - Copy the Firebase config values

### 2. Set Up AWS Account

- [ ] **Create AWS Account**
  - Sign up at [AWS Console](https://aws.amazon.com)
  - Set up billing alerts

- [ ] **Create IAM User**
  - Create IAM user with programmatic access
  - Attach policies: `AWSLambda_FullAccess`, `AmazonTextractFullAccess`, `AmazonS3FullAccess`
  - Save Access Key ID and Secret Access Key

- [ ] **Set Up AWS Services**
  - Create S3 bucket for Lambda deployment packages
  - Create Lambda functions (or use deployment scripts)
  - Set up API Gateway (if needed)
  - Configure AWS Secrets Manager for API keys

### 3. Configure Environment Variables

- [ ] **Frontend Environment** (`frontend/.env`)
  ```env
  VITE_FIREBASE_API_KEY=your_api_key
  VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=your-project-id
  VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  VITE_FIREBASE_APP_ID=your_app_id
  VITE_API_BASE_URL=https://us-central1-your-project.cloudfunctions.net
  ```

- [ ] **Firebase Functions Secrets**
  ```bash
  cd firebase
  firebase functions:secrets:set OPENAI_API_KEY
  firebase functions:secrets:set AWS_ACCESS_KEY_ID
  firebase functions:secrets:set AWS_SECRET_ACCESS_KEY
  ```

- [ ] **AWS Lambda Environment Variables**
  - Set in Lambda console or via deployment script
  - `OPENAI_API_KEY`: Your OpenAI API key
  - `FIREBASE_PROJECT_ID`: Your Firebase project ID

### 4. Deploy to Production

- [ ] **Deploy Firestore Rules**
  ```bash
  cd firebase
  firebase deploy --only firestore:rules
  ```

- [ ] **Deploy Storage Rules**
  ```bash
  firebase deploy --only storage:rules
  ```

- [ ] **Create Firestore Indexes**
  - Go to Firestore Console → Indexes
  - Create composite indexes for:
    - `files` collection: `purgeAt` + `isPurged`
    - `exports` collection: `purgeAt` + `isPurged`
  - Or deploy: `firebase deploy --only firestore:indexes`

- [ ] **Deploy Firebase Functions**
  ```bash
  cd firebase/functions
  npm install
  npm run build
  cd ..
  firebase deploy --only functions
  ```

- [ ] **Deploy Frontend**
  ```bash
  cd frontend
  npm install
  npm run build
  cd ../firebase
  firebase deploy --only hosting
  ```

- [ ] **Deploy AWS Lambda Functions**
  - Follow instructions in `docs/deployment.md`
  - Deploy OCR Lambda
  - Deploy Drafts Lambda
  - Deploy Exports Lambda

### 5. Post-Deployment Verification

- [ ] **Test Authentication**
  - Sign up a new user
  - Sign in with email/password
  - Sign in with Google OAuth

- [ ] **Test Core Features**
  - Create a matter
  - Upload a file (PDF)
  - Verify OCR processing
  - Create a template
  - Generate a draft
  - Edit draft with rich text editor
  - Export to DOCX
  - Download exported file

- [ ] **Test Collaboration Features**
  - Open draft in two browser windows
  - Verify presence indicators
  - Test comments system
  - Verify change history

- [ ] **Verify Scheduled Jobs**
  - Check Firebase Console → Functions
  - Verify `retentionPurge` is scheduled
  - Test manual purge endpoint (if needed)

### 6. Set Up Monitoring & Alerts

- [ ] **Firebase Monitoring**
  - Set up Firebase Performance Monitoring
  - Configure error alerts
  - Monitor function execution times

- [ ] **AWS CloudWatch**
  - Set up CloudWatch alarms for Lambda errors
  - Monitor Lambda execution metrics
  - Set up billing alerts

- [ ] **Error Tracking** (Optional but Recommended)
  - Set up Sentry or similar error tracking
  - Configure error notifications

### 7. Security Hardening

- [ ] **Review Security Rules**
  - Verify Firestore rules are restrictive
  - Verify Storage rules are restrictive
  - Test unauthorized access attempts

- [ ] **API Security**
  - Verify all endpoints require authentication
  - Test with invalid/missing tokens
  - Verify CORS is configured correctly

- [ ] **Secrets Management**
  - Ensure no secrets in code
  - Use Firebase Secrets Manager
  - Use AWS Secrets Manager for Lambda

### 8. Documentation Updates

- [ ] **Update README**
  - Add production URLs
  - Update environment variable examples
  - Add production deployment notes

- [ ] **Create User Guide**
  - Document how to use the application
  - Create video tutorials (optional)
  - Add FAQ section

## 🚀 Quick Start Commands

### First-Time Setup

```bash
# 1. Install dependencies
cd frontend && npm install
cd ../firebase/functions && npm install

# 2. Initialize Firebase (if not done)
cd ../..
cd firebase
firebase login
firebase use --add  # Select your project

# 3. Set up environment variables
# Edit frontend/.env with your Firebase config

# 4. Deploy rules first
firebase deploy --only firestore:rules,storage:rules

# 5. Deploy functions
cd functions
npm run build
cd ..
firebase deploy --only functions

# 6. Build and deploy frontend
cd ../frontend
npm run build
cd ../firebase
firebase deploy --only hosting
```

## 📋 Testing Checklist

Before going live, test these scenarios:

- [ ] User can sign up and sign in
- [ ] User can create a matter
- [ ] User can upload a PDF file
- [ ] OCR processes the PDF successfully
- [ ] User can create a template
- [ ] User can generate a draft from template and files
- [ ] User can edit draft with rich text editor
- [ ] User can add comments to draft
- [ ] User can export draft to DOCX
- [ ] User can download exported file
- [ ] Multiple users can collaborate on same draft
- [ ] Files are automatically purged after 7 days
- [ ] Error handling works correctly
- [ ] Loading states display properly
- [ ] Empty states display when appropriate

## 🔧 Troubleshooting

### Common Issues

**Issue**: Functions not deploying
- **Solution**: Check Node.js version (should be 18+), verify all dependencies installed

**Issue**: CORS errors
- **Solution**: Verify CORS headers in API Gateway and Firebase Functions

**Issue**: Authentication not working
- **Solution**: Check Firebase Auth configuration, verify authorized domains

**Issue**: Lambda timeout errors
- **Solution**: Increase Lambda timeout, check CloudWatch logs

See `docs/deployment.md` for more troubleshooting tips.

## 📞 Support

If you encounter issues:
1. Check the logs (Firebase Console, CloudWatch)
2. Review the documentation
3. Check GitHub issues
4. Contact the development team

---

**You're ready to deploy!** Follow the steps above to get your application running in production. 🎉

