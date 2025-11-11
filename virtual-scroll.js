// Virtual Scrolling Implementation for 10,000+ Tasks
// Daily Checklist v2.0 - Performance Optimization

class VirtualScroller {
    constructor(options) {
        this.container = options.container;
        this.itemHeight = options.itemHeight || 80; // Default task height
        this.renderItem = options.renderItem;
        this.items = [];
        this.visibleItems = [];
        this.scrollTop = 0;
        this.containerHeight = 0;
        this.totalHeight = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        this.buffer = options.buffer || 5; // Render 5 extra items above/below

        this.init();
    }

    init() {
        // Create viewport and content container
        this.viewport = document.createElement('div');
        this.viewport.style.cssText = `
            height: 100%;
            overflow-y: auto;
            position: relative;
        `;

        this.content = document.createElement('div');
        this.content.style.cssText = `
            position: relative;
            width: 100%;
        `;

        this.viewport.appendChild(this.content);
        this.container.appendChild(this.viewport);

        // Event listeners
        this.viewport.addEventListener('scroll', () => this.onScroll());
        window.addEventListener('resize', () => this.onResize());

        this.updateDimensions();
    }

    setItems(items) {
        this.items = items;
        this.totalHeight = this.items.length * this.itemHeight;
        this.content.style.height = `${this.totalHeight}px`;
        this.render();
    }

    updateDimensions() {
        this.containerHeight = this.viewport.clientHeight;
        this.visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
        this.render();
    }

    onScroll() {
        this.scrollTop = this.viewport.scrollTop;
        this.render();
    }

    onResize() {
        this.updateDimensions();
    }

    render() {
        // Calculate visible range
        this.startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.buffer);
        this.endIndex = Math.min(
            this.items.length,
            Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight) + this.buffer
        );

        // Get visible items
        this.visibleItems = this.items.slice(this.startIndex, this.endIndex);

        // Clear content
        this.content.innerHTML = '';

        // Create offset div
        const offsetTop = this.startIndex * this.itemHeight;
        const offsetDiv = document.createElement('div');
        offsetDiv.style.height = `${offsetTop}px`;
        this.content.appendChild(offsetDiv);

        // Render visible items
        this.visibleItems.forEach((item, index) => {
            const actualIndex = this.startIndex + index;
            const element = this.renderItem(item, actualIndex);
            element.style.height = `${this.itemHeight}px`;
            this.content.appendChild(element);
        });

        // Create bottom spacer
        const bottomSpace = (this.items.length - this.endIndex) * this.itemHeight;
        if (bottomSpace > 0) {
            const bottomDiv = document.createElement('div');
            bottomDiv.style.height = `${bottomSpace}px`;
            this.content.appendChild(bottomDiv);
        }
    }

    scrollToIndex(index) {
        const scrollPosition = index * this.itemHeight;
        this.viewport.scrollTop = scrollPosition;
    }

    scrollToTop() {
        this.viewport.scrollTop = 0;
    }

    destroy() {
        this.viewport.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onResize);
        this.container.innerHTML = '';
    }

    // Get currently visible item indices
    getVisibleRange() {
        return {
            start: this.startIndex,
            end: this.endIndex,
            count: this.endIndex - this.startIndex
        };
    }

    // Update item height dynamically
    setItemHeight(height) {
        this.itemHeight = height;
        this.totalHeight = this.items.length * this.itemHeight;
        this.content.style.height = `${this.totalHeight}px`;
        this.render();
    }
}

// Enhanced renderTasks with Virtual Scrolling
// Add this to app.js to enable virtual scrolling

let virtualScroller = null;
const ENABLE_VIRTUAL_SCROLL = true; // Toggle feature
const VIRTUAL_SCROLL_THRESHOLD = 100; // Enable when > 100 tasks

function renderTasksWithVirtualScroll() {
    const filteredTasks = getFilteredTasks();

    // Show/hide empty state
    if (filteredTasks.length === 0) {
        DOM.tasksList.innerHTML = '';
        DOM.emptyState.classList.add('show');
        if (virtualScroller) {
            virtualScroller.destroy();
            virtualScroller = null;
        }
        return;
    }

    DOM.emptyState.classList.remove('show');

    // Use virtual scrolling for large lists
    if (ENABLE_VIRTUAL_SCROLL && filteredTasks.length > VIRTUAL_SCROLL_THRESHOLD) {
        if (!virtualScroller) {
            // Initialize virtual scroller
            DOM.tasksList.innerHTML = '';
            virtualScroller = new VirtualScroller({
                container: DOM.tasksList,
                itemHeight: 80, // Adjust based on your task item height
                buffer: 5,
                renderItem: (task, index) => {
                    const div = document.createElement('div');
                    div.className = `task-item ${task.completed ? 'completed' : ''}`;
                    div.dataset.id = task.id;
                    div.innerHTML = `
                        <input
                            type="checkbox"
                            class="task-checkbox"
                            ${task.completed ? 'checked' : ''}
                            aria-label="Mark task '${escapeHtml(task.text)}' as ${task.completed ? 'incomplete' : 'complete'}"
                        >
                        <span class="task-text">${escapeHtml(task.text)}</span>
                        <div class="task-actions">
                            <button class="btn-delete" data-action="delete" aria-label="Delete task '${escapeHtml(task.text)}'">
                                Xóa
                            </button>
                        </div>
                    `;
                    return div;
                }
            });
        }

        virtualScroller.setItems(filteredTasks);
        console.log(`✅ Virtual scrolling enabled (${filteredTasks.length} tasks)`);
    } else {
        // Standard rendering for small lists
        if (virtualScroller) {
            virtualScroller.destroy();
            virtualScroller = null;
        }

        DOM.tasksList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                    aria-label="Mark task '${escapeHtml(task.text)}' as ${task.completed ? 'incomplete' : 'complete'}"
                >
                <span class="task-text">${escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="btn-delete" data-action="delete" aria-label="Delete task '${escapeHtml(task.text)}'">
                        Xóa
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VirtualScroller, renderTasksWithVirtualScroll };
}
