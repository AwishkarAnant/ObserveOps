import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { LoginPage } from '../../src/pages/common/login.page';
import { users } from '../../src/test-data/users';

const storageState = path.resolve(__dirname, '../../playwright/.auth/user.json');

setup('authenticate as admin', async ({ page }) => {
  fs.mkdirSync(path.dirname(storageState), { recursive: true });

  const admin = users.admin();
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(admin.username, admin.password);

  await expect(page).not.toHaveURL(/\/login/);

  await page.context().storageState({ path: storageState });
});
