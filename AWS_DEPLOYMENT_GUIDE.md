# AWS Deployment Guide for Stenographer

This guide walks you through deploying all AWS Lambda functions and required AWS services for the Stenographer application.

## 📋 Prerequisites

1. **AWS Account** with billing enabled
2. **AWS CLI** installed and configured
   ```bash
   aws --version  # Should be v2.x or later
   aws configure  # Set up credentials
   ```
3. **Node.js 20** installed
4. **OpenAI API Key** (for draft generation)
5. **Firebase Admin SDK credentials** (service account JSON file)

## 🏗️ AWS Services Required

- **Lambda Functions**: OCR, Drafts, Exports
- **S3 Buckets**: 
  - Deployment packages bucket
  - Exports storage bucket (optional, can use Firebase Storage)
- **IAM Roles**: For Lambda execution
- **API Gateway** (optional): If not using Firebase Functions as proxy
- **Secrets Manager**: For storing OpenAI API key
- **Textract**: For OCR processing (no setup needed, just permissions)

## 📦 Step 1: Set Up AWS Infrastructure

### 1.1 Create S3 Bucket for Lambda Deployment

```bash
aws s3 mb s3://stenographer-lambda-deployments --region us-east-1
```

### 1.2 Create S3 Bucket for Exports (Optional)

If you want to use S3 for exports instead of Firebase Storage:

```bash
aws s3 mb s3://stenographer-exports --region us-east-1
```

### 1.3 Create IAM Role for Lambda Functions

Create a file `lambda-role-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Create the role:

```bash
aws iam create-role \
  --role-name StenographerLambdaRole \
  --assume-role-policy-document file://lambda-role-policy.json
```

Attach policies:

```bash
# Basic Lambda execution
aws iam attach-role-policy \
  --role-name StenographerLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Textract access (for OCR)
aws iam attach-role-policy \
  --role-name StenographerLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonTextractFullAccess

# S3 access (for exports)
aws iam attach-role-policy \
  --role-name StenographerLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Secrets Manager access (for OpenAI key)
aws iam attach-role-policy \
  --role-name StenographerLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

Get the role ARN (you'll need this later):

```bash
aws iam get-role --role-name StenographerLambdaRole --query 'Role.Arn' --output text
```

### 1.4 Store OpenAI API Key in Secrets Manager

```bash
aws secretsmanager create-secret \
  --name stenographer/openai-api-key \
  --secret-string "your-openai-api-key-here" \
  --region us-east-1
```

## 📦 Step 2: Deploy Exports Lambda Function

The exports function generates DOCX files from draft content.

### 2.1 Build the Function

```bash
cd aws-lambda/exports
npm install
npm run build
```

### 2.2 Package the Function

```bash
# Create deployment package
zip -r function.zip dist/ node_modules/ package.json

# Or on Windows PowerShell:
Compress-Archive -Path dist,node_modules,package.json -DestinationPath function.zip
```

### 2.3 Create/Update Lambda Function

```bash
# Get your AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/StenographerLambdaRole"

# Create function (first time)
aws lambda create-function \
  --function-name stenographer-exports \
  --runtime nodejs20.x \
  --role $ROLE_ARN \
  --handler dist/index.generate \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{EXPORT_BUCKET_NAME=stenographer-exports}" \
  --region $REGION

# Or update existing function
aws lambda update-function-code \
  --function-name stenographer-exports \
  --zip-file fileb://function.zip \
  --region $REGION
```

### 2.4 Update Function Configuration

```bash
aws lambda update-function-configuration \
  --function-name stenographer-exports \
  --environment Variables="{EXPORT_BUCKET_NAME=stenographer-exports}" \
  --timeout 30 \
  --memory-size 512 \
  --region $REGION
```

## 📦 Step 3: Deploy OCR Lambda Function

The OCR function extracts text from PDF files using AWS Textract.

### 3.1 Build the Function

```bash
cd aws-lambda/ocr
npm install
npm run build
```

### 3.2 Package and Deploy

```bash
# Package
zip -r function.zip dist/ node_modules/ package.json

# Create/Update function
aws lambda create-function \
  --function-name stenographer-ocr \
  --runtime nodejs20.x \
  --role $ROLE_ARN \
  --handler dist/index.extract \
  --zip-file fileb://function.zip \
  --timeout 300 \
  --memory-size 1024 \
  --region $REGION

# Or update
aws lambda update-function-code \
  --function-name stenographer-ocr \
  --zip-file fileb://function.zip \
  --region $REGION
```

**Note:** OCR can take time for large PDFs, so timeout is set to 300 seconds (5 minutes).

## 📦 Step 4: Deploy Drafts Lambda Function

The drafts function generates and refines draft content using OpenAI.

### 4.1 Build the Function

```bash
cd aws-lambda/drafts
npm install
npm run build
```

### 4.2 Package and Deploy

```bash
# Package
zip -r function.zip dist/ node_modules/ package.json

# Create/Update function
aws lambda create-function \
  --function-name stenographer-drafts \
  --runtime nodejs20.x \
  --role $ROLE_ARN \
  --handler dist/index.generate \
  --zip-file fileb://function.zip \
  --timeout 300 \
  --memory-size 1024 \
  --environment Variables="{OPENAI_SECRET_NAME=stenographer/openai-api-key}" \
  --region $REGION

# Or update
aws lambda update-function-code \
  --function-name stenographer-drafts \
  --zip-file fileb://function.zip \
  --region $REGION
```

**Note:** Draft generation can take 30-60 seconds, so timeout is set to 300 seconds.

## 📦 Step 5: Update Firebase Functions to Call AWS Lambda

Now we need to update the Firebase Functions to actually call the AWS Lambda functions instead of returning placeholders.

### 5.1 Install AWS SDK in Firebase Functions

```bash
cd firebase/functions
npm install aws-sdk
npm install --save-dev @types/aws-sdk
```

### 5.2 Update Firebase Function to Call Lambda

Update `firebase/functions/src/index.ts` to call the actual Lambda functions. See the integration section below.

## 🔗 Step 6: Integrate Firebase Functions with AWS Lambda

### 6.1 Update Export Function

Update `firebase/functions/src/index.ts`:

```typescript
import * as AWS from 'aws-sdk';

const lambda = new AWS.Lambda({
  region: 'us-east-1', // Your Lambda region
});

export const exportGenerate = functions
  .region('us-central1')
  .https
  .onRequest((request, response) => {
    corsHandler(request, response, async () => {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      try {
        // Verify Firebase ID token
        const authHeader = request.headers.authorization;
        if (!authHeader) {
          response.status(401).json({ error: 'Unauthorized' });
          return;
        }

        // Call AWS Lambda
        const lambdaParams = {
          FunctionName: 'stenographer-exports',
          InvocationType: 'RequestResponse',
          Payload: JSON.stringify({
            body: JSON.stringify(request.body),
            headers: request.headers,
          }),
        };

        const lambdaResult = await lambda.invoke(lambdaParams).promise();
        const lambdaResponse = JSON.parse(lambdaResult.Payload as string);

        // Return Lambda response
        response.status(lambdaResponse.statusCode).json(JSON.parse(lambdaResponse.body));
      } catch (error: any) {
        console.error('Export generation proxy error:', error);
        response.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });
  });
```

### 6.2 Update OCR Function

Similar pattern for OCR:

```typescript
export const ocrExtract = functions
  .region('us-central1')
  .https
  .onRequest((request, response) => {
    corsHandler(request, response, async () => {
      // ... similar to exportGenerate
      const lambdaParams = {
        FunctionName: 'stenographer-ocr',
        // ...
      };
      // ...
    });
  });
```

### 6.3 Update Draft Generation Function

Similar pattern for draft generation:

```typescript
export const draftGenerate = functions
  .region('us-central1')
  .https
  .onRequest((request, response) => {
    corsHandler(request, response, async () => {
      // ... similar to exportGenerate
      const lambdaParams = {
        FunctionName: 'stenographer-drafts',
        // ...
      };
      // ...
    });
  });
```

## 🔐 Step 7: Configure AWS Credentials for Firebase Functions

Firebase Functions need AWS credentials to invoke Lambda. You have two options:

### Option A: Environment Variables (Recommended for Development)

Add to `firebase/functions/.env` (don't commit this):

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### Option B: IAM Role (Recommended for Production)

Create an IAM role that Firebase Functions can assume, or use service account credentials.

## 🧪 Step 8: Test the Integration

### 8.1 Test Export Function

```bash
# Deploy updated Firebase Functions
cd firebase
firebase deploy --only functions:exportGenerate

# Test from frontend - try exporting a draft
```

### 8.2 Test OCR Function

```bash
firebase deploy --only functions:ocrExtract

# Upload a PDF file in the app and verify OCR processing
```

### 8.3 Test Draft Generation

```bash
firebase deploy --only functions:draftGenerate

# Generate a draft in the app and verify it works
```

## 📊 Step 9: Monitor and Debug

### View Lambda Logs

```bash
# Export function logs
aws logs tail /aws/lambda/stenographer-exports --follow

# OCR function logs
aws logs tail /aws/lambda/stenographer-ocr --follow

# Drafts function logs
aws logs tail /aws/lambda/stenographer-drafts --follow
```

### View Firebase Function Logs

```bash
firebase functions:log
```

## 💰 Cost Considerations

### AWS Lambda Pricing
- **Free Tier**: 1M requests/month, 400,000 GB-seconds compute
- **After Free Tier**: $0.20 per 1M requests, $0.0000166667 per GB-second

### AWS Textract Pricing
- **First 1,000 pages/month**: Free
- **After**: $1.50 per 1,000 pages

### AWS Secrets Manager
- **$0.40 per secret per month**
- **$0.05 per 10,000 API calls**

## 🚨 Troubleshooting

### Common Issues

1. **"Access Denied" errors**
   - Check IAM role permissions
   - Verify Lambda function names match

2. **Timeout errors**
   - Increase Lambda timeout (max 15 minutes)
   - Check function logs for bottlenecks

3. **CORS errors**
   - Ensure Firebase Function has CORS configured
   - Check Lambda response includes CORS headers

4. **OpenAI API errors**
   - Verify secret is stored correctly in Secrets Manager
   - Check Lambda has permission to read secret

## 📝 Next Steps

1. Set up CloudWatch alarms for Lambda errors
2. Configure auto-scaling if needed
3. Set up cost alerts in AWS Budgets
4. Consider using API Gateway if you need more control
5. Set up CI/CD pipeline for automated deployments

## 🔄 Updating Functions

To update a function after code changes:

```bash
cd aws-lambda/[function-name]
npm install
npm run build
zip -r function.zip dist/ node_modules/ package.json
aws lambda update-function-code \
  --function-name stenographer-[function-name] \
  --zip-file fileb://function.zip \
  --region us-east-1
```

---

**Ready to start?** Begin with Step 1 and work through each section. If you encounter issues, check the troubleshooting section or the AWS Lambda logs.

