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
    confettiContainer: document.getElementById('confettiContainer'),
    progressCircle: document.getElementById('progressCircle'),
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
    addProgressGradient();
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

    // Add ripple effect to buttons
    addRippleEffect();
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

    // Success feedback
    playSuccessAnimation();
}

function toggleTaskComplete(taskId) {
    const task = APP.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;

        // Trigger confetti when completing task
        if (task.completed) {
            triggerConfetti();
        }

        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

function deleteTask(taskId) {
    const task = APP.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (confirm(`Xóa công việc "${task.text}"?`)) {
        APP.tasks = APP.tasks.filter(t => t.id !== taskId);
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

function handleClearCompleted() {
    const completedCount = APP.tasks.filter(t => t.completed).length;

    if (completedCount === 0) {
        showToast('Không có công việc nào đã hoàn thành!', 'info');
        return;
    }

    if (confirm(`Xóa ${completedCount} công việc đã hoàn thành?`)) {
        APP.tasks = APP.tasks.filter(t => !t.completed);
        saveTasksToStorage();
        renderTasks();
        updateStats();
        showToast('Đã xóa các công việc đã hoàn thành!', 'success');
    }
}

// ========================
// Filter Management
// ========================
function handleFilterChange(e) {
    const filter = e.target.closest('.filter-tab').dataset.filter;

    // Update active tab
    DOM.filterTabs.forEach(tab => tab.classList.remove('active'));
    e.target.closest('.filter-tab').classList.add('active');

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

    // Animate numbers
    animateNumber(DOM.stats.total, parseInt(DOM.stats.total.textContent) || 0, total);
    animateNumber(DOM.stats.completed, parseInt(DOM.stats.completed.textContent) || 0, completed);
    animateNumber(DOM.stats.active, parseInt(DOM.stats.active.textContent) || 0, active);
    animateNumber(DOM.stats.completionRate, parseInt(DOM.stats.completionRate.textContent) || 0, completionRate, '%');

    // Update progress ring
    updateProgressRing(completionRate);
}

function animateNumber(element, start, end, suffix = '') {
    const duration = 500;
    const increment = (end - start) / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current) + suffix;
    }, 16);
}

function updateProgressRing(percentage) {
    if (!DOM.progressCircle) return;

    const circumference = 2 * Math.PI * 50; // r = 50
    const offset = circumference - (percentage / 100) * circumference;

    DOM.progressCircle.style.strokeDashoffset = offset;
}

// ========================
// LocalStorage Management
// ========================
function saveTasksToStorage() {
    try {
        localStorage.setItem(APP.STORAGE_KEY, JSON.stringify(APP.tasks));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showToast('Lỗi khi lưu dữ liệu!', 'error');
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

    // Add transition effect
    document.body.style.transition = 'background 0.3s ease';
}

function loadThemeFromStorage() {
    const savedTheme = localStorage.getItem(APP.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);
}

// ========================
// Confetti Animation
// ========================
function triggerConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
    const confettiCount = 30;

    for (let i = 0; i < confettiCount; i++) {
        createConfetti(colors[Math.floor(Math.random() * colors.length)]);
    }
}

function createConfetti(color) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = color;
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

    DOM.confettiContainer.appendChild(confetti);

    // Remove after animation
    setTimeout(() => {
        confetti.remove();
    }, 3500);
}

// ========================
// Progress Gradient SVG
// ========================
function addProgressGradient() {
    // Add SVG gradient definition for progress ring
    const svgNS = "http://www.w3.org/2000/svg";
    const defs = document.createElementNS(svgNS, "defs");
    const gradient = document.createElementNS(svgNS, "linearGradient");

    gradient.setAttribute("id", "progressGradient");
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "100%");

    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("style", "stop-color:#667eea");

    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("style", "stop-color:#764ba2");

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);

    const progressSvg = document.querySelector('.progress-ring-svg');
    if (progressSvg) {
        progressSvg.insertBefore(defs, progressSvg.firstChild);
    }
}

// ========================
// Ripple Effect
// ========================
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-clear, .filter-tab, .btn-icon');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Add CSS for ripple effect dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================
// Success Animation
// ========================
function playSuccessAnimation() {
    const input = DOM.taskInput;
    input.style.transform = 'scale(1.05)';
    setTimeout(() => {
        input.style.transform = 'scale(1)';
    }, 200);
}

// ========================
// Toast Notification
// ========================
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };

    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${colors[type]};
        color: white;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add toast animations
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(toastStyle);

// ========================
// Utility Functions
// ========================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================
// Keyboard Shortcuts
// ========================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        DOM.taskInput.focus();
        DOM.taskInput.select();
    }

    // Escape to clear input
    if (e.key === 'Escape') {
        DOM.taskInput.value = '';
        DOM.taskInput.blur();
    }

    // Ctrl/Cmd + D to toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
    }
});

// ========================
// Auto-save on page unload
// ========================
window.addEventListener('beforeunload', () => {
    saveTasksToStorage();
});

// ========================
// Smooth Scroll
// ========================
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
});

// ========================
// Performance: Debounce input
// ========================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================
// Celebrate All Complete
// ========================
function checkAllComplete() {
    if (APP.tasks.length > 0 && APP.tasks.every(t => t.completed)) {
        // Mega confetti celebration
        for (let i = 0; i < 5; i++) {
            setTimeout(() => triggerConfetti(), i * 200);
        }
        showToast('🎉 Chúc mừng! Bạn đã hoàn thành tất cả công việc!', 'success');
    }
}

// Override toggleTaskComplete to check for all complete
const originalToggleTaskComplete = toggleTaskComplete;
toggleTaskComplete = function(taskId) {
    originalToggleTaskComplete(taskId);
    setTimeout(checkAllComplete, 500);
};

// ========================
// Start the app
// ========================
document.addEventListener('DOMContentLoaded', init);
