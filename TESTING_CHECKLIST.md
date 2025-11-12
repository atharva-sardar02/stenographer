# Testing Checklist - Without AWS Setup

## ✅ Features We Can Test Now (No AWS Required)

### 1. Authentication
- [ ] **Sign Up**
  - Go to https://stenographer-dev.web.app
  - Click "Sign Up"
  - Create a new account with email/password
  - Verify you're redirected to dashboard

- [ ] **Sign In**
  - Sign out
  - Sign in with the account you just created
  - Verify you're redirected to dashboard

- [ ] **Google OAuth** (if configured)
  - Try signing in with Google
  - Verify it works

### 2. Matter Management
- [ ] **Create Matter**
  - Click "Create New Matter"
  - Fill in title and client name
  - Select a status
  - Click "Create Matter"
  - Verify matter appears in the list

- [ ] **View Matter List**
  - Verify all your matters are displayed
  - Check that matters show correct status badges
  - Verify dates are displayed

- [ ] **Filter Matters**
  - Try filtering by status (Active, Draft, Completed, Archived)
  - Verify filter works correctly

- [ ] **Search Matters**
  - Type in the search box
  - Verify search filters results

- [ ] **View Matter Detail**
  - Click on a matter card
  - Verify matter detail page loads
  - Check all tabs are visible (Files, Templates, Drafts)

- [ ] **Edit Matter**
  - Click edit button on matter detail page
  - Change title or client name
  - Save changes
  - Verify changes are saved

### 3. File Upload (Storage Only)
- [ ] **Upload File**
  - Go to a matter's detail page
  - Click on "Files" tab
  - Drag and drop a PDF file (or click to upload)
  - Verify file appears in the list
  - Check file shows correct size and type

- [ ] **View File List**
  - Verify uploaded files are displayed
  - Check file cards show correct information

- [ ] **Download File**
  - Click download button on a file
  - Verify file downloads

- [ ] **Delete File**
  - Click delete button on a file
  - Confirm deletion
  - Verify file is removed from list

**Note**: OCR processing won't work yet (requires AWS), but file upload/storage will work.

### 4. Template Management
- [ ] **Create Template**
  - Go to Templates page
  - Click "Create New Template"
  - Fill in template name and description
  - Add sections (Facts, Liability, Damages, Demand)
  - Add variables if needed
  - Save template
  - Verify template appears in list

- [ ] **View Templates**
  - Verify all templates are listed
  - Check template cards display correctly

- [ ] **Edit Template**
  - Click edit on a template
  - Make changes
  - Save
  - Verify changes are saved

- [ ] **Delete Template**
  - Delete a template
  - Verify it's removed

### 5. UI/UX Testing
- [ ] **Navigation**
  - Click between Dashboard, Matters, Templates
  - Verify navigation works smoothly
  - Check back button works

- [ ] **Loading States**
  - Verify loading spinners appear when loading data
  - Check they disappear when data loads

- [ ] **Error States**
  - Try accessing a non-existent matter
  - Verify error message displays
  - Check "Try Again" button works

- [ ] **Empty States**
  - Create a new account (or use one with no data)
  - Verify empty state messages appear
  - Check "Create" buttons work

- [ ] **Responsive Design**
  - Resize browser window
  - Check layout adapts to different screen sizes
  - Test on mobile device if possible

### 6. Real-Time Features
- [ ] **Presence Indicators** (if multiple users)
  - Open same draft in two browser windows
  - Verify you see your own presence indicator

- [ ] **Change History**
  - Make edits to a draft
  - Check change history updates

## ⚠️ Features That Need AWS (Will Show Errors)

### 1. OCR Processing
- **What happens**: File uploads successfully, but OCR status will stay "pending" or show "failed"
- **Error message**: "Failed to trigger OCR" or similar
- **This is expected** - requires AWS Textract setup

### 2. Draft Generation
- **What happens**: "Generate Draft" button may not work or will show error
- **Error message**: "Failed to generate draft" or API error
- **This is expected** - requires AWS Lambda + OpenAI API key

### 3. DOCX Export
- **What happens**: Export button will show error
- **Error message**: "Failed to export" or API error
- **This is expected** - requires AWS Lambda for exports

## 🧪 Testing Steps

1. **Start Testing**
   - Open https://stenographer-dev.web.app
   - Sign up or sign in

2. **Test Core Features**
   - Create a matter
   - Upload a file (it will upload but OCR won't work)
   - Create a template
   - Navigate around the app

3. **Check for Errors**
   - Open browser console (F12)
   - Look for any JavaScript errors
   - Check Network tab for failed API calls

4. **Report Issues**
   - Note any errors or unexpected behavior
   - Screenshots are helpful

## 📝 What to Report

If you find issues, note:
- What you were trying to do
- What error message appeared (if any)
- Browser console errors
- Screenshot if possible

---

**Ready to test?** Start with authentication and matter management - those should work perfectly without AWS!

