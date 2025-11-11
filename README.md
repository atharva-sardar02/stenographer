# Stenographer - Demand Letter Generator

> AI-driven solution for automating demand letter creation in law firms

## Overview

Stenographer is an AI-powered demand letter generator designed to streamline the creation of demand letters for law firms. By leveraging AI to automate the drafting of these documents, this tool significantly reduces the time attorneys spend on this task—from hours to minutes.

## Features

- **AI-Powered Draft Generation**: Generate structured demand letters from source materials using OpenAI
- **Template Management**: Create and manage firm-specific templates with customizable sections
- **Real-Time Collaboration**: Basic real-time editing with change tracking
- **OCR Processing**: Extract text from scanned PDFs using AWS Textract
- **File Management**: Upload and organize case documents (PDF, DOCX, TXT)
- **DOCX Export**: Export final letters to Microsoft Word format
- **7-Day Retention**: Automated data retention policy

## Tech Stack

- **Frontend**: React 18+ with Vite, TypeScript, TailwindCSS
- **Backend**: Firebase Cloud Functions (proxy) + AWS Lambda
- **Database**: Firestore (Native mode)
- **Storage**: Firebase Storage
- **Auth**: Firebase Authentication (Email/Password + Google OAuth)
- **AI**: OpenAI API (GPT-4)
- **OCR**: AWS Textract

## Project Structure

```
stenographer/
├── frontend/          # React SPA
├── firebase/          # Firebase Functions & config
├── aws-lambda/        # AWS Lambda functions
├── shared/            # Shared TypeScript types
└── docs/              # Documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- Firebase CLI
- AWS CLI (for Lambda deployment)
- Firebase account
- AWS account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stenographer
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Firebase Functions dependencies**
   ```bash
   cd ../firebase/functions
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Copy example env file
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your Firebase config
   ```

5. **Run development server**
   ```bash
   cd frontend
   npm run dev
   ```

For detailed setup instructions, see [docs/setup.md](docs/setup.md).

## Development

### Frontend Development

```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run test     # Run tests
```

### Firebase Functions

```bash
cd firebase/functions
npm run build    # Compile TypeScript
npm run serve    # Start emulator
npm run deploy   # Deploy to Firebase
```

## Deployment

See [docs/deployment.md](docs/deployment.md) for detailed deployment instructions.

## Documentation

- [Setup Guide](docs/setup.md) - Development environment setup
- [Deployment Guide](docs/deployment.md) - Production deployment
- [PRD](prd_stenographer.md) - Product Requirements Document
- [Task List](TASK_LIST.md) - Development task breakdown

## Contributing

1. Create a feature branch: `git checkout -b feature/pr-XX-description`
2. Make your changes
3. Run tests: `npm test`
4. Commit: `git commit -m "feat: PR#XX - Description"`
5. Push and create a Pull Request

## License

[Your License Here]

## Support

For issues and questions, please open an issue in the repository.

