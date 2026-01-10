# Setup & Configuration Instructions for Satika ERP

## 🚀 Quick Start (5 minutes)

### For Local Development

**Step 1: Clone and Install**
```bash
git clone https://github.com/inaradesignsindia/satika-erp.git
cd satika-erp
npm install
```

**Step 2: Setup Environment**
```bash
cp .env.example .env.local
```

**Step 3: Add Firebase Credentials**

Open `.env.local` and fill in your Firebase credentials:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyCTrenpSXNMR78_5r3zXAmD5aXO7jFxxD4
REACT_APP_FIREBASE_AUTH_DOMAIN=satika-cc4c3.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=satika-cc4c3
REACT_APP_FIREBASE_STORAGE_BUCKET=satika-cc4c3.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=370343505568
REACT_APP_FIREBASE_APP_ID=1:370343505568:web:551fa56872706a0a8463c5
```

**Step 4: Start Development**
```bash
npm start
```

Visit: http://localhost:3000

---

## 🌟 Production Deployment Setup

### For Render Hosting (Recommended)

#### Part A: Prepare GitHub

**1. Merge the fix branch**
```bash
# In GitHub web interface or locally:
git checkout main
git pull origin main
git merge fix/deployment-critical-issues
git push origin main
```

**2. Add GitHub Secret for Render Deploy Hook**

- Go to: GitHub Repo → **Settings** → **Secrets and variables** → **Actions**
- Click: **New repository secret**
- Name: `RENDER_DEPLOY_HOOK`
- Value: `https://api.render.com/deploy/srv-d4l2km7pm1nc738ivab0?key=Z008nykCRJw`
- Click: **Add secret**

#### Part B: Configure Render

**1. Connect GitHub Repository**

In Render Dashboard:
- Click: **New +** → **Web Service**
- Select: **GitHub** account
- Search: `satika-erp`
- Click: **Connect**

**2. Configure Build Settings**

| Setting | Value |
|---------|-------|
| Name | satika-erp |
| Environment | Node |
| Region | Singapore (closest to India) |
| Branch | main |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

**3. Add Environment Variables**

In Render Service → **Settings** → **Environment**

Add these 6 variables (get from your Firebase console):

```
REACT_APP_FIREBASE_API_KEY = AIzaSyCTrenpSXNMR78_5r3zXAmD5aXO7jFxxD4
REACT_APP_FIREBASE_AUTH_DOMAIN = satika-cc4c3.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID = satika-cc4c3
REACT_APP_FIREBASE_STORAGE_BUCKET = satika-cc4c3.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 370343505568
REACT_APP_FIREBASE_APP_ID = 1:370343505568:web:551fa56872706a0a8463c5
```

#### Part C: Test Deployment

**1. Manual Deploy (First Time)**

- In Render Dashboard, click: **Manual Deploy** → **Deploy latest commit**
- Wait for build to complete (3-5 minutes)
- Check status: Shows ✅ **Live** when done

**2. Test the App**

- Visit: https://satika-erp.onrender.com
- Verify all pages load correctly
- Check browser console for errors
- Test Firebase integration

**3. Automatic Deploys**

Now every push to `main` will:
- Trigger GitHub Actions workflow
- Build the app
- Automatically deploy to Render

---

## 🔐 Security Checklist

### ✅ Environment Variables
- [ ] `.env.local` is in `.gitignore` (✅ already configured)
- [ ] Firebase credentials in Render environment (not in code)
- [ ] Never commit `.env.local` to GitHub
- [ ] Render secrets are masked in logs

### ✅ GitHub Secrets
- [ ] `RENDER_DEPLOY_HOOK` is set and working
- [ ] Deploy hook URL is kept private
- [ ] Only used in GitHub Actions workflow

### ✅ Firebase Security
- [ ] Enable Firebase Authentication
- [ ] Set up Firestore Security Rules
- [ ] Restrict Storage bucket access
- [ ] Use service accounts for backend

---

## 👋 Need to Do From Your End

### ❌ CRITICAL - You MUST Do These:

**1. Get Your Firebase Credentials**
```
Go to: Firebase Console > Project Settings
Copy these 6 values:
- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID
```

**2. Add Render Deploy Hook Secret to GitHub**
```
GitHub Settings > Secrets and variables > Actions
Create secret: RENDER_DEPLOY_HOOK
Value: https://api.render.com/deploy/srv-d4l2km7pm1nc738ivab0?key=Z008nykCRJw
```

**3. Add Environment Variables to Render**
```
Render Dashboard > satika-erp > Settings > Environment
Add all 6 Firebase variables
```

**4. Merge Fix Branch to Main**
```bash
# Option A: Using GitHub Web
1. Go to: https://github.com/inaradesignsindia/satika-erp/pulls
2. Click the PR for 'fix/deployment-critical-issues'
3. Click 'Merge pull request'
4. Confirm merge

# Option B: Using Git CLI
git fetch origin
git checkout main
git pull origin main
git merge origin/fix/deployment-critical-issues
git push origin main
```

**5. Trigger First Deployment**
```
In Render Dashboard:
1. Go to satika-erp service
2. Click 'Manual Deploy'
3. Click 'Deploy latest commit'
4. Wait 5-10 minutes for build
5. Visit your URL once Live status appears
```

---

## 🔍 Verification Steps

After deployment, verify everything works:

### Local Testing (Before pushing)
```bash
npm install
npm start
# Visit http://localhost:3000
# Test all features
# Check browser console for errors
```

### Render Deployment Verification
```
1. ✅ Check Render Dashboard → Events (shows deployment history)
2. ✅ Visit live URL
3. ✅ Test login/authentication
4. ✅ Test database operations
5. ✅ Check no errors in Render logs
```

### GitHub Actions Verification
```
1. Go to GitHub Repo → Actions
2. Should see recent workflow runs
3. Check status (should be ✅ Success)
4. Click workflow to see build logs
```

---

## 🚠 Automatic Workflow (After Setup)

Once configured, this is how it works automatically:

```
1. You push code to main branch
        ↓
2. GitHub Actions workflow triggers automatically
        ↓
3. Workflow:
   - Installs dependencies
   - Builds the project
   - Tests build output
   - Triggers Render deploy hook
        ↓
4. Render receives webhook
        ↓
5. Render:
   - Pulls latest code
   - Installs dependencies
   - Runs build command
   - Deploys to production
        ↓
6. App is live! 🚀

Total time: 5-10 minutes
```

---

## 🛑 Troubleshooting

### Problem: Build fails on Render
**Solution:**
```bash
# Verify locally first
npm install
npm run build

# If it works locally but fails on Render:
1. Check Render logs (Environment tab)
2. Verify all env variables are set
3. Check for any missing dependencies
4. Clear Render cache and redeploy
```

### Problem: App loads but Firebase doesn't work
**Solution:**
```
1. Check Render Environment has all 6 Firebase variables
2. Verify variable names start with REACT_APP_
3. Verify values are correct (copy-paste from Firebase)
4. Redeploy after updating variables
5. Check browser console for auth errors
```

### Problem: GitHub Actions not triggering deploy
**Solution:**
```
1. Check RENDER_DEPLOY_HOOK secret exists in GitHub
2. Verify secret value is correct
3. Check .github/workflows/deploy.yml is in main branch
4. Manual trigger: Go to Actions > deploy > Run workflow
```

### Problem: Render shows status check failed
**Solution:**
```
1. Check Render logs for error messages
2. Verify build command succeeded
3. Verify environment variables are loaded
4. Check Firebase connectivity
5. Try manual redeploy
```

---

## 📊 Command Reference

```bash
# Local development
npm start              # Start dev server (localhost:3000)
npm run build         # Create production build
npm test              # Run tests

# Environment setup
cp .env.example .env.local    # Create local env file

# Git operations
git push origin main           # Push changes to GitHub
git pull origin main           # Get latest changes
```

---

## ❓ Questions?

Check these resources:
1. **DEPLOYMENT.md** - Detailed deployment guide
2. **Render Docs** - https://render.com/docs
3. **GitHub Actions** - https://docs.github.com/en/actions
4. **Firebase Docs** - https://firebase.google.com/docs

---

## ✅ Summary

**What was fixed:**
- ✅ Environment variables configuration
- ✅ Firebase config moved to env vars
- ✅ Error Boundary component added
- ✅ GitHub Actions workflow created
- ✅ Comprehensive deployment guide written

**What you need to do:**
1. Get Firebase credentials
2. Add GitHub Secret (RENDER_DEPLOY_HOOK)
3. Add Env variables to Render
4. Merge fix branch to main
5. Trigger first deployment

**Status after this:** 🚀 **Production ready with CI/CD!**

---

**Last Updated:** January 10, 2026
**Maintained by:** AI Development Assistant
