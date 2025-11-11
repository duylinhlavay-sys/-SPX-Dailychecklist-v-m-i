# 🚀 Deployment Guide - Daily Checklist v2.0

## Google Apps Script Deployment Guide

Complete guide to deploy your Daily Checklist application to Google Apps Script.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Google Apps Script](#setup-google-apps-script)
3. [Upload Files](#upload-files)
4. [Configure & Deploy](#configure--deploy)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

- Google Account
- Access to [Google Apps Script](https://script.google.com)
- 4 files from this repository:
  - `Code.gs`
  - `index.html`
  - `styles.html`
  - `script.html`

---

## 🔧 Setup Google Apps Script

### Step 1: Create New Project

1. Go to [script.google.com](https://script.google.com)
2. Click **"New project"**
3. Name your project: **"Daily Checklist v2.0"**

### Step 2: Set Project Settings

1. Click on **Project Settings** (⚙️ icon)
2. Check the following options:
   - ✅ Show "appsscript.json" manifest file in editor
   - ✅ Enable Chrome V8 runtime

---

## 📁 Upload Files

### Method: Manual Upload

#### Step 1: Upload Code.gs

1. Delete default `Code.gs` content
2. Open your local `Code.gs` file
3. Copy all content
4. Paste into Apps Script editor
5. **File** → **Save** (Ctrl+S)

#### Step 2: Upload HTML Files

For each HTML file (`index.html`, `styles.html`, `script.html`):

1. Click **"+" → HTML** file
2. Name it exactly (without `.html` extension):
   - `index`
   - `styles`
   - `script`
3. Copy content from your local file
4. Paste into Apps Script editor
5. **File** → **Save** (Ctrl+S)

### Final File Structure

Your Apps Script project should have **4 files**:

```
Daily Checklist v2.0/
├── Code.gs          (Server-side code)
├── index.html       (Main HTML)
├── styles.html      (CSS styles)
└── script.html      (JavaScript code)
```

---

## 🚀 Configure & Deploy

### Step 1: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click **"Select type"** → Choose **"Web app"**
3. Fill in deployment details:

   **Description:** `Daily Checklist v2.0 - Initial Deployment`

   **Execute as:** `Me (your-email@gmail.com)`

   **Who has access:** Choose one:
   - `Only myself` - Private (only you)
   - `Anyone with Google account` - Team use
   - `Anyone` - Public access

4. Click **"Deploy"**

### Step 2: Authorize Access

1. Click **"Authorize access"**
2. Select your Google account
3. Click **"Advanced"** → **"Go to Daily Checklist (unsafe)"**
4. Click **"Allow"** (grants Drive access for backups)

### Step 3: Get Your App URL

1. Copy the **Web app URL**
   - Format: `https://script.google.com/macros/s/.../exec`
2. Save this URL - it's your app link!
3. Click **"Done"**

---

## ✅ Testing

### Test Your Deployment

1. Open your Web App URL in new tab
2. Verify features:
   - [ ] App loads successfully
   - [ ] Premium UI displays (glassmorphism)
   - [ ] Can add tasks
   - [ ] Can complete tasks (confetti animation)
   - [ ] Can delete tasks
   - [ ] Dark mode toggle works
   - [ ] Stats update in real-time
   - [ ] LocalStorage persists data after reload
   - [ ] Filter tabs work (All/Active/Completed)
   - [ ] Clear completed button works

### Test Google Drive Backup (Optional)

1. Add some tasks
2. Open browser console (F12)
3. Run: `backupToGoogleDrive()`
4. Check your Google Drive
5. Look for folder: `Daily Checklist Backups`
6. Verify JSON backup file exists

---

## 🔄 Update Deployment

When you make changes to code:

### Update Live Version

1. Edit files in Apps Script editor
2. **Deploy** → **Manage deployments**
3. Click **✏️ Edit** on active deployment
4. **Version:** New version
5. **Description:** Describe changes
6. Click **"Deploy"**
7. ✅ URL stays the same!

### Test Before Deploying

1. **Deploy** → **Test deployments**
2. Gets temporary URL for testing
3. Test thoroughly
4. Then deploy to production

---

## 🌐 Share Your App

### Share Options

**Direct Link:**
```
https://script.google.com/macros/s/.../exec
```

**QR Code:**
Generate QR code pointing to your URL

**Embed in Website:**
```html
<iframe
    src="https://script.google.com/macros/s/.../exec"
    width="100%"
    height="800px"
    frameborder="0">
</iframe>
```

---

## 🔐 Security Settings

### Private Use
- **Execute as:** `Me`
- **Who has access:** `Only myself`
- ✅ Your data only

### Team Use
- **Execute as:** `User accessing the web app`
- **Who has access:** `Anyone with Google account`
- ✅ Each user has separate data

### Public Use
- **Execute as:** `Me`
- **Who has access:** `Anyone`
- ⚠️ All users share same data

---

## 🐛 Troubleshooting

### "Authorization Required" Error

**Fix:**
1. Re-deploy the app
2. Authorize again
3. Allow all requested permissions

### "Script function not found"

**Fix:**
1. Verify `Code.gs` has `doGet()` function
2. Save all files (Ctrl+S)
3. Deploy new version

### "APP is not defined" Error

**Fix:**
1. Check file names:
   - `script.html` NOT `script.html.html`
2. Verify scriptlets in `index.html`:
   - `<?!= include('script') ?>`
   - `<?!= include('styles') ?>`
3. Clear cache, reload

### UI Broken / Not Loading

**Fix:**
1. Check all files saved
2. Verify file names (no `.html` extension in Apps Script)
3. Open browser console (F12) for errors
4. Re-deploy

### LocalStorage Not Working

**Fix:**
1. Not in Incognito mode
2. Browser allows localStorage
3. Clear site data, reload

### Google Drive Backup Fails

**Fix:**
1. Re-authorize app
2. Grant Drive permissions
3. Check **Executions** log for errors
4. Verify `saveTasksToCloud()` function exists

---

## 📊 Monitoring

### Execution Logs

1. Click **Executions** in sidebar
2. See all function calls
3. Check errors
4. View execution time
5. Monitor performance

### Project Logs

1. Apps Script editor
2. **View** → **Logs** (Ctrl+Enter)
3. See `console.log()` output
4. Debug issues

---

## 🎯 Features Summary

### ✅ Implemented Features

**Core Features:**
- Task CRUD operations
- Real-time statistics
- Filter tabs (All/Active/Completed)
- Dark mode
- Confetti celebration
- Keyboard shortcuts (Ctrl+K, Escape)
- Responsive design

**Bug Fixes (All 11):**
- XSS protection via event delegation
- Memory leak prevention (WeakMap)
- LocalStorage quota handling
- Race condition fixes (debouncing)
- Input validation (3 layers)
- Error boundaries
- Performance optimizations

**Google Apps Script Features:**
- Drive backup/restore
- Cloud sync ready
- Server-side functions
- Analytics logging (optional)

---

## 📚 Resources

- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [Web Apps Guide](https://developers.google.com/apps-script/guides/web)
- [HTML Service](https://developers.google.com/apps-script/guides/html)
- [Drive Service](https://developers.google.com/apps-script/reference/drive)

---

## 🎉 Success!

Your Daily Checklist v2.0 is now live! 🚀

**Web App URL:** `https://script.google.com/macros/s/.../exec`

**Next Steps:**
- Share URL with users
- Test all features
- Monitor logs
- Collect feedback
- Plan enhancements

---

**Made with ❤️ by SPX Express TVH | © 2025 Daily Checklist v2.0**  
**Google Apps Script Edition**
