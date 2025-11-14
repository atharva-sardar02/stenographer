# Stenographer Deployment Script
# This script builds and deploys both frontend and backend

Write-Host "🚀 Starting Stenographer Deployment..." -ForegroundColor Cyan

# Build Frontend
Write-Host "`n📦 Building Frontend..." -ForegroundColor Yellow
Set-Location "frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# Copy frontend build to Firebase public folder
Write-Host "`n📋 Copying frontend build to Firebase public folder..." -ForegroundColor Yellow
Set-Location ".."
Remove-Item -Path "firebase\public\*" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "frontend\dist\*" -Destination "firebase\public\" -Recurse -Force
Write-Host "✅ Frontend files copied" -ForegroundColor Green

# Build Backend Functions
Write-Host "`n📦 Building Backend Functions..." -ForegroundColor Yellow
Set-Location "firebase\functions"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend built successfully" -ForegroundColor Green

# Deploy to Firebase
Write-Host "`n🚀 Deploying to Firebase..." -ForegroundColor Yellow
Set-Location ".."
firebase deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌐 App URL: https://stenographer-dev.web.app" -ForegroundColor Cyan


