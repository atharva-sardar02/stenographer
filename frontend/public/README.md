# Public Assets

This directory contains static assets that are served directly by the web server during development.

## Logo

To include a logo in the application headers, place your `logo.png` file in this directory:

`frontend/public/logo.png`

**Requirements:**
- File name: `logo.png` (exact name required)
- Recommended size: 40x40 pixels or larger
- Format: PNG with transparent background for best results

**Logo Display:**
The logo appears in all application headers:
- Dashboard header (64x64px on login/signup, 40x40px on other pages)
- Matter Detail page header
- Templates page header
- Draft Editor header
- Template Form header

**Graceful Degradation:**
If the logo file is not found, the application will gracefully hide the image and display only the text. This ensures the app works even without a logo file.

**Deployment Note:**
When deploying, the logo is automatically copied from `frontend/public/logo.png` to `firebase/public/logo.png` during the build process.
