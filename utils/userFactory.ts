import { randomUUID } from 'node:crypto';
import type { NewAccount } from '../pages/LoginPage';

export function createAccount(): NewAccount {
  const suffix = randomUUID().replace(/-/g, '').slice(0, 12);

  return {
    name: `Playwright User ${suffix}`,
    email: `playwright.${suffix}@example.com`,
    password: `Pw-${suffix}-Secure`,
    firstName: 'Playwright',
    lastName: `User${suffix}`,
    company: 'Automation QA',
    address: '100 Test Avenue',
    country: 'India',
    state: 'Karnataka',
    city: 'Bengaluru',
    zipCode: '560001',
    mobileNumber: '9876543210',
  };
}
