# Technical Context: Technologies & Setup

## Frontend Stack

### Core Technologies
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **TailwindCSS**: Utility-first CSS framework
- **React Router v6**: Client-side routing

### Key Dependencies
- `firebase`: Firebase SDK (Auth, Firestore, Storage)
- `react-router-dom`: Routing
- `@tanstack/react-query`: (Planned) Server state management
- `zustand`: (Planned) State management

### Development Tools
- TypeScript 5.2+
- ESLint (if configured)
- PostCSS for TailwindCSS

### Build Configuration
- Vite config: `vite.config.ts`
- TypeScript config: `tsconfig.json`
- Tailwind config: `tailwind.config.js`

## Backend Stack

### Firebase
- **Firebase Auth**: Email/Password + Google OAuth
- **Firestore**: NoSQL database (Native mode)
- **Firebase Storage**: File storage
- **Firebase Functions**: Serverless functions (Node.js 20)
- **Firebase Hosting**: Static site hosting

### Firebase Functions
- Runtime: Node.js 20
- Framework: `firebase-functions` v7.0.0
- TypeScript compilation to `lib/`
- Deployed to `us-central1` region

### AWS Lambda
- Runtime: Node.js 20 (or Python 3.11)
- Services:
  - **Textract**: OCR processing
  - **S3**: File storage (for Textract)
  - **Secrets Manager**: API key storage (for OpenAI)

## Development Environment

### Prerequisites
- Node.js 20+
- npm or yarn
- Firebase CLI
- AWS CLI (for Lambda deployment)
- Git

### Environment Variables
- **Frontend** (`.env`):
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_API_BASE_URL`
  - `VITE_ENV`

- **Backend** (Firebase Functions):
  - Firebase Admin SDK (auto-configured)
  - AWS credentials (for Lambda)

- **AWS Lambda**:
  - `AWS_REGION`
  - AWS credentials (IAM role)
  - API keys (via Secrets Manager)

## Project Structure
```
stenographer/
├── frontend/          # React application
├── firebase/          # Firebase configuration and functions
├── aws-lambda/        # AWS Lambda functions
├── shared/            # Shared TypeScript types
├── docs/              # Documentation
└── memory-bank/       # Project memory bank
```

## Build & Deployment

### Frontend
```bash
cd frontend
npm install
npm run build  # Outputs to frontend/dist/
```

### Firebase Functions
```bash
cd firebase/functions
npm install
npm run build  # Compiles TypeScript to lib/
```

### Deployment
- **Frontend**: Deploy `frontend/dist/` to Firebase Hosting
- **Firebase Functions**: `firebase deploy --only functions`
- **Firestore Rules**: `firebase deploy --only firestore:rules`
- **Storage Rules**: `firebase deploy --only storage:rules`

## Testing
- Unit tests: Jest (configured but not yet implemented)
- Integration tests: (To be implemented)
- E2E tests: (To be implemented)

## CI/CD
- GitHub Actions workflows (configured but not yet active)
- Automated build and deployment on push to master

## Known Constraints
- Firebase Functions require Blaze (pay-as-you-go) plan
- AWS Textract requires S3 bucket (Firebase Storage → S3 sync needed)
- File size limit: 10MB per file
- Page limit: 100 pages per file
- File count: 10 files per matter
- Data retention: 7 days auto-purge

