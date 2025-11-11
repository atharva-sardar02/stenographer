# Project Brief: Stenographer Demand Letter Generator

## Overview
Stenographer is an AI-powered demand letter generation platform designed for legal professionals (attorneys and paralegals) to create professional demand letters from source documents (PDFs, DOCX, TXT) using customizable templates.

## Core Purpose
Automate the creation of demand letters by:
- Extracting text from uploaded source documents (OCR for scanned PDFs)
- Using AI (OpenAI) to generate structured content based on templates
- Providing a collaborative editing environment
- Exporting final documents as DOCX files

## Key Requirements
1. **Authentication**: Firebase Auth (Email/Password + Google OAuth)
2. **File Management**: Upload, store, and process source documents (max 10MB, 100 pages, 10 files per matter)
3. **OCR Processing**: AWS Textract for scanned PDF text extraction
4. **Template System**: Customizable templates with 4 sections (Facts, Liability, Damages, Demand) and variables
5. **AI Generation**: OpenAI API for draft generation from source files and templates
6. **Real-time Collaboration**: Basic real-time editing with change tracking
7. **Data Retention**: 7-day auto-purge policy for uploaded sources and generated drafts
8. **Export**: DOCX format only
9. **Role-Based Access**: Attorneys can create/edit templates, paralegals can read/use

## Technical Stack
- **Frontend**: React + Vite + TypeScript + TailwindCSS + React Router + TanStack Query + Zustand
- **Backend**: Firebase Functions (Node.js/TypeScript) + AWS Lambda (Node.js/Python)
- **Database**: Firestore (Native mode)
- **Storage**: Firebase Storage
- **OCR**: AWS Textract
- **LLM**: OpenAI API
- **Hosting**: Firebase Hosting

## Project Status
- **Current Phase**: PR #7 completed (Template Management)
- **Completed PRs**: #1-7 (Project Setup, Auth, Firestore Schema, Matter Management, File Upload, OCR Processing, Template Management)
- **Next PR**: #8 (AI Draft Generation)

