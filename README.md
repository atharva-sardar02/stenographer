# Stenographer - AI-Powered Demand Letter Generator

A comprehensive legal document generation platform that uses AI to create professional demand letters from uploaded documents and templates.

## 🚀 Features

- **AI-Powered Draft Generation**: Automatically generate demand letters using OpenAI GPT models
- **OCR Processing**: Extract text from scanned PDFs using AWS Textract
- **Template Management**: Create and manage reusable demand letter templates
- **Real-Time Collaboration**: Multiple users can edit drafts simultaneously with presence indicators
- **Comments System**: Add threaded comments and replies to drafts
- **Rich Text Editing**: Professional WYSIWYG editor with formatting tools
- **DOCX Export**: Export completed drafts as Microsoft Word documents
- **Data Retention**: Automatic 7-day purge policy for uploaded files and exports
- **Role-Based Access**: Attorney and paralegal roles with appropriate permissions

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## 🏗️ Project Structure

```
stenographer/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
│   └── tests/            # Test files
├── firebase/              # Firebase Functions and config
│   ├── functions/        # Cloud Functions
│   ├── firestore.rules   # Firestore security rules
│   └── storage.rules     # Storage security rules
├── aws-lambda/            # AWS Lambda functions
│   ├── ocr/              # OCR processing
│   ├── drafts/           # Draft generation
│   └── exports/          # DOCX export
├── shared/                # Shared TypeScript types
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- AWS CLI (for Lambda deployment)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/stenographer.git
   cd stenographer
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Firebase Functions
   cd ../firebase/functions
   npm install

   # AWS Lambda functions
   cd ../../aws-lambda/ocr
   npm install
   cd ../drafts
   npm install
   cd ../exports
   npm install
   ```

3. **Set up environment variables**

   Create `.env` files in the following locations:

   **Frontend** (`frontend/.env`):
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_BASE_URL=https://us-central1-your-project.cloudfunctions.net
   ```

   **Firebase Functions** (`firebase/functions/.env`):
   ```env
   OPENAI_API_KEY=your_openai_key
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   ```

4. **Initialize Firebase**
   ```bash
   cd firebase
   firebase login
   firebase use your-project-id
   firebase deploy --only firestore:rules,storage:rules
   ```

5. **Start development server**
   ```bash
   cd frontend
   npm run dev
   ```

## 🧪 Testing

### Unit Tests
```bash
cd frontend
npm run test:unit
```

### Integration Tests
```bash
cd frontend
npm run test:integration
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

### Test Coverage
```bash
cd frontend
npm run test:coverage
```

## 🚢 Deployment

### Frontend (Firebase Hosting)

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Firebase Hosting**
   ```bash
   cd firebase
   firebase deploy --only hosting
   ```

### Firebase Functions

```bash
cd firebase
firebase deploy --only functions
```

### AWS Lambda Functions

See [docs/deployment.md](docs/deployment.md) for detailed AWS deployment instructions.

## 🏛️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand + React Context
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query
- **Rich Text Editor**: TipTap

### Backend
- **Firebase Functions**: API proxy and serverless functions
- **AWS Lambda**: OCR processing, draft generation, DOCX export
- **Firestore**: NoSQL database for all application data
- **Firebase Storage**: File storage for uploaded documents
- **Firebase Auth**: User authentication

### AI Services
- **OpenAI GPT-4**: Draft generation and refinement
- **AWS Textract**: OCR for scanned PDFs

## 📚 API Documentation

### Firebase Functions

#### `api` - Main API Proxy
- **Endpoint**: `POST /api/v1/*`
- **Description**: Proxies requests to AWS Lambda functions
- **Authentication**: Firebase ID token required

#### `exportGenerate` - Export Generation
- **Endpoint**: `POST /api/v1/exports:generate`
- **Description**: Generates DOCX export from draft
- **Request Body**:
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

#### `retentionPurge` - Scheduled Retention Job
- **Schedule**: Daily at midnight (America/New_York)
- **Description**: Automatically purges files and exports older than 7 days

### AWS Lambda Functions

#### OCR Processing (`aws-lambda/ocr`)
- **Trigger**: Firebase Function proxy
- **Input**: PDF file from Firebase Storage
- **Output**: Extracted text with confidence scores

#### Draft Generation (`aws-lambda/drafts`)
- **Trigger**: Firebase Function proxy
- **Input**: Template, files, variable values
- **Output**: Generated draft with all sections

#### DOCX Export (`aws-lambda/exports`)
- **Trigger**: Firebase Function proxy
- **Input**: Draft content
- **Output**: DOCX file in Firebase Storage

## 🔐 Security

- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **Authorization**: Role-based access control (Attorney/Paralegal)
- **Firestore Rules**: Enforced at database level
- **Storage Rules**: Enforced at storage level
- **API Security**: Firebase ID token validation

## 📖 Documentation

- [Product Requirements Document](prd_stenographer.md)
- [Data Model](docs/data-model.md)
- [Deployment Guide](docs/deployment.md)
- [API Reference](docs/api-reference.md)
- [Development Guide](docs/development.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 🆘 Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for legal professionals**
