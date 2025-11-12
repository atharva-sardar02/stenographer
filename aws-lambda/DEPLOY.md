# Quick Deploy Scripts for AWS Lambda Functions

This directory contains deployment scripts for each Lambda function.

## Prerequisites

1. AWS CLI configured: `aws configure`
2. Node.js 20 installed
3. IAM role created: `StenographerLambdaRole`
4. S3 bucket created: `stenographer-lambda-deployments`

## Quick Deploy All Functions

### Windows PowerShell

```powershell
# Set variables
$REGION = "us-east-1"
$ROLE_ARN = "arn:aws:iam::YOUR_ACCOUNT_ID:role/StenographerLambdaRole"

# Deploy Exports
cd exports
npm install
npm run build
Compress-Archive -Path dist,node_modules,package.json -DestinationPath function.zip -Force
aws lambda update-function-code --function-name stenographer-exports --zip-file fileb://function.zip --region $REGION
Remove-Item function.zip
cd ..

# Deploy OCR
cd ocr
npm install
npm run build
Compress-Archive -Path dist,node_modules,package.json -DestinationPath function.zip -Force
aws lambda update-function-code --function-name stenographer-ocr --zip-file fileb://function.zip --region $REGION
Remove-Item function.zip
cd ..

# Deploy Drafts
cd drafts
npm install
npm run build
Compress-Archive -Path dist,node_modules,package.json -DestinationPath function.zip -Force
aws lambda update-function-code --function-name stenographer-drafts --zip-file fileb://function.zip --region $REGION
Remove-Item function.zip
cd ..
```

### Linux/Mac

```bash
#!/bin/bash
REGION="us-east-1"
ROLE_ARN="arn:aws:iam::YOUR_ACCOUNT_ID:role/StenographerLambdaRole"

# Deploy Exports
cd exports
npm install && npm run build
zip -r function.zip dist/ node_modules/ package.json
aws lambda update-function-code --function-name stenographer-exports --zip-file fileb://function.zip --region $REGION
rm function.zip
cd ..

# Deploy OCR
cd ocr
npm install && npm run build
zip -r function.zip dist/ node_modules/ package.json
aws lambda update-function-code --function-name stenographer-ocr --zip-file fileb://function.zip --region $REGION
rm function.zip
cd ..

# Deploy Drafts
cd drafts
npm install && npm run build
zip -r function.zip dist/ node_modules/ package.json
aws lambda update-function-code --function-name stenographer-drafts --zip-file fileb://function.zip --region $REGION
rm function.zip
cd ..
```

## Individual Function Deployment

See `AWS_DEPLOYMENT_GUIDE.md` for detailed instructions on deploying each function individually.

