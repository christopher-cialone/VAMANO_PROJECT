import { test, expect } from '@playwright/test';

test.describe('VAMANO E2E Tests', () => {
  test('should load homepage with cypherpunk design', async ({ page }) => {
    await page.goto('/');
    
    // Check for main elements
    await expect(page.locator('h1')).toContainText('VAMANO');
    await expect(page.locator('text=cypherpunk NFT ticketing')).toBeVisible();
    await expect(page.locator('text=CREATE EVENT')).toBeVisible();
    await expect(page.locator('text=VERIFY TICKET')).toBeVisible();
  });

  test('should navigate to builder page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=CREATE EVENT');
    
    await expect(page).toHaveURL('/builder');
    await expect(page.locator('text=Event Information')).toBeVisible();
    await expect(page.locator('text=EVENT/INFO')).toBeVisible();
    await expect(page.locator('text=LOGIC/RULES')).toBeVisible();
    await expect(page.locator('text=DESIGN/ASSETS')).toBeVisible();
  });

  test('should fill event form', async ({ page }) => {
    await page.goto('/builder');
    
    // Fill event information
    await page.fill('input[placeholder="Cypherpunk Concert 2024"]', 'Test Event 2024');
    await page.fill('input[type="datetime-local"]', '2024-12-31T20:00');
    await page.fill('input[placeholder="Decentralized Arena"]', 'Test Venue');
    await page.fill('input[type="number"]', '100');
    
    // Check preview updates
    await expect(page.locator('text=Test Event 2024')).toBeVisible();
    await expect(page.locator('text=Test Venue')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/builder');
    
    // Test tab navigation
    await page.click('text=LOGIC/RULES');
    await expect(page.locator('text=Logic & Rules')).toBeVisible();
    await expect(page.locator('text=PRO FEATURES')).toBeVisible();
    
    await page.click('text=DESIGN/ASSETS');
    await expect(page.locator('text=Design & Assets')).toBeVisible();
    await expect(page.locator('text=Theme')).toBeVisible();
  });

  test('should show account modal when saving draft', async ({ page }) => {
    await page.goto('/builder');
    
    // Fill required fields
    await page.fill('input[placeholder="Cypherpunk Concert 2024"]', 'Test Event');
    await page.fill('input[type="datetime-local"]', '2024-12-31T20:00');
    await page.fill('input[placeholder="Decentralized Arena"]', 'Test Venue');
    
    // Click save draft
    await page.click('text=SAVE DRAFT');
    
    // Check modal appears
    await expect(page.locator('text=Connect Account')).toBeVisible();
    await expect(page.locator('text=Connect Phantom Wallet')).toBeVisible();
  });

  test('should navigate to verification page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=VERIFY TICKET');
    
    await expect(page).toHaveURL('/verify');
    await expect(page.locator('text=VERIFY TICKET')).toBeVisible();
    await expect(page.locator('text=QR Scanner')).toBeVisible();
    await expect(page.locator('text=Manual Input')).toBeVisible();
  });

  test('should show verification form', async ({ page }) => {
    await page.goto('/verify');
    
    // Check form elements
    await expect(page.locator('textarea[placeholder*="Paste QR code data"]')).toBeVisible();
    await expect(page.locator('text=VERIFY TICKET')).toBeVisible();
    await expect(page.locator('text=Supported formats')).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=CREATE EVENT')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    await expect(page.locator('text=FEATURES')).toBeVisible();
    await expect(page.locator('text=ON-CHAIN NFTS')).toBeVisible();
  });

  test('should show wallet connect button on builder', async ({ page }) => {
    await page.goto('/builder');
    
    // Check for wallet adapter button
    await expect(page.locator('button:has-text("Select Wallet")')).toBeVisible();
  });

  test('should disable Go Live button when wallet not connected', async ({ page }) => {
    await page.goto('/builder');
    
    // Fill all required fields
    await page.fill('input[placeholder="Cypherpunk Concert 2024"]', 'Test Event');
    await page.fill('input[type="datetime-local"]', '2024-12-31T20:00');
    await page.fill('input[placeholder="Decentralized Arena"]', 'Test Venue');
    
    // Go Live button should be disabled without wallet
    const goLiveButton = page.locator('button:has-text("GO LIVE")');
    await expect(goLiveButton).toBeDisabled();
  });

  test('should handle verification with mock data', async ({ page }) => {
    await page.goto('/verify');
    
    // Enter a mock ticket hash
    await page.fill('textarea[placeholder*="Paste QR code data"]', 'nft_mock_12345');
    
    // Click verify
    await page.click('button:has-text("VERIFY TICKET")');
    
    // Should show loading state
    await expect(page.locator('text=VERIFYING...')).toBeVisible();
  });

  test('should display event preview correctly', async ({ page }) => {
    await page.goto('/builder');
    
    // Fill event details
    await page.fill('input[placeholder="Cypherpunk Concert 2024"]', 'Crypto Festival 2025');
    await page.fill('input[type="datetime-local"]', '2025-06-15T18:00');
    await page.fill('input[placeholder="Decentralized Arena"]', 'Virtual Metaverse');
    
    // Check preview section updates
    await expect(page.locator('text=Crypto Festival 2025')).toBeVisible();
    await expect(page.locator('text=Virtual Metaverse')).toBeVisible();
  });

  test('should navigate through all main pages', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Go to builder
    await page.click('text=CREATE EVENT');
    await expect(page).toHaveURL('/builder');
    
    // Go back to home
    await page.click('text=VAMANO');
    await expect(page).toHaveURL('/');
    
    // Go to verify
    await page.click('text=VERIFY TICKET');
    await expect(page).toHaveURL('/verify');
    
    // Go back to home
    await page.click('text=VAMANO');
    await expect(page).toHaveURL('/');
  });

  test('should show cypherpunk styling consistently', async ({ page }) => {
    await page.goto('/');
    
    // Check for cypherpunk color scheme
    const header = page.locator('header');
    await expect(header).toHaveCSS('border-bottom-color', /green/i);
    
    // Check for monospace font
    const body = page.locator('body');
    await expect(body).toHaveClass(/font-mono/);
  });
});


