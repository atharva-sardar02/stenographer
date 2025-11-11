# Next Steps Guide - After PR #1

This guide provides exact step-by-step instructions for setting up your development environment after PR #1 is complete.

---

## Step 1: Set Up Firebase Project (15-20 minutes)

### 1.1 Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click "Add project" or "Create a project"
   - **Project name**: `stenographer-dev` (or your preferred name)
   - Click "Continue"
   - **Google Analytics**: Choose "Enable" or "Disable" (your choice)
   - Click "Create project"
   - Wait for project creation (30-60 seconds)
   - Click "Continue"

### 1.2 Enable Authentication

1. **Navigate to Authentication**
   - In Firebase Console, click "Authentication" in left sidebar
   - Click "Get started"

2. **Enable Sign-in Methods**
   - Click "Sign-in method" tab
   - **Email/Password**:
     - Click "Email/Password"
     - Toggle "Enable" to ON
     - Click "Save"
   - **Google**:
     - Click "Google"
     - Toggle "Enable" to ON
     - Enter project support email
     - Click "Save"

### 1.3 Create Firestore Database

1. **Navigate to Firestore**
   - Click "Firestore Database" in left sidebar
   - Click "Create database"

2. **Choose Mode**
   - Select **"Start in production mode"** (we'll add rules later)
   - Click "Next"

3. **Choose Location**
   - Select **"us-central1"** (matches PRD requirement)
   - Click "Enable"
   - Wait for database creation (30-60 seconds)

### 1.4 Enable Firebase Storage

1. **Navigate to Storage**
   - Click "Storage" in left sidebar
   - Click "Get started"

2. **Set Up Storage**
   - Choose "Start in production mode"
   - Click "Next"
   - Choose location: **"us-central1"**
   - Click "Done"

### 1.5 Get Firebase Configuration

1. **Get Web App Config**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Click "Project settings"
   - Scroll down to "Your apps" section
   - Click the `</>` (Web) icon
   - **App nickname**: `stenographer-web`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
   - **Copy the `firebaseConfig` object** - you'll need this!

   It looks like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

2. **Save These Values** - You'll use them in Step 2

---

## Step 2: Configure Environment Variables (5 minutes)

### 2.1 Create .env File

1. **Navigate to frontend directory**
   ```powershell
   cd frontend
   ```

2. **Copy example file**
   ```powershell
   Copy-Item .env.example .env
   ```

3. **Open .env file** in your editor

### 2.2 Fill in Firebase Values

Replace the placeholder values with your actual Firebase config:

```env
# Firebase Configuration (from Step 1.5)
VITE_FIREBASE_API_KEY=AIza...your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# API Endpoints (for local development)
VITE_API_BASE_URL=http://localhost:5001/your-project-id/us-central1/api

# Environment
VITE_ENV=development
```

**Important**: Replace `your-project-id` with your actual Firebase project ID!

### 2.3 Verify .env File

- Make sure `.env` is in `.gitignore` (it should be)
- Never commit `.env` to Git!

---

## Step 3: Link Firebase CLI to Your Project (5 minutes)

### 3.1 Install Firebase CLI (if not already installed)

```powershell
npm install -g firebase-tools
```

### 3.2 Login to Firebase

```powershell
firebase login
```

- This will open a browser window
- Sign in with your Google account
- Grant permissions
- Return to terminal

### 3.3 Initialize Firebase in Your Project

```powershell
# Make sure you're in the project root
cd D:\gauntlet-ai\stenographer

# Initialize Firebase (if not already done)
firebase init
```

**When prompted:**
1. **Select features**: 
   - Use arrow keys and spacebar to select:
     - ✅ Firestore
     - ✅ Functions
     - ✅ Hosting
     - ✅ Storage
   - Press Enter

2. **Select project**: 
   - Choose "Use an existing project"
   - Select your `stenographer-dev` project
   - Press Enter

3. **Firestore rules file**: 
   - Press Enter (accept default: `firestore.rules`)

4. **Firestore indexes file**: 
   - Press Enter (accept default: `firestore.indexes.json`)

5. **Functions language**: 
   - Select "TypeScript"
   - Press Enter

6. **ESLint**: 
   - Type "No" (we already have config)
   - Press Enter

7. **Install dependencies**: 
   - Type "Yes"
   - Press Enter

8. **Public directory**: 
   - Type `frontend/dist`
   - Press Enter

9. **Single-page app**: 
   - Type "Yes"
   - Press Enter

10. **Overwrite index.html**: 
    - Type "No" (we already have one)
    - Press Enter

### 3.4 Verify Firebase Connection

```powershell
firebase projects:list
```

You should see your project listed.

---

## Step 4: Deploy Firestore Rules (2 minutes)

### 4.1 Deploy Security Rules

```powershell
# From project root
firebase deploy --only firestore:rules,firestore:indexes
```

**Expected output:**
```
✔  firestore: rules file firestore.rules deployed successfully
✔  firestore: indexes file firestore.indexes.json deployed successfully
```

### 4.2 Deploy Storage Rules

```powershell
firebase deploy --only storage
```

**Expected output:**
```
✔  storage: rules file storage.rules deployed successfully
```

---

## Step 5: Test the Setup (5 minutes)

### 5.1 Start Frontend Dev Server

```powershell
cd frontend
npm run dev
```

**Expected:**
- Browser should open at `http://localhost:3000`
- You should see "Stenographer - Demand Letter Generator" page
- No errors in browser console

### 5.2 Start Firebase Emulators (Optional, for local testing)

```powershell
# From project root
firebase emulators:start
```

**Expected:**
- Emulators start on various ports
- UI available at `http://localhost:4000`

**Note**: You can stop emulators with `Ctrl+C` when done testing.

---

## Step 6: Set Up AWS Resources (30-45 minutes)

> **Note**: AWS setup is needed for later PRs (OCR, AI generation, exports). You can do this now or wait until PR #5-8.

### 6.1 Create AWS Account (if needed)

1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the signup process
4. Complete account verification

### 6.2 Install AWS CLI

1. **Download AWS CLI**
   - Visit: https://aws.amazon.com/cli/
   - Download Windows installer
   - Run installer
   - Follow installation wizard

2. **Verify Installation**
   ```powershell
   aws --version
   ```

### 6.3 Configure AWS CLI

```powershell
aws configure
```

**When prompted, enter:**
- **AWS Access Key ID**: [Get from AWS Console > IAM > Users > Your User > Security Credentials]
- **AWS Secret Access Key**: [Get from same location]
- **Default region**: `us-east-1`
- **Default output format**: `json`

### 6.4 Create IAM Role for Lambda

1. **Go to AWS Console**
   - Visit: https://console.aws.amazon.com/
   - Navigate to "IAM" service

2. **Create Role**
   - Click "Roles" → "Create role"
   - **Trusted entity type**: "AWS service"
   - **Use case**: "Lambda"
   - Click "Next"

3. **Add Permissions**
   - Search and select:
     - `AWSLambdaBasicExecutionRole`
     - `AmazonTextractFullAccess` (for OCR)
     - `SecretsManagerReadWrite` (for API keys)
   - Click "Next"

4. **Name Role**
   - **Role name**: `stenographer-lambda-role`
   - Click "Create role"

### 6.5 Set Up AWS Secrets Manager

1. **Navigate to Secrets Manager**
   - In AWS Console, search for "Secrets Manager"
   - Click "Secrets Manager"

2. **Create Secret for OpenAI**
   - Click "Store a new secret"
   - **Secret type**: "Other type of secret"
   - **Key/value**: 
     - Key: `OPENAI_API_KEY`
     - Value: [Your OpenAI API key - get from https://platform.openai.com/api-keys]
   - Click "Next"
   - **Secret name**: `stenographer/openai-api-key`
   - Click "Next"
   - Click "Next" (skip rotation for now)
   - Click "Store"

### 6.6 Create API Gateway (Basic Setup)

1. **Navigate to API Gateway**
   - In AWS Console, search for "API Gateway"
   - Click "API Gateway"

2. **Create REST API**
   - Click "Create API"
   - Choose "REST API" → "Build"
   - **API name**: `stenographer-api`
   - **Endpoint Type**: "Regional"
   - Click "Create API"

3. **Note the API ID** - You'll need this later

**Note**: Full API Gateway setup with endpoints will be done in PR #5-8. This is just the basic structure.

---

## Step 7: Verify Everything Works

### 7.1 Test Frontend

```powershell
cd frontend
npm run dev
```

✅ **Success**: Browser opens, no console errors

### 7.2 Test Firebase Connection

1. **Open browser console** (F12)
2. **Check for Firebase errors**
3. ✅ **Success**: No Firebase connection errors

### 7.3 Test Build

```powershell
npm run build
```

✅ **Success**: Build completes without errors

---

## Step 8: Commit Your Changes

### 8.1 Stage Files

```powershell
# From project root
git add .
```

### 8.2 Commit

```powershell
git commit -m "feat: PR#1 - Project Setup & Infrastructure

- Initialize monorepo structure
- Set up React + Vite + TypeScript frontend
- Configure Firebase (Functions, Firestore, Storage)
- Create AWS Lambda structure
- Set up shared types package
- Add GitHub Actions CI/CD workflows
- Create documentation (README, setup, deployment)
- Add .gitignore and configuration files"
```

### 8.3 Push to GitHub

```powershell
git push origin main
```

---

## Checklist

Before moving to PR #2, verify:

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password + Google)
- [ ] Firestore database created
- [ ] Firebase Storage enabled
- [ ] `.env` file created with Firebase config
- [ ] Firebase CLI logged in
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Frontend dev server runs without errors
- [ ] Frontend build succeeds
- [ ] AWS account created (optional, can do later)
- [ ] AWS CLI configured (optional, can do later)
- [ ] Changes committed to Git

---

## What's Next?

Once all checklist items are complete, you're ready for:

**PR #2: Authentication & User Management**

This will implement:
- Firebase Authentication integration
- Login/Signup pages
- User profile creation
- Protected routes

---

## Troubleshooting

### Issue: Firebase login fails
- **Solution**: Make sure you're using the same Google account in browser and CLI

### Issue: Frontend won't start
- **Solution**: 
  - Check `.env` file exists and has correct values
  - Run `npm install` again in `frontend/` directory
  - Check port 3000 is not in use

### Issue: Firestore rules deployment fails
- **Solution**: 
  - Make sure you're logged in: `firebase login`
  - Check project is selected: `firebase use <project-id>`

### Issue: Build errors
- **Solution**: 
  - Delete `node_modules` and `package-lock.json`
  - Run `npm install` again
  - Check Node.js version (should be 18+)

---

## Need Help?

- **Firebase Issues**: Check [Firebase Documentation](https://firebase.google.com/docs)
- **AWS Issues**: Check [AWS Documentation](https://docs.aws.amazon.com/)
- **Project Issues**: Review `docs/setup.md` for more details

---

**Ready to proceed?** Once all checklist items are complete, you can start PR #2!

