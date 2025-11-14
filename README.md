# Stenographer - AI-Powered Demand Letter Generator

A comprehensive legal document generation platform that uses AI to create professional demand letters from uploaded documents and templates.

## 🚀 Features

- **AI-Powered Draft Generation**: Automatically generate demand letters using OpenAI GPT models
- **File Processing**: Upload and process text files (.txt) with automatic content extraction
- **Template Management**: Create and manage reusable demand letter templates with customizable sections
- **Real-Time Collaboration**: Multiple users can edit drafts simultaneously with presence indicators
- **Comments System**: Add threaded comments and replies to drafts
- **Rich Text Editing**: Professional WYSIWYG editor with formatting tools
- **DOCX Export**: Export completed drafts as Microsoft Word documents
- **Activity Timeline**: Track all matter activity including file uploads, draft generation, and updates
- **Role-Based Access**: Attorney and paralegal roles with appropriate permissions
- **Modern UI**: Clean, professional interface with sticky navigation and responsive design

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
│   │   │   ├── auth/     # Authentication components
│   │   │   ├── matters/  # Matter management components
│   │   │   ├── drafts/   # Draft editor components
│   │   │   ├── files/    # File upload/management
│   │   │   ├── templates/# Template management
│   │   │   └── common/   # Shared components
│   │   ├── pages/        # Page components
│   │   ├── services/    # API service layer
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom React hooks
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets (logo.png)
├── firebase/             # Firebase Functions and config
│   ├── functions/        # Cloud Functions
│   │   ├── src/
│   │   │   ├── services/ # Business logic services
│   │   │   └── index.ts  # Function definitions
│   │   └── lib/          # Compiled JavaScript
│   ├── public/           # Hosted frontend build
│   ├── firestore.rules   # Firestore security rules
│   └── storage.rules     # Storage security rules
├── shared/               # Shared TypeScript types
└── docs/                 # Documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git**
- **Google Cloud Billing Account** (for Firebase Storage access)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
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
   ```

3. **Set up environment variables**

   **Frontend** (`frontend/.env`):
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

   **Firebase Functions** (`firebase/functions/.env` or via Firebase Console):
   ```env
   OPENAI_API_KEY=your_openai_key
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

   The app will open at `http://localhost:5173` (Vite default port)

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

### Quick Deploy (PowerShell)

Use the provided deployment script:
```powershell
.\deploy.ps1
```

This script will:
1. Build the frontend
2. Copy files to `firebase/public`
3. Deploy to Firebase Hosting

### Manual Deployment

#### Frontend (Firebase Hosting)

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Copy build files**
   ```powershell
   # Windows PowerShell
   Remove-Item -Recurse -Force firebase\public\*
   Copy-Item -Recurse -Force frontend\dist\* firebase\public\
   Copy-Item frontend\public\logo.png firebase\public\
   ```

3. **Deploy to Firebase Hosting**
   ```bash
   cd firebase
   firebase deploy --only hosting
   ```

#### Firebase Functions

```bash
cd firebase/functions
npm run build
cd ..
firebase deploy --only functions
```

## 🏛️ Architecture

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Context + Hooks
- **Routing**: React Router v6
- **Rich Text Editor**: TipTap
- **Real-time**: Firestore real-time listeners

### Backend

- **Firebase Functions**: Serverless functions for API endpoints
- **Firestore**: NoSQL database for all application data
- **Firebase Storage**: File storage for uploaded documents
- **Firebase Auth**: User authentication (Email/Password + Google OAuth)

### AI Services

- **OpenAI GPT-4**: Draft generation and refinement
- **File Processing**: Automatic text extraction from .txt files

### Key Features

- **Draft Generation**: Firebase Function `draftGenerate` orchestrates AI-powered content generation
- **File Processing**: Automatic text extraction via `onFileCreate` trigger for .txt files
- **Real-time Collaboration**: Firestore listeners for presence and collaborative editing
- **Activity Tracking**: Synthesized from Firestore data (matters, files, drafts)

## 📚 API Documentation

### Firebase Functions

#### `draftGenerate` - Draft Generation
- **Type**: Callable Function
- **Description**: Generates a draft demand letter using AI
- **Input**:
  ```typescript
  {
    matterId: string;
    templateId: string;
    variableValues?: Record<string, string>;
  }
  ```
- **Output**: Draft document with generated sections

#### `onFileCreate` - File Processing Trigger
- **Type**: Firestore Trigger
- **Description**: Automatically extracts text from .txt files upon upload
- **Trigger**: When a file document is created in `matters/{matterId}/files/{fileId}`
- **Action**: Downloads file from Storage, extracts text, saves to `ocrText` field

#### `exportGenerate` - Export Generation
- **Type**: Callable Function
- **Description**: Generates DOCX export from draft
- **Input**:
  ```typescript
  {
    draftId: string;
    matterId: string;
    content: {
      facts: string;
      liability: string;
      damages: string;
      demand: string;
    };
    options: {
      matterTitle: string;
      clientName: string;
    };
  }
  ```

## 🎨 UI Features

### Navigation
- **Sticky Header**: Consistent navigation across all pages
- **Logo Integration**: Brand logo displayed in header
- **Responsive Design**: Mobile-friendly layout

### Matter Management
- **Collapsible Participants**: Space-saving expandable section
- **Activity Timeline**: Visual timeline of all matter activity
- **Status Badges**: Color-coded status indicators
- **Metadata Grid**: Clean, organized display of creation/update dates

### Draft Editor
- **Section Navigation**: Easy navigation between sections
- **Rich Text Editing**: Full formatting capabilities
- **Auto-save**: Automatic draft saving
- **Export**: One-click DOCX export

## 🔐 Security

- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **Authorization**: Role-based access control (Attorney/Paralegal)
- **Firestore Rules**: Enforced at database level
- **Storage Rules**: Enforced at storage level
- **Function Security**: Firebase ID token validation

## 📖 Documentation

- [Product Requirements Document](prd_stenographer.md)
- [Setup Guide](docs/setup.md)
- [Architecture](docs/architecture.md)
- [Data Model](docs/data-model.md)
- [Deployment Guide](docs/deployment.md)
- [API Reference](docs/api-reference.md)
- [Development Guide](docs/development.md)

## 🛠️ Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/description
   ```

2. **Make changes and test locally**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Build and test**
   ```bash
   npm run build
   npm test
   ```

4. **Deploy to Firebase**
   ```bash
   # Use deploy script or manual steps above
   .\deploy.ps1
   ```

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
