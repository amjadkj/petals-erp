import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, NetworkOnly, NetworkFirst, ExpirationPlugin, CacheableResponsePlugin } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope & typeof globalThis;

// Custom runtime caching rules enforcing strict PWA requirements
const customRuntimeCaching = [
  // 1. STRICT SECURITY RULE: NEVER cache clinical or financial data
  {
    matcher: ({ url }: { url: URL }) =>
      url.pathname.includes('/finance') ||
      url.pathname.includes('/clinical') ||
      url.pathname.includes('/assessments') ||
      url.pathname.includes('/treatment-plans') ||
      url.pathname.includes('/goals') ||
      url.pathname.includes('/reports'),
    handler: new NetworkOnly(),
  },
  // 2. Offline therapist schedule scope: read-only view of today's schedule
  {
    matcher: ({ url }: { url: URL }) =>
      url.pathname.includes('/appointments/daily') ||
      url.pathname.includes('/appointments') && url.searchParams.has('today'),
    handler: new NetworkFirst({
      cacheName: 'petals-therapist-schedule-v1',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 12 * 60 * 60, // 12 hours
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
  },
  // 3. Fallback to default cache for static assets and app shell
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: customRuntimeCaching,
});

serwist.addEventListeners();
