# VKU Field Survey PWA

VKU Field Survey is a robust, offline-first Progressive Web Application (PWA) and native Android application built for conducting field inspections of campus facilities. It operates reliably in environments with intermittent or non-existent network connectivity by utilizing local IndexedDB persistence and automated background synchronization.

## Features
- PWA standalone installation
- Offline-first inspection
- IndexedDB persistence
- Offline queue
- Background Sync
- Service Worker
- Cache-First App Shell
- Camera
- Network monitoring
- Capacitor Android APK

## Architecture

- **React**: The core UI is powered by React (Vite build), providing dynamic multi-step form rendering and state management.
- **Service Worker**: A custom service worker script intercepts network requests.
- **Cache API**: The Service Worker utilizes a strictly defined `Cache-First` strategy for all App Shell static assets, ensuring rapid, network-independent cold boots.
- **IndexedDB**: The `idb` wrapper manages a robust versioned database schema, hosting `drafts` (for real-time form autosaves) and `submissions` (for the offline queue).
- **Sync Service**: A sequential execution engine that reads `PENDING_SYNC` records, processes HTTP responses to differentiate between transient (5xx/network) and permanent (400/404) errors, and applies exponential backoff for retries.
- **Vercel API**: The backend serverless environment seamlessly mapped via `api/surveys.ts`.
- **Capacitor**: The abstraction bridge allowing our web app to run natively on mobile hardware.
- **Android**: Through Capacitor, the build is packaged as an Android project with native API hooks for `Network` broadcast receiving and `Camera` hardware access.

## Installation

Install the required dependencies via NPM:
```bash
npm install
```

## Development

To spin up the local development server that supports both the Vite frontend and Vercel's serverless `/api` routing:
```bash
npm run dev:vercel
```
*(Note: standard `npm run dev` will not correctly route API requests).*

## Production Deployment

This project is configured out-of-the-box for Vercel. 
Simply push the codebase to a linked GitHub repository or run `vercel deploy`. Vercel will automatically detect the Vite build for static frontend hosting and configure the `api/` directory into scalable serverless endpoints. No manual environment variables (`VITE_API_URL`) are required as relative paths (`/api`) dynamically resolve on the same domain.

## Offline Testing

1. Run the local application (`npm run dev:vercel`) or visit your production URL.
2. Open Chrome Developer Tools (F12) -> Network tab.
3. Check the "Offline" throttling preset.
4. Fill out the inspection form and submit it.
5. Notice the app remains usable and the submission queues as a yellow `PENDING_SYNC` state.
6. Uncheck "Offline".
7. The unified network service will automatically detect the restoration and instantly process the background sync queue, turning the item green (`SYNCED`).

## Android APK

To package and compile the application for Android deployment:

1. Build the production web assets:
```bash
npm run build
```

2. Sync the compiled assets and Capacitor configuration into the native Android folder:
```bash
npx cap sync
```

3. Open Android Studio to compile the final `.apk` or run on an emulator:
```bash
npx cap open android
```

## Limitations

- **Backend Persistence**: The current `/api/surveys` endpoint is a mock simulator that returns a `200 OK` success response after 800ms of simulated latency. It **does not** physically write to a permanent backend database like PostgreSQL or Supabase. To establish permanent long-term storage, the `api/surveys.ts` serverless function must be integrated with your ORM or Database provider of choice.
