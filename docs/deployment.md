# Deployment Guide

This guide covers deploying the Stenographer application to production environments.

## Overview

The Stenographer application consists of three main components:
1. **Frontend** - React SPA deployed to Firebase Hosting
2. **Firebase Functions** - Cloud Functions for API proxy
3. **AWS Lambda** - Lambda functions for OCR, AI generation, and exports

## Prerequisites

- Firebase project created and configured
- AWS account with appropriate permissions
- GitHub repository with secrets configured
- Domain name (optional, for custom domain)

## Environment Setup

### Development Environment

- Firebase project: `stenographer-dev`
- AWS region: `us-east-1`
- API Gateway: `dev-api.stenographer.com`

### Staging Environment

- Firebase project: `stenographer-staging`
- AWS region: `us-east-1`
- API Gateway: `staging-api.stenographer.com`

### Production Environment

- Firebase project: `stenographer-prod`
- AWS region: `us-east-1`
- API Gateway: `api.stenographer.com`

## Firebase Deployment

### 1. Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 2. Deploy Storage Rules

```bash
firebase deploy --only storage
```

### 3. Deploy Cloud Functions

```bash
cd firebase/functions
npm install
npm run build
cd ../..
firebase deploy --only functions
```

### 4. Deploy Frontend to Hosting

```bash
cd frontend
npm install
npm run build
cd ../..
firebase deploy --only hosting
```

## AWS Lambda Deployment

### Prerequisites

1. **Install AWS SAM CLI**
   ```bash
   pip install aws-sam-cli
   ```

2. **Configure AWS Credentials**
   ```bash
   aws configure
   ```

### Deploy Individual Lambda Functions

Each Lambda function has its own directory with a `template.yaml` file (to be created in future PRs).

Example deployment:
```bash
cd aws-lambda/upload
sam build
sam deploy --guided
```

### Set Up API Gateway

1. Create REST API in API Gateway console
2. Create resources and methods for each endpoint
3. Configure CORS
4. Set up integration with Lambda functions
5. Deploy API to stage (dev/staging/prod)

### Configure Secrets Manager

1. **Store OpenAI API Key**
   ```bash
   aws secretsmanager create-secret \
     --name stenographer/openai-api-key \
     --secret-string "your-openai-api-key"
   ```

2. **Store AWS Credentials** (if needed)
   ```bash
   aws secretsmanager create-secret \
     --name stenographer/aws-credentials \
     --secret-string '{"accessKeyId":"...","secretAccessKey":"..."}'
   ```

## CI/CD Pipeline

The project uses GitHub Actions for automated deployment. Workflows are configured in `.github/workflows/`:

- **deploy-frontend.yml** - Deploys frontend on push to main/develop
- **deploy-firebase.yml** - Deploys Firebase Functions on changes
- **deploy-lambda.yml** - Deploys Lambda functions on changes

### GitHub Secrets Required

Configure these secrets in your GitHub repository:

**Firebase:**
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON
- `FIREBASE_PROJECT_ID` - Firebase project ID

**Frontend Environment Variables:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_BASE_URL`

**AWS:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## Manual Deployment Steps

### Frontend

```bash
# Build
cd frontend
npm install
npm run build

# Deploy
firebase deploy --only hosting
```

### Firebase Functions

```bash
cd firebase/functions
npm install
npm run build
cd ../..
firebase deploy --only functions
```

### Firestore Rules

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Storage Rules

```bash
firebase deploy --only storage
```

## Post-Deployment Verification

1. **Verify Frontend**
   - Visit deployed URL
   - Test authentication flow
   - Verify API calls work

2. **Verify Firebase Functions**
   - Check Firebase Console for function status
   - Test API endpoints
   - Review logs for errors

3. **Verify Lambda Functions**
   - Test via API Gateway
   - Check CloudWatch logs
   - Verify secrets are accessible

4. **Verify Firestore**
   - Test data reads/writes
   - Verify security rules
   - Check indexes are created

## Rollback Procedure

### Frontend Rollback

```bash
firebase hosting:channel:deploy previous-version --expires 30d
```

### Functions Rollback

```bash
# List previous versions
firebase functions:list

# Rollback to previous version
firebase functions:rollback <function-name> <version>
```

### Lambda Rollback

Use AWS Console or CLI to rollback to previous Lambda version:
```bash
aws lambda update-alias \
  --function-name <function-name> \
  --name <alias-name> \
  --function-version <previous-version>
```

## Monitoring

### Firebase

- **Functions Logs**: Firebase Console > Functions > Logs
- **Hosting Analytics**: Firebase Console > Hosting > Analytics
- **Firestore Usage**: Firebase Console > Firestore > Usage

### AWS

- **CloudWatch Logs**: Monitor Lambda function logs
- **API Gateway Metrics**: Track API usage and errors
- **Cost Monitoring**: AWS Cost Explorer

## Security Checklist

- [ ] Firebase security rules deployed
- [ ] Storage security rules deployed
- [ ] API keys stored in AWS Secrets Manager
- [ ] CORS configured correctly
- [ ] Environment variables not exposed in client code
- [ ] HTTPS enforced
- [ ] Authentication required for all protected routes

## Troubleshooting

### Common Deployment Issues

**Issue: Firebase deployment fails**
- Check Firebase CLI is logged in: `firebase login`
- Verify project is selected: `firebase use <project-id>`
- Check function build succeeds: `cd firebase/functions && npm run build`

**Issue: Lambda deployment fails**
- Verify AWS credentials: `aws sts get-caller-identity`
- Check SAM template syntax: `sam validate`
- Review CloudFormation stack errors in AWS Console

**Issue: Frontend build fails**
- Check environment variables are set
- Verify all dependencies installed: `npm install`
- Check TypeScript errors: `npm run build`

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure custom domain (if needed)
3. Set up backup procedures
4. Document production URLs and credentials

