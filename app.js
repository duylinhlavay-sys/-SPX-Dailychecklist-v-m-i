// ========================
// App State & Configuration
// ========================
const APP = {
    tasks: [],
    currentFilter: 'all',
    STORAGE_KEY: 'dailyChecklist_tasks',
    THEME_KEY: 'dailyChecklist_theme'
};

// ========================
// DOM Elements
// ========================
const DOM = {
    addTaskForm: document.getElementById('addTaskForm'),
    taskInput: document.getElementById('taskInput'),
    tasksList: document.getElementById('tasksList'),
    emptyState: document.getElementById('emptyState'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    clearCompletedBtn: document.getElementById('clearCompleted'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    stats: {
        total: document.getElementById('totalTasks'),
        completed: document.getElementById('completedTasks'),
        active: document.getElementById('activeTasks'),
        completionRate: document.getElementById('completionRate')
    }
};

// ========================
// Initialization
// ========================
function init() {
    loadTasksFromStorage();
    loadThemeFromStorage();
    setupEventListeners();
    renderTasks();
    updateStats();
}

// ========================
// Event Listeners
// ========================
function setupEventListeners() {
    // Add task form
    DOM.addTaskForm.addEventListener('submit', handleAddTask);

    // Filter tabs
    DOM.filterTabs.forEach(tab => {
        tab.addEventListener('click', handleFilterChange);
    });

    // Clear completed button
    DOM.clearCompletedBtn.addEventListener('click', handleClearCompleted);

    // Dark mode toggle
    DOM.darkModeToggle.addEventListener('click', toggleDarkMode);
}

// ========================
// Task Management
// ========================
function handleAddTask(e) {
    e.preventDefault();

    const taskText = DOM.taskInput.value.trim();

    if (!taskText) return;

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    APP.tasks.unshift(newTask);
    saveTasksToStorage();
    renderTasks();
    updateStats();

    DOM.taskInput.value = '';
    DOM.taskInput.focus();

    showNotification('✓ Đã thêm công việc mới!');
}

function toggleTaskComplete(taskId) {
    const task = APP.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

function deleteTask(taskId) {
    if (confirm('Bạn có chắc muốn xóa công việc này?')) {
        APP.tasks = APP.tasks.filter(t => t.id !== taskId);
        saveTasksToStorage();
        renderTasks();
        updateStats();
        showNotification('🗑️ Đã xóa công việc!');
    }
}

function handleClearCompleted() {
    const completedCount = APP.tasks.filter(t => t.completed).length;

    if (completedCount === 0) {
        showNotification('⚠️ Không có công việc nào đã hoàn thành!');
        return;
    }

    if (confirm(`Xóa ${completedCount} công việc đã hoàn thành?`)) {
        APP.tasks = APP.tasks.filter(t => !t.completed);
        saveTasksToStorage();
        renderTasks();
        updateStats();
        showNotification('✓ Đã xóa các công việc đã hoàn thành!');
    }
}

// ========================
// Filter Management
// ========================
function handleFilterChange(e) {
    const filter = e.target.dataset.filter;

    // Update active tab
    DOM.filterTabs.forEach(tab => tab.classList.remove('active'));
    e.target.classList.add('active');

    APP.currentFilter = filter;
    renderTasks();
}

function getFilteredTasks() {
    switch (APP.currentFilter) {
        case 'active':
            return APP.tasks.filter(t => !t.completed);
        case 'completed':
            return APP.tasks.filter(t => t.completed);
        default:
            return APP.tasks;
    }
}

// ========================
// Rendering
// ========================
function renderTasks() {
    const filteredTasks = getFilteredTasks();

    // Show/hide empty state
    if (filteredTasks.length === 0) {
        DOM.tasksList.innerHTML = '';
        DOM.emptyState.classList.add('show');
        return;
    }

    DOM.emptyState.classList.remove('show');

    DOM.tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input
                type="checkbox"
                class="task-checkbox"
                ${task.completed ? 'checked' : ''}
                onchange="toggleTaskComplete(${task.id})"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <div class="task-actions">
                <button class="btn-delete" onclick="deleteTask(${task.id})">
                    Xóa
                </button>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const total = APP.tasks.length;
    const completed = APP.tasks.filter(t => t.completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    DOM.stats.total.textContent = total;
    DOM.stats.completed.textContent = completed;
    DOM.stats.active.textContent = active;
    DOM.stats.completionRate.textContent = `${completionRate}%`;
}

// ========================
// LocalStorage Management
// ========================
function saveTasksToStorage() {
    try {
        localStorage.setItem(APP.STORAGE_KEY, JSON.stringify(APP.tasks));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showNotification('⚠️ Lỗi khi lưu dữ liệu!');
    }
}

function loadTasksFromStorage() {
    try {
        const stored = localStorage.getItem(APP.STORAGE_KEY);
        if (stored) {
            APP.tasks = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        APP.tasks = [];
    }
}

// ========================
// Theme Management
// ========================
function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(APP.THEME_KEY, newTheme);

    // Update icon
    const icon = DOM.darkModeToggle.querySelector('.theme-icon');
    icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function loadThemeFromStorage() {
    const savedTheme = localStorage.getItem(APP.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);

    // Update icon
    const icon = DOM.darkModeToggle.querySelector('.theme-icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ========================
// Utility Functions
// ========================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message) {
    // Simple console notification (can be enhanced with toast notifications)
    console.log(message);

    // You can add a toast notification library here for better UX
    // For now, we'll use a simple alert for important messages
}

// ========================
// Keyboard Shortcuts
// ========================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        DOM.taskInput.focus();
    }

    // Escape to clear input
    if (e.key === 'Escape') {
        DOM.taskInput.value = '';
        DOM.taskInput.blur();
    }
});

// ========================
// Auto-save on page unload
// ========================
window.addEventListener('beforeunload', () => {
    saveTasksToStorage();
});

// ========================
// Start the app
// ========================
document.addEventListener('DOMContentLoaded', init);
