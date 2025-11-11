// Firebase Cloud Sync Configuration
// Daily Checklist v2.0 - Cloud Sync Feature

// Firebase Configuration (Replace with your own values)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};

// Firebase Setup Instructions
// 1. Go to https://console.firebase.google.com
// 2. Create new project or select existing
// 3. Add web app
// 4. Copy config values above
// 5. Enable Firestore/Realtime Database
// 6. Set up Authentication (Email, Google, etc)

class CloudSync {
    constructor() {
        this.db = null;
        this.auth = null;
        this.user = null;
        this.syncEnabled = false;
        this.lastSyncTime = null;
        this.syncInterval = null;
    }

    // Initialize Firebase
    async init() {
        try {
            // Check if Firebase is loaded
            if (typeof firebase === 'undefined') {
                console.warn('Firebase SDK not loaded. Cloud sync disabled.');
                return false;
            }

            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            this.db = firebase.firestore();
            this.auth = firebase.auth();

            // Listen for auth state changes
            this.auth.onAuthStateChanged((user) => {
                this.user = user;
                if (user) {
                    console.log('✅ User signed in:', user.email);
                    this.startAutoSync();
                } else {
                    console.log('❌ User signed out');
                    this.stopAutoSync();
                }
            });

            this.syncEnabled = true;
            return true;
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            return false;
        }
    }

    // Sign in with email/password
    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.user = userCredential.user;
            console.log('✅ Sign in successful');
            return { success: true, user: this.user };
        } catch (error) {
            console.error('Sign in failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign up with email/password
    async signUp(email, password) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            this.user = userCredential.user;
            console.log('✅ Sign up successful');
            return { success: true, user: this.user };
        } catch (error) {
            console.error('Sign up failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign out
    async signOut() {
        try {
            await this.auth.signOut();
            this.user = null;
            console.log('✅ Sign out successful');
            return { success: true };
        } catch (error) {
            console.error('Sign out failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Upload tasks to cloud
    async uploadTasks(tasks) {
        if (!this.syncEnabled || !this.user) {
            console.warn('Cloud sync not available');
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const userDoc = this.db.collection('users').doc(this.user.uid);
            await userDoc.set({
                tasks: tasks,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                version: '2.0.0'
            }, { merge: true });

            this.lastSyncTime = new Date();
            console.log('✅ Tasks synced to cloud');
            return { success: true };
        } catch (error) {
            console.error('Upload failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Download tasks from cloud
    async downloadTasks() {
        if (!this.syncEnabled || !this.user) {
            console.warn('Cloud sync not available');
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const userDoc = await this.db.collection('users').doc(this.user.uid).get();

            if (userDoc.exists) {
                const data = userDoc.data();
                console.log('✅ Tasks downloaded from cloud');
                return { success: true, tasks: data.tasks || [], lastUpdated: data.lastUpdated };
            } else {
                return { success: true, tasks: [] };
            }
        } catch (error) {
            console.error('Download failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Sync tasks (merge local and cloud)
    async syncTasks(localTasks) {
        if (!this.syncEnabled || !this.user) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            // Download cloud tasks
            const cloudData = await this.downloadTasks();
            if (!cloudData.success) {
                return cloudData;
            }

            const cloudTasks = cloudData.tasks;

            // Merge strategy: Keep most recent tasks
            const merged = this.mergeTasks(localTasks, cloudTasks);

            // Upload merged tasks
            await this.uploadTasks(merged);

            console.log('✅ Tasks synced successfully');
            return { success: true, tasks: merged };
        } catch (error) {
            console.error('Sync failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Merge local and cloud tasks
    mergeTasks(localTasks, cloudTasks) {
        const taskMap = new Map();

        // Add cloud tasks first
        cloudTasks.forEach(task => {
            taskMap.set(task.id, task);
        });

        // Overlay local tasks (local takes priority for conflicts)
        localTasks.forEach(task => {
            const existing = taskMap.get(task.id);
            if (!existing || new Date(task.createdAt) > new Date(existing.createdAt)) {
                taskMap.set(task.id, task);
            }
        });

        return Array.from(taskMap.values());
    }

    // Start auto-sync (every 5 minutes)
    startAutoSync() {
        this.stopAutoSync(); // Clear existing interval

        this.syncInterval = setInterval(() => {
            const localTasks = APP.tasks; // Reference to global tasks
            this.syncTasks(localTasks)
                .then(result => {
                    if (result.success) {
                        console.log('🔄 Auto-sync completed');
                    }
                })
                .catch(error => {
                    console.error('Auto-sync failed:', error);
                });
        }, 5 * 60 * 1000); // 5 minutes

        console.log('✅ Auto-sync enabled (every 5 minutes)');
    }

    // Stop auto-sync
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('⏸️ Auto-sync disabled');
        }
    }

    // Listen to real-time updates
    listenToChanges(callback) {
        if (!this.syncEnabled || !this.user) return;

        const userDoc = this.db.collection('users').doc(this.user.uid);
        return userDoc.onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                callback(data.tasks || []);
            }
        });
    }

    // Get sync status
    getSyncStatus() {
        return {
            enabled: this.syncEnabled,
            authenticated: !!this.user,
            lastSyncTime: this.lastSyncTime,
            userEmail: this.user?.email
        };
    }
}

// Initialize cloud sync
const cloudSync = new CloudSync();

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CloudSync, cloudSync };
}

// Usage example:
/*
// Initialize
await cloudSync.init();

// Sign in
await cloudSync.signIn('user@example.com', 'password');

// Upload tasks
await cloudSync.uploadTasks(APP.tasks);

// Download tasks
const result = await cloudSync.downloadTasks();
if (result.success) {
    APP.tasks = result.tasks;
    renderTasks();
}

// Full sync
const syncResult = await cloudSync.syncTasks(APP.tasks);
if (syncResult.success) {
    APP.tasks = syncResult.tasks;
    renderTasks();
}

// Sign out
await cloudSync.signOut();
*/
