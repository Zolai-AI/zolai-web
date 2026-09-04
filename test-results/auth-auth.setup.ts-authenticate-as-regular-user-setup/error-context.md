# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/auth.setup.ts >> authenticate as regular user
- Location: tests/auth/auth.setup.ts:7:6

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="email"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - region "Notifications alt+T"
  - generic [ref=e5]:
    - generic [ref=e7]: Login to your account
    - generic [ref=e10]:
      - group [ref=e11]:
        - generic [ref=e12]: Email
        - textbox "Email" [ref=e13]:
          - /placeholder: m@example.com
      - group [ref=e14]:
        - generic [ref=e15]: Password
        - generic [ref=e16]:
          - textbox "Password" [ref=e17]:
            - /placeholder: Enter your password
          - button "Show password" [ref=e18]:
            - img
      - paragraph [ref=e19]:
        - link "Forgot your password?" [ref=e20] [cursor=pointer]:
          - /url: /forgot-password
      - generic [ref=e21]:
        - checkbox "Remember me" [ref=e22]
        - checkbox
        - generic [ref=e23]: Remember me
      - group [ref=e24]:
        - button "Login" [ref=e25]
      - paragraph [ref=e26]:
        - text: Don't have an account?
        - link "Sign up" [ref=e27] [cursor=pointer]:
          - /url: /signup
  - button "Open Next.js Dev Tools" [ref=e33] [cursor=pointer]:
    - img [ref=e34]
  - alert [ref=e37]
```

# Test source

```ts
  1  | import { test as setup, expect } from '@playwright/test';
  2  | 
  3  | const authFile = 'tests/fixtures/.auth/user.json';
  4  | const adminAuthFile = 'tests/fixtures/.auth/admin.json';
  5  | 
  6  | // Setup regular user authentication
  7  | setup('authenticate as regular user', async ({ page }) => {
  8  |   await page.goto('/login');
  9  |    
  10 |   // Login with pre-seeded test credentials (from seed-test-data.ts)
> 11 |   await page.fill('[data-testid="email"]', 'test-user@example.com');
     |              ^ Error: page.fill: Test timeout of 30000ms exceeded.
  12 |   await page.fill('[data-testid="password"]', 'TestPassword123!');
  13 |   await page.click('[data-testid="login-button"]');
  14 |    
  15 |   // Wait for successful login - should redirect to dashboard
  16 |   await page.waitForURL('/dashboard');
  17 |   await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  18 |    
  19 |   // Store authentication state
  20 |   await page.context().storageState({ path: authFile });
  21 | });
  22 | 
  23 | // Setup admin user authentication
  24 | setup('authenticate as admin', async ({ page }) => {
  25 |   await page.goto('/login');
  26 |    
  27 |   // Login with pre-seeded admin credentials (from seed-test-data.ts)
  28 |   await page.fill('[data-testid="email"]', 'admin@example.com');
  29 |   await page.fill('[data-testid="password"]', 'AdminPassword123!');
  30 |   await page.click('[data-testid="login-button"]');
  31 |    
  32 |   await page.waitForURL('/dashboard');
  33 |   await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  34 |    
  35 |   // Verify admin access
  36 |   await page.goto('/admin');
  37 |   await expect(page).toHaveURL('/admin');
  38 |    
  39 |   await page.context().storageState({ path: adminAuthFile });
  40 | });
  41 | 
```