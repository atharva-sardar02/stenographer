# Development Setup Guide

This guide will help you set up your local development environment for the Stenographer project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** package manager (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Firebase CLI** (`npm install -g firebase-tools`)
- **VS Code** or your preferred IDE
- **Google Cloud Billing Account** (required for Firebase Storage access from Cloud Functions)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd stenographer
```

## Step 2: Firebase Setup

1. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard
   - Note your project ID (e.g., `stenographer-dev`)

2. **Enable Firebase services**
   - **Authentication**: 
     - Enable Email/Password provider
     - Enable Google Sign-In provider
   - **Firestore**: 
     - Create database in Native mode
     - Start in production mode (we'll deploy rules)
   - **Storage**: 
     - Enable Firebase Storage
     - Set up default bucket
   - **Functions**: 
     - Enable Cloud Functions
     - Select region (e.g., `us-central1`)

3. **Link billing account**
   - Go to Project Settings → Usage and billing
   - Link a billing account (required for Storage access from Functions)

4. **Initialize Firebase in your project**
   ```bash
   firebase login
   firebase use --add  # Select your project
   ```

5. **Deploy security rules**
   ```bash
   cd firebase
   firebase deploy --only firestore:rules,storage:rules
   ```

## Step 3: Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create `frontend/.env` file:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

   **To get these values**:
   - Go to Firebase Console → Project Settings → General
   - Scroll to "Your apps" section
   - Click the web icon (`</>`) to create a web app
   - Copy the config values

4. **Add logo (optional)**
   - Place `logo.png` in `frontend/public/` directory
   - Recommended size: 40x40 pixels or larger with transparent background

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app should open at `http://localhost:5173` (Vite default port)

## Step 4: Firebase Functions Setup

1. **Navigate to functions directory**
   ```bash
   cd ../firebase/functions
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   **Option 1: Via Firebase Console (Recommended)**
   - Go to Firebase Console → Functions → Configuration
   - Add secret: `OPENAI_API_KEY` with your OpenAI API key

   **Option 2: Via Firebase CLI**
   ```bash
   firebase functions:secrets:set OPENAI_API_KEY
   # Enter your OpenAI API key when prompted
   ```

4. **Build TypeScript**
   ```bash
   npm run build
   ```

5. **Test locally (optional)**
   ```bash
   # Start Firebase emulators
   firebase emulators:start
   ```

## Step 5: Deploy Functions

1. **Deploy all functions**
   ```bash
   cd ../firebase
   firebase deploy --only functions
   ```

2. **Verify deployment**
   - Check Firebase Console → Functions
   - All functions should show as "Active"

## Step 6: Create Initial Data

1. **Create a test user**
   - Go to Firebase Console → Authentication
   - Add user manually or use the signup page

2. **Set user role**
   - Go to Firestore Console
   - Navigate to `users/{userId}`
   - Add field: `role: "attorney"` or `role: "paralegal"`

3. **Create a template (optional)**
   - Use the Templates page in the app
   - Or use the script: `firebase/functions/scripts/create-demo-template.ts`

## Step 7: Verify Setup

1. **Test frontend build**
   ```bash
   cd frontend
   npm run build
   ```

2. **Test TypeScript compilation**
   ```bash
   cd ../firebase/functions
   npm run build
   ```

3. **Test the application**
   - Start dev server: `cd frontend && npm run dev`
   - Log in with test user
   - Create a matter
   - Upload a .txt file
   - Generate a draft

## Troubleshooting

### Common Issues

**Issue: Firebase CLI not found**
- Solution: Install globally: `npm install -g firebase-tools`
- Verify: `firebase --version`

**Issue: Port 5173 already in use**
- Solution: Vite will automatically use the next available port
- Or change port in `vite.config.ts`

**Issue: Firebase emulators won't start**
- Solution: Ensure Java is installed (required for Firestore emulator)
- Or skip emulators and deploy directly

**Issue: TypeScript compilation errors**
- Solution: Run `npm install` in the affected directory
- Check `tsconfig.json` for correct configuration

**Issue: Storage access denied from Functions**
- Solution: Ensure billing account is linked to Firebase project
- Check that Storage bucket name matches in `.env` file

**Issue: Functions deployment fails**
- Solution: Check that all environment variables are set
- Verify Node.js version matches (18+)
- Check function logs in Firebase Console

**Issue: Draft generation fails with "cannot access files"**
- Solution: Ensure `onFileCreate` trigger is deployed
- Check that files have `ocrText` field populated
- Verify Storage bucket permissions

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/description
   ```

2. **Make changes**
   - Edit code in `frontend/src/` or `firebase/functions/src/`
   - Test locally with `npm run dev`

3. **Build and test**
   ```bash
   # Frontend
   cd frontend
   npm run build
   npm test

   # Functions
   cd firebase/functions
   npm run build
   ```

4. **Deploy**
   ```bash
   # Use deployment script (PowerShell)
   .\deploy.ps1

   # Or manually
   cd frontend && npm run build
   # Copy files to firebase/public
   cd firebase && firebase deploy
   ```

## Project Structure Overview

```
stenographer/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/    # API services
│   │   └── config/      # Firebase config
│   ├── public/          # Static assets
│   └── dist/            # Build output
├── firebase/
│   ├── functions/       # Cloud Functions
│   │   ├── src/        # TypeScript source
│   │   └── lib/        # Compiled JavaScript
│   └── public/         # Hosted frontend
└── docs/               # Documentation
```

## Next Steps

- Read the [Product Requirements Document](../prd_stenographer.md)
- Review [Architecture Documentation](architecture.md)
- Check [API Reference](api-reference.md)
- Start developing features!

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
