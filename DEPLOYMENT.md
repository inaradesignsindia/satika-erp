# Satika ERP - Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Git
- GitHub account
- Render account
- Firebase project with credentials

## Local Development Setup

### 1. Clone and Install
```bash
git clone https://github.com/inaradesignsindia/satika-erp.git
cd satika-erp
npm install
```

### 2. Configure Environment Variables

**Copy the template file:**
```bash
cp .env.example .env.local
```

**Fill in your Firebase credentials in `.env.local`:**
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 3. Start Development Server
```bash
npm start
```
Visit http://localhost:3000

### 4. Build for Production
```bash
npm run build
```

## Deployment to Render

### Step 1: Setup Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository: `github.com/inaradesignsindia/satika-erp`
4. Configure:
   - **Name**: satika-erp
   - **Environment**: Node
   - **Region**: Singapore (or nearest to you)
   - **Branch**: main
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` (for development) or use static site

### Step 2: Add Environment Variables

1. In Render Dashboard, go to **Settings** → **Environment**
2. Add all variables from `.env.example`:
   ```
   REACT_APP_FIREBASE_API_KEY=...
   REACT_APP_FIREBASE_AUTH_DOMAIN=...
   REACT_APP_FIREBASE_PROJECT_ID=...
   REACT_APP_FIREBASE_STORAGE_BUCKET=...
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
   REACT_APP_FIREBASE_APP_ID=...
   ```

### Step 3: Deploy Hook (Automatic Deploys)

1. Go to **Settings** → **Deploy Hook**
2. Copy the Deploy Hook URL
3. Add to GitHub Secrets:
   - Go to GitHub Repo → **Settings** → **Secrets and variables** → **Actions**
   - Create new secret: `RENDER_DEPLOY_HOOK`
   - Paste the Deploy Hook URL

### Step 4: Verify Deployment

1. Check Render Dashboard for deployment status
2. Visit your deployed URL (e.g., https://satika-erp.onrender.com)
3. Verify all features work
4. Check browser console for errors

## Automated CI/CD Pipeline

### GitHub Actions Workflow

The repository includes a `.github/workflows/deploy.yml` that automatically:

1. **On every push to main:**
   - ✅ Checks out code
   - ✅ Installs dependencies
   - ✅ Builds the project
   - ✅ Verifies build output
   - ✅ Triggers Render deployment webhook

2. **On pull requests:**
   - ✅ Runs the build to catch errors early
   - ✅ Reports build status

### Workflow Steps

```
Push to GitHub
    ↓
GitHub Actions triggers
    ↓
Install dependencies (npm ci)
    ↓
Build project (npm run build)
    ↓
Verify build directory exists
    ↓
Trigger Render deployment hook
    ↓
Render builds and deploys
    ↓
App is live! 🚀
```

## Important Notes

### ⚠️ Security

- **NEVER commit `.env.local` to GitHub** (it's in `.gitignore`)
- **NEVER expose API keys in code**
- Use environment variables for all sensitive data
- Render automatically masks secrets in logs

### 🔧 Troubleshooting

#### Build fails with "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment variables not loading
1. Verify variables are set in Render Dashboard
2. Check variable names start with `REACT_APP_`
3. Redeploy after adding/changing variables
4. Check logs: `console.log(process.env.REACT_APP_FIREBASE_API_KEY)`

#### Firebase connection errors
1. Verify credentials in `.env.local` (local testing)
2. Verify credentials in Render Environment (production)
3. Check Firebase project settings
4. Ensure Firebase APIs are enabled

#### Deployment webhook not triggering
1. Verify `RENDER_DEPLOY_HOOK` secret exists in GitHub
2. Check GitHub Actions workflow logs
3. Verify webhook URL is correct
4. Re-generate webhook URL if needed

### 📊 Monitoring

**Check deployment status:**
- Render Dashboard → Events
- GitHub Actions → Workflow runs
- Render Logs → Runtime/Build logs

**Monitor errors:**
- Browser console (DevTools)
- Render runtime logs
- ErrorBoundary component catches React errors

### 📈 Performance

**Check build size:**
```bash
npm run build
ls -lh build/
```

**Optimize bundle:**
- Code splitting (lazy loading components)
- Tree shaking (remove unused imports)
- Image optimization
- Minification (automatic in production build)

## Commands Reference

```bash
# Development
npm start                 # Start dev server
npm run build            # Build for production
npm test                 # Run tests

# Checking
npm run build -- --analyze  # Analyze bundle size (if configured)

# Environment
cp .env.example .env.local   # Setup local env
```

## Project Structure

```
satika-erp/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   ├── config/          # Configuration (Firebase, etc)
│   ├── App.js          # Main app component
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── .env.example        # Environment variables template
├── .env.local          # Local environment (NOT in git)
├── package.json        # Dependencies
├── .gitignore          # Git ignore rules
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions workflow
```

## Support

If you encounter issues:

1. Check GitHub Issues
2. Review ErrorBoundary error messages
3. Check Render logs
4. Verify environment variables
5. Test locally with `npm start`

## Latest Fixes Applied

✅ Firebase config moved to environment variables
✅ Error Boundary component added
✅ GitHub Actions CI/CD workflow created
✅ Comprehensive environment setup guide
✅ Security best practices implemented
✅ Automated deployment on push to main

---

**Last Updated:** January 10, 2026
**Status:** ✅ Production Ready
