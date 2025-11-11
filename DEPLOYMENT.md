# 🚀 Deployment Guide - Daily Checklist v2.0

Complete guide to deploy your Daily Checklist application to production.

---

## 📋 Table of Contents

1. [GitHub Pages](#github-pages)
2. [Netlify](#netlify)
3. [Vercel](#vercel)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)

---

## 🌐 GitHub Pages

### Prerequisites
- GitHub account
- Repository with main/master branch

### Deployment Steps

1. **Enable GitHub Pages**:
   ```bash
   # Go to repository settings
   Settings → Pages → Source → GitHub Actions
   ```

2. **Push to Main Branch**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Check Deployment Status**:
   - Go to `Actions` tab in your repository
   - Monitor the "Deploy to GitHub Pages" workflow
   - Once completed, your site will be live at:
     ```
     https://[username].github.io/[repository-name]
     ```

### Automatic Deployment
- Every push to `main` or `master` branch triggers auto-deployment
- GitHub Actions workflow: `.github/workflows/deploy.yml`

### Custom Domain (Optional)
1. Add `CNAME` file with your domain:
   ```bash
   echo "yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153

   Type: CNAME
   Name: www
   Value: [username].github.io
   ```

---

## 🔷 Netlify

### Method 1: Drag & Drop (Fastest)

1. Go to [Netlify](https://netlify.com)
2. Sign in / Sign up
3. Drag your project folder to Netlify Drop zone
4. Done! Your site is live 🎉

### Method 2: Git Integration (Recommended)

1. **Connect Repository**:
   - Click "New site from Git"
   - Connect to GitHub
   - Select your repository

2. **Build Settings**:
   ```
   Build command: (leave empty)
   Publish directory: .
   ```

3. **Deploy**:
   - Click "Deploy site"
   - Wait 1-2 minutes
   - Site URL: `https://[random-name].netlify.app`

### Configuration
- All settings are in `netlify.toml`
- Includes:
  - Security headers
  - Caching rules
  - Lighthouse performance checks
  - HTML minification

### Custom Domain
1. Go to `Domain settings`
2. Add custom domain
3. Follow DNS configuration instructions

### Environment Variables (If Needed)
```bash
# In Netlify Dashboard
Site settings → Build & deploy → Environment
```

---

## ▲ Vercel

### Method 1: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Production**:
   ```bash
   vercel --prod
   ```

### Method 2: Git Integration

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: (leave empty)
   Output Directory: (leave empty)
   ```
5. Click "Deploy"

### Configuration
- Settings in `vercel.json`
- Includes security headers and caching

### Custom Domain
1. Project Settings → Domains
2. Add your domain
3. Configure DNS as instructed

---

## ⚙️ CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Deploy Workflow
**File**: `.github/workflows/deploy.yml`

**Triggers**:
- Push to main/master
- Manual trigger (workflow_dispatch)

**Steps**:
1. Checkout code
2. Validate files
3. Build (if needed)
4. Upload to GitHub Pages
5. Deploy

#### 2. CI Workflow
**File**: `.github/workflows/ci.yml`

**Triggers**:
- Push to any branch
- Pull requests to main/master

**Quality Checks**:
- ✅ HTML validation
- ✅ JavaScript syntax check
- ✅ File size analysis
- ✅ Security check (XSS patterns)
- ✅ Bug fixes verification
- ✅ Console.log detection

**Example Output**:
```
✅ HTML5 DOCTYPE found
✅ JavaScript syntax valid
✅ Bundle size acceptable (70KB)
✅ No inline event handlers found
✅ Bug #1: Memory leak fix verified
✅ Bug #2: Event delegation verified
✅ Bug #4: Quota handler verified
✅ Bug #7: Confetti limit verified
✅ Bug #11: Error boundary verified
```

### Status Badges

Add to README.md:
```markdown
![Deploy](https://github.com/[username]/[repo]/actions/workflows/deploy.yml/badge.svg)
![CI](https://github.com/[username]/[repo]/actions/workflows/ci.yml/badge.svg)
```

---

## 🔐 Environment Variables

Currently, the app doesn't require environment variables as it's a pure static site with localStorage.

### Future API Keys (If Adding Backend)

#### GitHub Secrets
```bash
Settings → Secrets and variables → Actions → New repository secret
```

#### Netlify
```bash
Site settings → Build & deploy → Environment
```

#### Vercel
```bash
Project Settings → Environment Variables
```

---

## ✅ Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Site loads correctly
- [ ] All features work (add, delete, complete tasks)
- [ ] Dark mode toggle works
- [ ] LocalStorage persistence works
- [ ] Responsive design on mobile
- [ ] No console errors

### 2. Performance Testing
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] Total Blocking Time < 200ms

Run Lighthouse:
```bash
# Chrome DevTools
F12 → Lighthouse → Run
```

### 3. Security Testing
- [ ] XSS protection verified
- [ ] Security headers present
- [ ] HTTPS enabled
- [ ] CSP configured (if applicable)

Check headers:
```bash
curl -I https://your-domain.com
```

### 4. Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

### 5. Accessibility Testing
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient

Test with:
```bash
# Chrome DevTools
F12 → Lighthouse → Accessibility
```

---

## 🔧 Troubleshooting

### GitHub Pages 404
**Issue**: Site shows 404 after deployment

**Solutions**:
1. Check `Settings → Pages → Source` is set to "GitHub Actions"
2. Verify workflow ran successfully in Actions tab
3. Wait 5-10 minutes for DNS propagation

### Netlify Build Fails
**Issue**: Build fails with error

**Solutions**:
1. Check `netlify.toml` syntax
2. Verify publish directory is "."
3. Check build logs in Netlify dashboard

### Vercel Deploy Timeout
**Issue**: Deployment times out

**Solutions**:
1. Check `vercel.json` syntax
2. Ensure file sizes are reasonable
3. Try CLI: `vercel --prod --force`

### localStorage Not Working
**Issue**: Data doesn't persist

**Solutions**:
1. Check browser's private/incognito mode (localStorage disabled)
2. Verify HTTPS is enabled
3. Check browser storage quota

---

## 📊 Monitoring

### Uptime Monitoring
Use services like:
- [UptimeRobot](https://uptimerobot.com) (Free)
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

### Analytics (Optional)
Add to `index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Error Tracking (Optional)
Consider adding:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay

---

## 🚀 Quick Deploy Commands

### GitHub Pages
```bash
git add .
git commit -m "Deploy v2.0"
git push origin main
```

### Netlify
```bash
# Via CLI
netlify deploy --prod

# Or drag & drop to netlify.app
```

### Vercel
```bash
# Via CLI
vercel --prod

# Or push to main branch (auto-deploy)
```

---

## 📚 Additional Resources

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Netlify Docs](https://docs.netlify.com)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

## 🎉 Success!

Your Daily Checklist v2.0 is now live in production! 🚀

**Next Steps**:
- Share your URL with users
- Monitor performance metrics
- Gather user feedback
- Plan next features

---

**Made with ❤️ by SPX | © 2025 Daily Checklist**
