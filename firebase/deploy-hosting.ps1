# PowerShell script to build frontend and deploy to Firebase Hosting
# Usage: .\deploy-hosting.ps1

Write-Host "Building frontend..." -ForegroundColor Green
cd ..\frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Copying build files to firebase/public..." -ForegroundColor Green
cd ..\firebase
Remove-Item -Recurse -Force public\* -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force ..\frontend\dist\* public\

Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Green
firebase deploy --only hosting

Write-Host "Deployment complete!" -ForegroundColor Green


