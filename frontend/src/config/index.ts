/**
 * Application-level configuration constants.
 * All values are driven by environment variables injected by Vite.
 */

const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
    timeout: 30_000, // 30 seconds
  },
  socket: {
    url: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000',
    reconnectionAttempts: 5,
    reconnectionDelay: 1_000,
  },
  auth: {
    accessTokenKey: 'mini_saas_access_token',
    refreshTokenKey: 'mini_saas_refresh_token',
    tokenPrefix: 'Bearer',
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  upload: {
    maxFileSizeMb: 10,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocTypes: ['application/pdf', 'text/plain', 'text/markdown'],
  },
  app: {
    name: 'Mini SaaS Platform',
    version: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
  },
} as const;

export type AppConfig = typeof config;
export default config;
