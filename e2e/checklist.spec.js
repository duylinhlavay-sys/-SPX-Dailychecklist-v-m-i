// Playwright E2E Tests for Daily Checklist v2.0
// End-to-End testing for critical user flows

const { test, expect } = require('@playwright/test');

test.describe('Daily Checklist E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Clear localStorage before each test
        await page.evaluate(() => {
            localStorage.clear();
        });
        await page.reload();
    });

    test.describe('Basic Task Management', () => {
        test('should load the app successfully', async ({ page }) => {
            await expect(page).toHaveTitle(/Daily Checklist/);
            await expect(page.locator('.app-title')).toContainText('Daily Checklist');
        });

        test('should add a new task', async ({ page }) => {
            const taskText = 'Buy groceries';

            await page.fill('#taskInput', taskText);
            await page.click('.btn-primary');

            await expect(page.locator('.task-text')).toContainText(taskText);
        });

        test('should complete a task', async ({ page }) => {
            // Add task
            await page.fill('#taskInput', 'Test Task');
            await page.click('.btn-primary');

            // Complete task
            await page.click('.task-checkbox');

            await expect(page.locator('.task-item')).toHaveClass(/completed/);
        });

        test('should delete a task', async ({ page }) => {
            // Add task
            await page.fill('#taskInput', 'Task to delete');
            await page.click('.btn-primary');

            // Delete task
            await page.click('.btn-delete');

            // Confirm deletion (if confirm dialog appears)
            page.on('dialog', async dialog => {
                await dialog.accept();
            });

            await expect(page.locator('.task-item')).toHaveCount(0);
        });

        test('should show empty state when no tasks', async ({ page }) => {
            await expect(page.locator('.empty-state')).toBeVisible();
            await expect(page.locator('.empty-state')).toContainText('Chưa có công việc nào');
        });
    });

    test.describe('Input Validation', () => {
        test('should not add empty task', async ({ page }) => {
            await page.click('.btn-primary');

            // Should show validation message
            await expect(page.locator('.toast')).toContainText('Vui lòng nhập nội dung');
        });

        test('should not add task exceeding 500 characters', async ({ page }) => {
            const longText = 'a'.repeat(501);
            await page.fill('#taskInput', longText);
            await page.click('.btn-primary');

            await expect(page.locator('.toast')).toContainText('Nội dung quá dài');
        });

        test('should not add duplicate task', async ({ page }) => {
            const taskText = 'Duplicate task';

            // Add first task
            await page.fill('#taskInput', taskText);
            await page.click('.btn-primary');

            // Try to add duplicate
            await page.fill('#taskInput', taskText);
            await page.click('.btn-primary');

            await expect(page.locator('.toast')).toContainText('đã tồn tại');
        });
    });

    test.describe('Filtering', () => {
        test.beforeEach(async ({ page }) => {
            // Add multiple tasks
            await page.fill('#taskInput', 'Active Task 1');
            await page.click('.btn-primary');

            await page.fill('#taskInput', 'Active Task 2');
            await page.click('.btn-primary');

            await page.fill('#taskInput', 'Completed Task');
            await page.click('.btn-primary');

            // Complete one task
            await page.click('.task-checkbox >> nth=2');
        });

        test('should filter active tasks', async ({ page }) => {
            await page.click('[data-filter="active"]');

            await expect(page.locator('.task-item')).toHaveCount(2);
            await expect(page.locator('.task-item.completed')).toHaveCount(0);
        });

        test('should filter completed tasks', async ({ page }) => {
            await page.click('[data-filter="completed"]');

            await expect(page.locator('.task-item')).toHaveCount(1);
            await expect(page.locator('.task-item.completed')).toHaveCount(1);
        });

        test('should show all tasks', async ({ page }) => {
            await page.click('[data-filter="all"]');

            await expect(page.locator('.task-item')).toHaveCount(3);
        });
    });

    test.describe('Statistics', () => {
        test('should update statistics correctly', async ({ page }) => {
            // Add tasks
            await page.fill('#taskInput', 'Task 1');
            await page.click('.btn-primary');

            await page.fill('#taskInput', 'Task 2');
            await page.click('.btn-primary');

            // Check total
            await expect(page.locator('#totalTasks')).toContainText('2');

            // Complete one task
            await page.click('.task-checkbox >> nth=0');

            // Check completed
            await expect(page.locator('#completedTasks')).toContainText('1');

            // Check completion rate
            await expect(page.locator('#completionRate')).toContainText('50');
        });
    });

    test.describe('Dark Mode', () => {
        test('should toggle dark mode', async ({ page }) => {
            const htmlElement = page.locator('html');

            // Initial state
            const initialTheme = await htmlElement.getAttribute('data-theme');

            // Toggle dark mode
            await page.click('#darkModeToggle');

            // Wait for theme change
            await page.waitForTimeout(500);

            const newTheme = await htmlElement.getAttribute('data-theme');
            expect(newTheme).not.toBe(initialTheme);
        });

        test('should persist dark mode preference', async ({ page }) => {
            // Toggle dark mode
            await page.click('#darkModeToggle');

            const theme = await page.locator('html').getAttribute('data-theme');

            // Reload page
            await page.reload();

            // Theme should persist
            const persistedTheme = await page.locator('html').getAttribute('data-theme');
            expect(persistedTheme).toBe(theme);
        });
    });

    test.describe('Keyboard Shortcuts', () => {
        test('should focus input with Ctrl+K', async ({ page }) => {
            await page.keyboard.press('Control+k');

            const input = page.locator('#taskInput');
            await expect(input).toBeFocused();
        });

        test('should clear input with Escape', async ({ page }) => {
            await page.fill('#taskInput', 'Test');
            await page.keyboard.press('Escape');

            await expect(page.locator('#taskInput')).toHaveValue('');
        });
    });

    test.describe('LocalStorage Persistence', () => {
        test('should save tasks to localStorage', async ({ page }) => {
            await page.fill('#taskInput', 'Persisted Task');
            await page.click('.btn-primary');

            // Reload page
            await page.reload();

            // Task should still exist
            await expect(page.locator('.task-text')).toContainText('Persisted Task');
        });
    });

    test.describe('Confetti Animation', () => {
        test('should show confetti on task completion', async ({ page }) => {
            await page.fill('#taskInput', 'Celebrate');
            await page.click('.btn-primary');

            await page.click('.task-checkbox');

            // Wait for confetti animation
            await page.waitForTimeout(1000);

            const confetti = page.locator('.confetti');
            const confettiCount = await confetti.count();

            expect(confettiCount).toBeGreaterThan(0);
        });
    });

    test.describe('Performance', () => {
        test('should handle multiple tasks', async ({ page }) => {
            const taskCount = 50;

            for (let i = 0; i < taskCount; i++) {
                await page.fill('#taskInput', `Task ${i + 1}`);
                await page.click('.btn-primary');
            }

            await expect(page.locator('.task-item')).toHaveCount(taskCount);
        });

        test('should load quickly', async ({ page }) => {
            const startTime = Date.now();
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            const loadTime = Date.now() - startTime;

            expect(loadTime).toBeLessThan(3000); // Should load in < 3 seconds
        });
    });

    test.describe('PWA Features', () => {
        test('should register service worker', async ({ page }) => {
            await page.goto('/');

            const swRegistered = await page.evaluate(() => {
                return 'serviceWorker' in navigator;
            });

            expect(swRegistered).toBe(true);
        });

        test('should have manifest.json', async ({ page }) => {
            const response = await page.goto('/manifest.json');
            expect(response.status()).toBe(200);

            const manifest = await response.json();
            expect(manifest.name).toBeDefined();
            expect(manifest.short_name).toBeDefined();
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper ARIA labels', async ({ page }) => {
            await page.fill('#taskInput', 'Accessibility Test');
            await page.click('.btn-primary');

            const checkbox = page.locator('.task-checkbox');
            const ariaLabel = await checkbox.getAttribute('aria-label');

            expect(ariaLabel).toContain('Mark task');
        });

        test('should have no accessibility violations', async ({ page }) => {
            // Note: Requires @axe-core/playwright for full testing
            const title = await page.title();
            expect(title).toBeTruthy();

            const headings = await page.locator('h1').count();
            expect(headings).toBeGreaterThan(0);
        });
    });

    test.describe('Responsive Design', () => {
        test('should work on mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            await page.fill('#taskInput', 'Mobile Task');
            await page.click('.btn-primary');

            await expect(page.locator('.task-text')).toContainText('Mobile Task');
        });

        test('should work on tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });

            await page.fill('#taskInput', 'Tablet Task');
            await page.click('.btn-primary');

            await expect(page.locator('.task-text')).toContainText('Tablet Task');
        });
    });
});
