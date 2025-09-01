import { test, expect } from '@playwright/test';

test.describe('Collections Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');

    // Login if needed (mock authentication)
    await page.evaluate(() => {
      // Mock user session
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User'
      }));
    });
  });

  test('deve criar nova coleção através da interface', async ({ page }) => {
    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Click create collection button
    await page.click('[data-testid="create-collection-btn"]');

    // Fill collection form
    await page.fill('[data-testid="collection-name-input"]', 'Test Collection E2E');
    await page.fill('[data-testid="collection-description-input"]', 'Test collection created by E2E test');
    await page.check('[data-testid="collection-public-checkbox"]');

    // Submit form
    await page.click('[data-testid="submit-collection-btn"]');

    // Verify collection was created
    await expect(page.locator('[data-testid="collection-title"]')).toContainText('Test Collection E2E');
    await expect(page.locator('[data-testid="collection-description"]')).toContainText('Test collection created by E2E test');
  });

  test('deve adicionar vídeo à coleção através de busca', async ({ page }) => {
    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Click on existing collection
    await page.click('[data-testid="collection-item"]:first-child');

    // Click add video button
    await page.click('[data-testid="add-video-btn"]');

    // Search for video
    await page.fill('[data-testid="video-search-input"]', 'React tutorial');
    await page.click('[data-testid="search-btn"]');

    // Wait for results and select first video
    await page.waitForSelector('[data-testid="video-result"]:first-child');
    await page.click('[data-testid="video-result"]:first-child [data-testid="add-to-collection-btn"]');

    // Verify video was added
    await expect(page.locator('[data-testid="collection-video-count"]')).toContainText('1');
  });

  test('deve navegar pela hierarquia de coleções', async ({ page }) => {
    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Create parent collection
    await page.click('[data-testid="create-collection-btn"]');
    await page.fill('[data-testid="collection-name-input"]', 'Parent Collection');
    await page.click('[data-testid="submit-collection-btn"]');

    // Create child collection
    await page.click('[data-testid="create-subcollection-btn"]');
    await page.fill('[data-testid="collection-name-input"]', 'Child Collection');
    await page.click('[data-testid="submit-collection-btn"]');

    // Navigate to parent
    await page.click('[data-testid="collection-item"]:has-text("Parent Collection")');

    // Verify child is visible
    await expect(page.locator('[data-testid="collection-item"]')).toContainText('Child Collection');

    // Navigate to child
    await page.click('[data-testid="collection-item"]:has-text("Child Collection")');

    // Verify breadcrumb navigation
    await expect(page.locator('[data-testid="breadcrumb"]')).toContainText('Parent Collection');
    await expect(page.locator('[data-testid="breadcrumb"]')).toContainText('Child Collection');
  });

  test('deve mover coleção entre pais', async ({ page }) => {
    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Create two parent collections
    await page.click('[data-testid="create-collection-btn"]');
    await page.fill('[data-testid="collection-name-input"]', 'Parent 1');
    await page.click('[data-testid="submit-collection-btn"]');

    await page.click('[data-testid="create-collection-btn"]');
    await page.fill('[data-testid="collection-name-input"]', 'Parent 2');
    await page.click('[data-testid="submit-collection-btn"]');

    // Create child collection
    await page.click('[data-testid="create-collection-btn"]');
    await page.fill('[data-testid="collection-name-input"]', 'Child to Move');
    await page.click('[data-testid="submit-collection-btn"]');

    // Move child to Parent 1
    await page.click('[data-testid="collection-item"]:has-text("Child to Move")');
    await page.click('[data-testid="move-collection-btn"]');
    await page.selectOption('[data-testid="parent-select"]', 'Parent 1');
    await page.click('[data-testid="confirm-move-btn"]');

    // Verify child is under Parent 1
    await page.click('[data-testid="collection-item"]:has-text("Parent 1")');
    await expect(page.locator('[data-testid="collection-item"]')).toContainText('Child to Move');
  });

  test('deve buscar coleções por nome', async ({ page }) => {
    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Create test collections
    await page.click('[data-testid="create-collection-btn"]');
    await page.fill('[data-testid="collection-name-input"]', 'React Collection');
    await page.click('[data-testid="submit-collection-btn"]');

    await page.click('[data-testid="create-collection-btn"]');
    await page.fill('[data-testid="collection-name-input"]', 'Vue Collection');
    await page.click('[data-testid="submit-collection-btn"]');

    // Search for React collections
    await page.fill('[data-testid="collection-search-input"]', 'React');
    await page.click('[data-testid="search-collections-btn"]');

    // Verify only React collection is shown
    await expect(page.locator('[data-testid="collection-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="collection-item"]')).toContainText('React Collection');
    await expect(page.locator('[data-testid="collection-item"]')).not.toContainText('Vue Collection');
  });

  test('deve exportar e importar coleções', async ({ page }) => {
    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Create test collection with content
    await page.click('[data-testid="create-collection-btn"]');
    await page.fill('[data-testid="collection-name-input"]', 'Export Test Collection');
    await page.click('[data-testid="submit-collection-btn"]');

    // Export collections
    await page.click('[data-testid="export-collections-btn"]');
    await page.selectOption('[data-testid="export-format-select"]', 'json');
    await page.check('[data-testid="include-content-checkbox"]');
    await page.click('[data-testid="confirm-export-btn"]');

    // Verify download was triggered
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toBe('collections.json');

    // Import collections (simulated)
    await page.click('[data-testid="import-collections-btn"]');
    await page.setInputFiles('[data-testid="import-file-input"]', 'collections.json');
    await page.click('[data-testid="confirm-import-btn"]');

    // Verify import success message
    await expect(page.locator('[data-testid="import-success-message"]')).toBeVisible();
  });

  test('deve gerenciar configurações da coleção', async ({ page }) => {
    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Create collection
    await page.click('[data-testid="create-collection-btn"]');
    await page.fill('[data-testid="collection-name-input"]', 'Settings Test Collection');
    await page.click('[data-testid="submit-collection-btn"]');

    // Open collection settings
    await page.click('[data-testid="collection-settings-btn"]');

    // Configure settings
    await page.check('[data-testid="auto-tag-checkbox"]');
    await page.check('[data-testid="sync-enabled-checkbox"]');
    await page.check('[data-testid="notify-checkbox"]');
    await page.selectOption('[data-testid="sort-by-select"]', 'publishedAt');
    await page.selectOption('[data-testid="sort-order-select"]', 'asc');
    await page.fill('[data-testid="max-items-input"]', '500');

    // Save settings
    await page.click('[data-testid="save-settings-btn"]');

    // Verify settings were saved
    await expect(page.locator('[data-testid="settings-saved-message"]')).toBeVisible();
  });

  test('deve compartilhar coleção com outro usuário', async ({ page }) => {
    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Create collection
    await page.click('[data-testid="create-collection-btn"]');
    await page.fill('[data-testid="collection-name-input"]', 'Shared Collection');
    await page.click('[data-testid="submit-collection-btn"]');

    // Open share dialog
    await page.click('[data-testid="share-collection-btn"]');

    // Enter user email
    await page.fill('[data-testid="share-email-input"]', 'friend@example.com');
    await page.selectOption('[data-testid="share-permission-select"]', 'READ');

    // Send invitation
    await page.click('[data-testid="send-invitation-btn"]');

    // Verify invitation was sent
    await expect(page.locator('[data-testid="invitation-sent-message"]')).toBeVisible();
  });

  test('deve visualizar estatísticas da coleção', async ({ page }) => {
    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Click on collection with content
    await page.click('[data-testid="collection-item"]:first-child');

    // Open statistics view
    await page.click('[data-testid="collection-stats-btn"]');

    // Verify statistics are displayed
    await expect(page.locator('[data-testid="total-videos-stat"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-views-stat"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-likes-stat"]')).toBeVisible();
    await expect(page.locator('[data-testid="top-tags-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-timeline"]')).toBeVisible();
  });

  test('deve gerenciar feeds da coleção', async ({ page }) => {
    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Click on collection
    await page.click('[data-testid="collection-item"]:first-child');

    // Open feeds management
    await page.click('[data-testid="manage-feeds-btn"]');

    // Create new feed
    await page.click('[data-testid="create-feed-btn"]');
    await page.fill('[data-testid="feed-title-input"]', 'YouTube Channel Feed');
    await page.fill('[data-testid="feed-url-input"]', 'https://youtube.com/channel/test');
    await page.selectOption('[data-testid="feed-type-select"]', 'CHANNEL');
    await page.click('[data-testid="save-feed-btn"]');

    // Verify feed was created
    await expect(page.locator('[data-testid="feed-item"]')).toContainText('YouTube Channel Feed');

    // Configure feed filters
    await page.click('[data-testid="feed-filters-btn"]');
    await page.fill('[data-testid="filter-search-input"]', 'tutorial');
    await page.fill('[data-testid="filter-min-views-input"]', '1000');
    await page.click('[data-testid="apply-filters-btn"]');

    // Verify filters were applied
    await expect(page.locator('[data-testid="active-filters"]')).toContainText('tutorial');
    await expect(page.locator('[data-testid="active-filters"]')).toContainText('1000');
  });

  test('deve executar operações em lote', async ({ page }) => {
    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Select multiple collections
    await page.check('[data-testid="collection-checkbox"]:nth-child(1)');
    await page.check('[data-testid="collection-checkbox"]:nth-child(2)');

    // Open batch operations menu
    await page.click('[data-testid="batch-operations-btn"]');

    // Choose move operation
    await page.click('[data-testid="batch-move-btn"]');
    await page.selectOption('[data-testid="batch-target-parent-select"]', 'Parent Collection');
    await page.click('[data-testid="execute-batch-btn"]');

    // Verify operation completed
    await expect(page.locator('[data-testid="batch-success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="batch-success-message"]')).toContainText('2 coleções movidas');
  });

  test('deve lidar com erros de rede graciosamente', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/collections**', route => route.abort());

    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Try to create collection
    await page.click('[data-testid="create-collection-btn"]');
    await page.fill('[data-testid="collection-name-input"]', 'Network Error Test');
    await page.click('[data-testid="submit-collection-btn"]');

    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Erro de rede');

    // Verify retry option is available
    await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible();
  });

  test('deve suportar navegação por teclado', async ({ page }) => {
    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Focus on first collection
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Navigate collection content with keyboard
    await page.keyboard.press('Tab'); // Focus on first video
    await page.keyboard.press('Enter'); // Open video details

    // Verify video details are shown
    await expect(page.locator('[data-testid="video-details-modal"]')).toBeVisible();

    // Close modal with Escape
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(page.locator('[data-testid="video-details-modal"]')).not.toBeVisible();
  });

  test('deve ser responsivo em diferentes tamanhos de tela', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to collections page
    await page.goto('http://localhost:3000/collections');

    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="collection-grid"]')).toHaveClass(/mobile/);

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Verify tablet layout
    await expect(page.locator('[data-testid="collection-grid"]')).toHaveClass(/tablet/);

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Verify desktop layout
    await expect(page.locator('[data-testid="collection-grid"]')).toHaveClass(/desktop/);
  });
});
