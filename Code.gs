/**
 * Daily Checklist v2.0.0 - Google Apps Script Backend
 * Modern Task Management Web App with Bug Fixes
 *
 * @author SPX Express TVH
 * @version 2.0.0
 * @date 2025-11-11
 *
 * Features:
 * - 11 Critical Bug Fixes (Security, Performance, UX)
 * - Virtual Scrolling for 10,000+ tasks
 * - Cloud Sync with Firebase
 * - Offline-first with localStorage
 * - Dark Mode Support
 * - Advanced Animations
 * - Input Validation & XSS Protection
 */

/**
 * Serve the main HTML page
 * Entry point for Google Apps Script Web App
 */
function doGet(e) {
  try {
    const template = HtmlService.createTemplateFromFile('index');

    // Pass parameters if needed
    template.params = e.parameter;

    const htmlOutput = template.evaluate()
      .setTitle('Daily Checklist v2.0 - SPX Express TVH')
      .setFaviconUrl('https://img.icons8.com/fluency/48/000000/todo-list.png')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    return htmlOutput;

  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return HtmlService.createHtmlOutput(
      '<h1>Error Loading App</h1><p>' + error.toString() + '</p>'
    );
  }
}

/**
 * Include CSS and JavaScript files
 * Used by <?!= include('filename') ?> in HTML
 */
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    Logger.log('Error including file ' + filename + ': ' + error.toString());
    return '<!-- Error loading ' + filename + ' -->';
  }
}

/**
 * Server-side Functions for Cloud Sync (Optional)
 * These functions can be called from client via google.script.run
 */

/**
 * Save tasks to Google Drive (Cloud Backup)
 * @param {Array} tasks - Array of task objects
 * @return {Object} Result with success status
 */
function saveTasksToCloud(tasks) {
  try {
    const fileName = 'DailyChecklist_Backup_' + new Date().getTime() + '.json';
    const folder = getOrCreateFolder('Daily Checklist Backups');

    const fileContent = JSON.stringify({
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      tasks: tasks,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length
    }, null, 2);

    const file = folder.createFile(fileName, fileContent, MimeType.PLAIN_TEXT);

    return {
      success: true,
      fileId: file.getId(),
      fileName: fileName,
      url: file.getUrl(),
      message: 'Backup saved successfully'
    };

  } catch (error) {
    Logger.log('Error saving to cloud: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      message: 'Failed to save backup'
    };
  }
}

/**
 * Load tasks from Google Drive
 * @return {Object} Tasks data or error
 */
function loadTasksFromCloud() {
  try {
    const folder = getOrCreateFolder('Daily Checklist Backups');
    const files = folder.getFilesByType(MimeType.PLAIN_TEXT);

    // Get most recent backup
    let latestFile = null;
    let latestDate = 0;

    while (files.hasNext()) {
      const file = files.next();
      const created = file.getDateCreated().getTime();
      if (created > latestDate) {
        latestDate = created;
        latestFile = file;
      }
    }

    if (!latestFile) {
      return {
        success: false,
        message: 'No backup found',
        tasks: []
      };
    }

    const content = latestFile.getBlob().getDataAsString();
    const data = JSON.parse(content);

    return {
      success: true,
      tasks: data.tasks || [],
      timestamp: data.timestamp,
      fileName: latestFile.getName(),
      message: 'Backup loaded successfully'
    };

  } catch (error) {
    Logger.log('Error loading from cloud: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      tasks: [],
      message: 'Failed to load backup'
    };
  }
}

/**
 * Get or create folder in Google Drive
 * @param {string} folderName - Name of folder
 * @return {Folder} Google Drive folder
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

/**
 * Delete old backups (keep last 10)
 * @return {Object} Result with deleted count
 */
function cleanupOldBackups() {
  try {
    const folder = getOrCreateFolder('Daily Checklist Backups');
    const files = folder.getFiles();
    const fileArray = [];

    // Collect all files
    while (files.hasNext()) {
      fileArray.push(files.next());
    }

    // Sort by date (newest first)
    fileArray.sort((a, b) => b.getDateCreated().getTime() - a.getDateCreated().getTime());

    // Delete files beyond 10th
    let deletedCount = 0;
    for (let i = 10; i < fileArray.length; i++) {
      fileArray[i].setTrashed(true);
      deletedCount++;
    }

    return {
      success: true,
      deletedCount: deletedCount,
      remainingCount: Math.min(10, fileArray.length),
      message: 'Cleanup completed'
    };

  } catch (error) {
    Logger.log('Error cleaning up backups: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      message: 'Cleanup failed'
    };
  }
}

/**
 * Get app statistics
 * @return {Object} App stats
 */
function getAppStats() {
  try {
    const folder = getOrCreateFolder('Daily Checklist Backups');
    const files = folder.getFiles();
    let backupCount = 0;

    while (files.hasNext()) {
      files.next();
      backupCount++;
    }

    return {
      success: true,
      version: '2.0.0',
      backupCount: backupCount,
      lastUpdated: new Date().toISOString(),
      features: [
        '11 Critical Bug Fixes',
        'XSS Protection',
        'Memory Leak Prevention',
        'Virtual Scrolling',
        'Cloud Sync',
        'Dark Mode',
        'Advanced Animations'
      ]
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Export tasks as CSV
 * @param {Array} tasks - Array of task objects
 * @return {Object} CSV content
 */
function exportTasksAsCSV(tasks) {
  try {
    let csv = 'ID,Task,Completed,Priority,Created At,Completed At\n';

    tasks.forEach(task => {
      const row = [
        task.id,
        '"' + (task.text || '').replace(/"/g, '""') + '"',
        task.completed ? 'Yes' : 'No',
        task.priority || 'Normal',
        task.createdAt || '',
        task.completedAt || ''
      ].join(',');

      csv += row + '\n';
    });

    return {
      success: true,
      csv: csv,
      rowCount: tasks.length
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test function to verify deployment
 * @return {string} Test message
 */
function testDeployment() {
  return 'Daily Checklist v2.0.0 - Deployment Successful! 🎉';
}

/**
 * Get user properties (for storing user-specific settings)
 * @param {string} key - Property key
 * @return {string} Property value
 */
function getUserProperty(key) {
  try {
    const userProperties = PropertiesService.getUserProperties();
    return userProperties.getProperty(key);
  } catch (error) {
    Logger.log('Error getting user property: ' + error.toString());
    return null;
  }
}

/**
 * Set user properties
 * @param {string} key - Property key
 * @param {string} value - Property value
 * @return {boolean} Success status
 */
function setUserProperty(key, value) {
  try {
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty(key, value);
    return true;
  } catch (error) {
    Logger.log('Error setting user property: ' + error.toString());
    return false;
  }
}

/**
 * Analytics: Log user activity (optional)
 * @param {string} action - Action name
 * @param {Object} data - Additional data
 */
function logActivity(action, data) {
  try {
    const sheet = getOrCreateAnalyticsSheet();

    sheet.appendRow([
      new Date(),
      Session.getActiveUser().getEmail(),
      action,
      JSON.stringify(data || {}),
      Session.getActiveUserLocale(),
      Session.getScriptTimeZone()
    ]);

  } catch (error) {
    Logger.log('Error logging activity: ' + error.toString());
  }
}

/**
 * Get or create analytics sheet
 * @return {Sheet} Analytics sheet
 */
function getOrCreateAnalyticsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Analytics');

  if (!sheet) {
    sheet = ss.insertSheet('Analytics');
    sheet.appendRow(['Timestamp', 'User', 'Action', 'Data', 'Locale', 'Timezone']);
  }

  return sheet;
}
