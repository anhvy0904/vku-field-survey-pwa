# VKU Field Survey PWA

VKU Field Survey is a robust, offline-first Progressive Web Application (PWA) and native Android application built for conducting field inspections of campus facilities. It operates reliably in environments with intermittent or non-existent network connectivity by utilizing local IndexedDB persistence and automated background synchronization.

## Features
- PWA standalone installation
- Offline-first inspection
- IndexedDB persistence
- Offline queue
- Background Sync
- Service Worker
- Cache-First App Shell (with automated cache busting)
- Camera
- Network monitoring
- Capacitor Android APK
- **Google Sheets Integration (via Apps Script & Vercel Proxy)**

## Architecture

- **React**: The core UI is powered by React (Vite build), providing dynamic multi-step form rendering and state management.
- **Service Worker**: A custom service worker script intercepts network requests, with explicit bypasses for Vite HMR and development resources.
- **Cache API**: The Service Worker utilizes a strictly defined `Cache-First` strategy for all App Shell static assets, ensuring rapid, network-independent cold boots. Cache versions are dynamically generated at build time to prevent "white screen" bugs during deployments.
- **IndexedDB**: The `idb` wrapper manages a robust versioned database schema, hosting `drafts` (for real-time form autosaves) and `submissions` (for the offline queue).
- **Sync Service**: A sequential execution engine that reads `PENDING_SYNC` records, processes HTTP responses to differentiate between transient (5xx/network) and permanent (400/404) errors, and applies exponential backoff for retries.
- **Vercel API (Reverse Proxy)**: The backend serverless environment seamlessly mapped via `api/surveys.ts`. It acts as a secure Reverse Proxy to Google Apps Script, perfectly bypassing strict browser CORS limitations and `HTTP 302` Post-Redirect-Get issues.
- **Google Apps Script**: Serves as the actual database engine, appending JSON payloads directly into a Google Spreadsheet.
- **Capacitor & Android**: The abstraction bridge allowing our web app to run natively on mobile hardware, packaged as an Android project with native API hooks for `Network` broadcast receiving and `Camera` hardware access.

## Installation

Install the required dependencies via NPM:
```bash
npm install
```

## Development

Spin up the local development server:
```bash
npm run dev
```
*Note: We have injected a custom Vercel API Proxy middleware into `vite.config.ts`. This allows you to run `npm run dev` normally and still have `/api/surveys` perfectly forwarded to your local `api/surveys.ts` serverless function!*

**Required Local Environment Variable:**
Create a `.env.local` file in the root directory and add your Google Apps Script URL:
```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

## Production Deployment (Vercel)

This project is configured out-of-the-box for Vercel. 
Simply push the codebase to a linked GitHub repository. Vercel will automatically detect the Vite build for static frontend hosting and configure the `api/` directory into scalable serverless endpoints.

**Required Vercel Configuration:**
You **MUST** configure the following environment variable in your Vercel Dashboard (Settings > Environment Variables) before deploying:
- `GOOGLE_APPS_SCRIPT_URL` = `https://script.google.com/macros/s/.../exec`

*(Note: No frontend variables like `VITE_API_URL` are required for web deployment as relative paths (`/api`) dynamically resolve on the same domain).*

## Android APK (Capacitor)

To package and compile the application for Android deployment:

### ⚠️ Critical Step for Mobile Apps
Unlike a web browser, a mobile app does not run on the `vercel.app` domain, so relative paths like `/api/surveys` will fail. Before building the app, you MUST tell the app where your Vercel backend is located:
1. Create a `.env.production` file.
2. Add your Vercel URL: `VITE_API_URL=https://your-project.vercel.app/api`

Then proceed with building:

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

## Offline Testing

1. Run the local application (`npm run dev`) or visit your production URL.
2. Open Chrome Developer Tools (F12) -> Network tab.
3. Check the "Offline" throttling preset.
4. Fill out the inspection form and submit it.
5. Notice the app remains usable and the submission queues as a yellow `PENDING_SYNC` state.
6. Uncheck "Offline".
7. The unified network service will automatically detect the restoration and instantly process the background sync queue, turning the item green (`SYNCED`) after successfully writing to Google Sheets.
