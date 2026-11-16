const baseURL = process.env.BASE_URL ?? 'https://automationexercise.com';

if (!/^https?:\/\//i.test(baseURL)) {
  throw new Error(`BASE_URL must be an absolute HTTP(S) URL. Received: ${baseURL}`);
}

export const environment = { baseURL };
