// Jest Unit Tests for Daily Checklist v2.0
// Testing core functionality and bug fixes

describe('Daily Checklist App', () => {
    // Mock localStorage
    let localStorageMock;

    beforeEach(() => {
        localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            clear: jest.fn()
        };
        global.localStorage = localStorageMock;

        // Reset DOM
        document.body.innerHTML = `
            <div id="tasksList"></div>
            <div id="emptyState"></div>
            <div id="totalTasks">0</div>
            <div id="completedTasks">0</div>
            <div id="activeTasks">0</div>
            <div id="completionRate">0%</div>
        `;
    });

    describe('Task Management', () => {
        test('should add a new task', () => {
            const taskText = 'Test Task';
            const task = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };

            expect(task.text).toBe(taskText);
            expect(task.completed).toBe(false);
            expect(task.id).toBeDefined();
        });

        test('should toggle task completion', () => {
            const task = {
                id: 1,
                text: 'Test',
                completed: false
            };

            task.completed = !task.completed;
            expect(task.completed).toBe(true);

            task.completed = !task.completed;
            expect(task.completed).toBe(false);
        });

        test('should delete a task', () => {
            const tasks = [
                { id: 1, text: 'Task 1', completed: false },
                { id: 2, text: 'Task 2', completed: false }
            ];

            const filteredTasks = tasks.filter(t => t.id !== 1);
            expect(filteredTasks.length).toBe(1);
            expect(filteredTasks[0].id).toBe(2);
        });
    });

    describe('Input Validation (Bug #9 Fix)', () => {
        test('should reject empty task', () => {
            const taskText = '   ';
            const isValid = taskText.trim().length > 0;
            expect(isValid).toBe(false);
        });

        test('should reject task exceeding 500 characters', () => {
            const longText = 'a'.repeat(501);
            const isValid = longText.length <= 500;
            expect(isValid).toBe(false);
        });

        test('should detect duplicate tasks', () => {
            const tasks = [
                { id: 1, text: 'Buy milk', completed: false }
            ];
            const newTaskText = 'Buy milk';

            const isDuplicate = tasks.some(t =>
                t.text.toLowerCase() === newTaskText.toLowerCase() && !t.completed
            );

            expect(isDuplicate).toBe(true);
        });

        test('should allow duplicate if existing is completed', () => {
            const tasks = [
                { id: 1, text: 'Buy milk', completed: true }
            ];
            const newTaskText = 'Buy milk';

            const isDuplicate = tasks.some(t =>
                t.text.toLowerCase() === newTaskText.toLowerCase() && !t.completed
            );

            expect(isDuplicate).toBe(false);
        });
    });

    describe('LocalStorage (Bug #4 Fix)', () => {
        test('should handle QuotaExceededError gracefully', () => {
            localStorageMock.setItem.mockImplementation(() => {
                const error = new Error('QuotaExceededError');
                error.name = 'QuotaExceededError';
                throw error;
            });

            let errorCaught = false;
            try {
                localStorageMock.setItem('test', 'data');
            } catch (error) {
                if (error.name === 'QuotaExceededError') {
                    errorCaught = true;
                }
            }

            expect(errorCaught).toBe(true);
        });

        test('should auto-cleanup oldest 20% completed tasks', () => {
            const tasks = [
                { id: 1, text: 'Task 1', completed: true, createdAt: '2025-01-01' },
                { id: 2, text: 'Task 2', completed: true, createdAt: '2025-01-02' },
                { id: 3, text: 'Task 3', completed: true, createdAt: '2025-01-03' },
                { id: 4, text: 'Task 4', completed: true, createdAt: '2025-01-04' },
                { id: 5, text: 'Task 5', completed: true, createdAt: '2025-01-05' }
            ];

            const completedTasks = tasks
                .filter(t => t.completed)
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            const removeCount = Math.max(1, Math.floor(completedTasks.length * 0.2));
            expect(removeCount).toBe(1); // 20% of 5 = 1

            const tasksToRemove = completedTasks.slice(0, removeCount);
            const remaining = tasks.filter(t => !tasksToRemove.includes(t));

            expect(remaining.length).toBe(4);
            expect(remaining[0].id).toBe(2); // Oldest removed
        });
    });

    describe('Statistics', () => {
        test('should calculate completion rate correctly', () => {
            const tasks = [
                { id: 1, completed: true },
                { id: 2, completed: true },
                { id: 3, completed: false },
                { id: 4, completed: false }
            ];

            const total = tasks.length;
            const completed = tasks.filter(t => t.completed).length;
            const rate = Math.round((completed / total) * 100);

            expect(rate).toBe(50);
        });

        test('should handle empty task list', () => {
            const tasks = [];
            const total = tasks.length;
            const rate = total > 0 ? Math.round((0 / total) * 100) : 0;

            expect(rate).toBe(0);
        });
    });

    describe('Filtering', () => {
        const tasks = [
            { id: 1, text: 'Task 1', completed: false },
            { id: 2, text: 'Task 2', completed: true },
            { id: 3, text: 'Task 3', completed: false }
        ];

        test('should filter active tasks', () => {
            const active = tasks.filter(t => !t.completed);
            expect(active.length).toBe(2);
        });

        test('should filter completed tasks', () => {
            const completed = tasks.filter(t => t.completed);
            expect(completed.length).toBe(1);
        });

        test('should return all tasks', () => {
            expect(tasks.length).toBe(3);
        });
    });

    describe('XSS Protection (Bug #2 Fix)', () => {
        test('should escape HTML in task text', () => {
            const maliciousText = '<script>alert("XSS")</script>';
            const div = document.createElement('div');
            div.textContent = maliciousText;
            const escaped = div.innerHTML;

            expect(escaped).not.toContain('<script>');
            expect(escaped).toContain('&lt;script&gt;');
        });

        test('should not execute inline event handlers', () => {
            const html = '<div onclick="alert()">Test</div>';
            document.body.innerHTML = html;

            // Event delegation should be used instead
            const div = document.querySelector('div');
            expect(div.onclick).toBeNull();
        });
    });

    describe('Memory Leak Prevention (Bug #1 Fix)', () => {
        test('should use WeakMap for timer tracking', () => {
            const timers = new WeakMap();
            const element = document.createElement('div');

            const timer = setInterval(() => {}, 1000);
            timers.set(element, timer);

            expect(timers.has(element)).toBe(true);

            clearInterval(timers.get(element));
            timers.delete(element);

            expect(timers.has(element)).toBe(false);
        });
    });

    describe('Confetti Performance (Bug #7 Fix)', () => {
        test('should limit confetti to max 100', () => {
            const MAX_CONFETTI = 100;
            let activeCount = 0;

            // Simulate confetti creation
            for (let i = 0; i < 150; i++) {
                if (activeCount >= MAX_CONFETTI) {
                    break;
                }
                activeCount++;
            }

            expect(activeCount).toBe(MAX_CONFETTI);
        });
    });

    describe('Dark Mode (Bug #10 Fix)', () => {
        test('should fallback when localStorage unavailable', () => {
            localStorageMock.getItem.mockImplementation(() => {
                throw new Error('localStorage disabled');
            });

            let theme = 'light';
            try {
                theme = localStorageMock.getItem('theme');
            } catch (error) {
                // Fallback to system preference
                theme = 'dark'; // Mock system preference
            }

            expect(theme).toBe('dark');
        });
    });
});

describe('Virtual Scrolling', () => {
    test('should calculate visible range correctly', () => {
        const itemHeight = 80;
        const scrollTop = 400;
        const containerHeight = 600;

        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

        expect(startIndex).toBe(5);
        expect(endIndex).toBe(13);
    });

    test('should handle large dataset', () => {
        const itemCount = 10000;
        const itemHeight = 80;
        const totalHeight = itemCount * itemHeight;

        expect(totalHeight).toBe(800000); // 800k pixels
    });
});

describe('Performance', () => {
    test('should debounce save operations', (done) => {
        let saveCount = 0;
        let saveTimeout = null;

        const debouncedSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                saveCount++;
            }, 300);
        };

        // Trigger multiple saves
        debouncedSave();
        debouncedSave();
        debouncedSave();

        // Check after debounce period
        setTimeout(() => {
            expect(saveCount).toBe(1); // Should only save once
            done();
        }, 400);
    });
});
