# Firebase API Key Rotation Steps

## Step 1: Rotate Firebase API Key in Google Cloud Console

### 1.1 Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **stenographer-dev**
3. Navigate to: **APIs & Services** → **Credentials**

### 1.2 Find and Delete the Exposed Key
1. Look for API key: `AIzaSyDJJjKRAe6DfGflaHgGSDCd9ynQKbQqDGE`
2. Click on the key to open details
3. Click **DELETE** button
4. Confirm deletion

### 1.3 Create New API Key
1. Click **+ CREATE CREDENTIALS** → **API Key**
2. **IMPORTANT**: Copy the new key immediately (you won't see it again)
3. Save it temporarily in a secure location

### 1.4 Restrict the New API Key
1. Click **RESTRICT KEY** (or click on the newly created key)
2. **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Click **ADD AN ITEM** and add:
     - `https://stenographer-dev.web.app/*`
     - `https://stenographer-dev.firebaseapp.com/*`
     - `http://localhost:*` (for local development)
3. **API restrictions**:
   - Select **Restrict key**
   - Click **Select APIs**
   - Enable ONLY these APIs:
     - ✅ Firebase Authentication API
     - ✅ Cloud Firestore API
     - ✅ Firebase Storage API
     - ✅ Firebase Cloud Functions API
   - Click **DONE**
4. Click **SAVE**

## Step 2: Update Local Environment File

### 2.1 Update frontend/.env
1. Open `frontend/.env` in your editor
2. Find the line: `VITE_FIREBASE_API_KEY=...`
3. Replace the old key with your new key:
   ```
   VITE_FIREBASE_API_KEY=<your_new_key_here>
   ```
4. Save the file

### 2.2 Verify Other Variables
Make sure these are set correctly (they should already be correct):
```
VITE_FIREBASE_AUTH_DOMAIN=stenographer-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=stenographer-dev
VITE_FIREBASE_STORAGE_BUCKET=stenographer-dev.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=460595345839
VITE_FIREBASE_APP_ID=1:460595345839:web:6915a4b6280b403d73975a
```

## Step 3: Rebuild and Redeploy

### 3.1 Rebuild Frontend
```powershell
cd D:\gauntlet-ai\stenographer
.\deploy.ps1
```

This will:
- Build the frontend with the new API key from `.env`
- Copy build files to `firebase/public/`
- Deploy to Firebase Hosting

### 3.2 Verify Deployment
1. Visit: https://stenographer-dev.web.app
2. Test login/signup functionality
3. Verify the app works correctly

## Step 4: Commit Security Changes

### 4.1 Stage Changes
```powershell
git add .gitignore frontend/.env.example
```

### 4.2 Commit
```powershell
git commit -m "Security: Remove build artifacts from git, add .env.example

- Updated .gitignore to exclude firebase/public/assets/ and index.html
- Removed build artifacts from git tracking (files remain on disk for deployment)
- Added .env.example to document required environment variables
- Build artifacts will be generated during deployment, not committed"
```

### 4.3 Push Changes
```powershell
git push
```

## Step 5: Clean Git History (Optional but Recommended)

If you want to completely remove the exposed key from git history:

### Option A: Using git filter-branch (for small repos)
```powershell
# WARNING: This rewrites history. Coordinate with team first!
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch firebase/public/assets/index-BCwa9-4P.js" `
  --prune-empty --tag-name-filter cat -- --all
```

### Option B: Using BFG Repo-Cleaner (recommended for large repos)
1. Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
2. Run:
```powershell
java -jar bfg.jar --delete-files index-BCwa9-4P.js
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### After cleaning history:
```powershell
git push --force --all
```

**⚠️ WARNING**: Force pushing rewrites history. Only do this if:
- You're the only developer, OR
- You've coordinated with your team
- You understand this will require everyone to re-clone the repo

## Step 6: Verify Everything Works

### Checklist:
- [ ] Old API key deleted from Google Cloud Console
- [ ] New API key created and restricted
- [ ] New key added to `frontend/.env`
- [ ] Frontend rebuilt successfully
- [ ] App deployed and working
- [ ] Security changes committed
- [ ] (Optional) Git history cleaned
- [ ] GitHub secret scanning shows no alerts (after rescan)

## Troubleshooting

### If app breaks after key rotation:
1. Check browser console for errors
2. Verify `.env` file has correct new key
3. Clear browser cache (hard refresh: Ctrl+Shift+R)
4. Rebuild: `cd frontend && npm run build`
5. Redeploy: `firebase deploy --only hosting`

### If deployment fails:
1. Check Firebase CLI is logged in: `firebase login:list`
2. Verify project: `firebase use stenographer-dev`
3. Check build output: `cd frontend && npm run build`

