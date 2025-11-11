# Development Setup Guide

This guide will help you set up your local development environment for the Stenographer project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** ([Download](https://git-scm.com/))
- **Firebase CLI** (`npm install -g firebase-tools`)
- **AWS CLI** ([Download](https://aws.amazon.com/cli/))
- **VS Code** or your preferred IDE

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
   - Note your project ID

2. **Initialize Firebase in your project**
   ```bash
   firebase login
   firebase use --add  # Select your project
   ```

3. **Enable Firebase services**
   - Authentication: Enable Email/Password and Google providers
   - Firestore: Create database in Native mode
   - Storage: Enable Firebase Storage
   - Functions: Enable Cloud Functions

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
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_BASE_URL=http://localhost:5001/your_project/us-central1/api
   VITE_ENV=development
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app should open at `http://localhost:3000`

## Step 4: Firebase Functions Setup

1. **Navigate to functions directory**
   ```bash
   cd ../firebase/functions
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build TypeScript**
   ```bash
   npm run build
   ```

4. **Start Firebase emulators** (optional, for local testing)
   ```bash
   firebase emulators:start
   ```

## Step 5: AWS Setup (For Lambda Functions)

1. **Configure AWS CLI**
   ```bash
   aws configure
   ```

2. **Set up AWS resources** (manual steps):
   - Create IAM role for Lambda execution
   - Set up API Gateway
   - Configure AWS Secrets Manager
   - Store OpenAI API key in Secrets Manager

   See [deployment.md](deployment.md) for detailed AWS setup.

## Step 6: Shared Types Package

1. **Navigate to shared directory**
   ```bash
   cd ../../shared
   ```

2. **Install dependencies** (if any)
   ```bash
   npm install
   ```

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

3. **Run tests** (when implemented)
   ```bash
   cd ../frontend
   npm test
   ```

## Troubleshooting

### Common Issues

**Issue: Firebase CLI not found**
- Solution: Install globally: `npm install -g firebase-tools`

**Issue: Port 3000 already in use**
- Solution: Change port in `vite.config.ts` or kill the process using port 3000

**Issue: Firebase emulators won't start**
- Solution: Ensure Java is installed (required for Firestore emulator)

**Issue: TypeScript compilation errors**
- Solution: Run `npm install` in the affected directory to ensure all dependencies are installed

## Next Steps

- Read the [PRD](prd_stenographer.md) to understand project requirements
- Review [TASK_LIST.md](../TASK_LIST.md) for development tasks
- Start with PR #2: Authentication & User Management

## Development Workflow

1. Create a feature branch: `git checkout -b feature/pr-XX-description`
2. Make your changes
3. Test locally: `npm run dev` and `npm test`
4. Commit changes: `git commit -m "feat: PR#XX - Description"`
5. Push and create Pull Request

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)

