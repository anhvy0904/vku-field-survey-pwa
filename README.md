# VKU Field Survey PWA

![Application Screenshot Placeholder](docs/screenshot_home.png)

## 1. Project Title
**VKU Field Survey PWA** - An Offline-First Campus Facility Inspection Application.

## 2. Project Overview
The VKU Field Survey PWA is a Progressive Web Application designed for inspecting campus facilities at the Vietnam-Korea University of Information and Communication Technology (VKU). It is engineered specifically for field engineers and university staff who require a highly reliable tool that continues to function flawlessly even when deep inside campus buildings with zero cellular or Wi-Fi connectivity.

## 3. Project Objectives
* Provide an uninterrupted user experience regardless of network state.
* Guarantee zero data loss during field inspections.
* Implement modern PWA standards (Installability, Service Workers, Background Sync).
* Maintain a lightweight architecture without relying on overly complex frameworks.
* Serve as an academic demonstration of advanced frontend synchronization patterns.

## 4. Main Features
* **Installable PWA**: Can be installed directly to the home screen on iOS and Android devices, operating in standalone native-app mode.
* **Offline Inspection Form**: A responsive form with strict client-side validation for logging facility conditions.
* **Resilient Data Persistence**: All surveys are instantly saved to the browser's IndexedDB.
* **Intelligent Background Synchronization**: Surveys created offline are automatically queued and synchronized with the backend the moment network connectivity is restored.
* **Visual Network State**: Real-time UI indicators for network connectivity and synchronization queues.

## 5. Technology Stack
* **Frontend**: React 18, TypeScript, Vite
* **Styling**: Native CSS Variables (Zero CSS-framework footprint)
* **Icons**: Lucide React
* **Persistence**: Native IndexedDB API
* **PWA Infrastructure**: Native Service Worker API, Cache Storage API
* **Backend**: Node.js, Vercel Serverless Functions

## 6. System Architecture
The application follows a strictly decoupled offline-first architecture:
1. **Presentation Layer**: React components (`Survey.tsx`, `SurveyForm.tsx`) handle user interaction and local state.
2. **Repository Layer**: `database.ts` and `surveyRepository.ts` abstract the complexities of IndexedDB.
3. **Synchronization Engine**: `syncService.ts` manages the synchronization queue, exponential backoff, and duplicate prevention.
4. **Network Layer**: `api.ts` acts as the single abstraction for all HTTP requests to the backend.
5. **Proxy Layer**: `sw.js` (Service Worker) intercepts network requests and broadcasts background sync triggers.
6. **Backend Layer**: Vercel Serverless Functions (`api/surveys.ts`) handle incoming JSON payloads.

## 7. Service Worker Lifecycle
* **Registration**: Executed on application boot inside `main.tsx`.
* **Installation**: Pre-caches the core "App Shell" (`index.html`, `manifest.json`, CSS, JS, and icons) to guarantee offline booting.
* **Activation**: Automatically purges deprecated cache versions to ensure users receive the latest application updates.
* **Fetch**: Intercepts outgoing application requests and routes them through predefined caching strategies.
* **Background Sync**: Listens for OS-level connectivity events and broadcasts `TRIGGER_SYNC` messages to the active application clients.

## 8. Caching Strategies
* **Cache-First**: Used for static App Shell assets. Ensures immediate load times and offline availability.
* **Network-First**: Used for dynamic API `GET` requests (if implemented), falling back to cache if the network fails.
* **Network-Only**: Strictly enforced for transactional `POST` requests to prevent the Service Worker from aggressively caching backend mutations.

## 9. IndexedDB Design
The local database (`vku-field-survey`) contains a single object store named `surveys`.
* **Primary Key**: `id` (UUIDv4)
* **Indexes**: `syncStatus` (pending, synced, failed)
* **Schema**:
  * `building` (string)
  * `room` (string)
  * `facilityType` (string)
  * `condition` (Good | Needs Repair | Broken)
  * `description` (string)
  * `createdAt` (timestamp)
  * `syncStatus` (string)

## 10. Offline-First Workflow
1. User loses connectivity (`useNetworkStatus` detects `navigator.onLine === false`).
2. The UI immediately displays a warning banner.
3. The user submits a facility inspection.
4. The survey is saved to IndexedDB with `syncStatus: 'pending'`.
5. The synchronization service halts execution. The user can safely close the application.

## 11. Synchronization Workflow
1. The device regains connectivity.
2. The UI detects the network state change OR the Service Worker fires a native `sync` event.
3. `syncService.syncAll()` locks the queue to prevent duplicate POSTs.
4. Pending surveys are retrieved from IndexedDB.
5. The API client attempts an HTTP POST.
   * **On Success (200 OK)**: Surveys are updated to `syncStatus: 'synced'`.
   * **On Failure (4xx/5xx)**: Exponential backoff is triggered (1s, 2s, 4s). If all retries fail, surveys safely remain `pending` for the next session.

## 12. Project Structure
```
/
├── api/                  # Vercel Serverless Functions (Backend)
├── public/               # PWA Manifest, Icons, and Service Worker
├── src/
│   ├── components/       # Reusable React components (UI, Survey, Layout)
│   ├── db/               # IndexedDB Repository Pattern
│   ├── hooks/            # Custom React Hooks (e.g., useNetworkStatus)
│   ├── pages/            # Top-level route components
│   ├── services/         # API abstractions and Sync Engine
│   └── types/            # TypeScript Interfaces
├── package.json
└── vite.config.ts
```

## 13. Local Setup
Ensure you have Node.js (v18+) installed.
```bash
git clone https://github.com/your-username/vku-field-survey-pwa.git
cd vku-field-survey-pwa
npm install
```

## 14. Development Commands
* **Full Stack Server (Recommended)**: Runs the Vite frontend and Vercel serverless backend simultaneously. Required for testing offline synchronization logic locally.
  ```bash
  npm run dev:vercel
  ```
* **Frontend-Only Server**: Runs only the Vite static server. API endpoints will return HTTP 404.
  ```bash
  npm run dev
  ```
* **Code Quality**:
  ```bash
  npm run lint
  ```

## 15. Production Build
To compile TypeScript and bundle the application for production:
```bash
npm run build
npm run preview
```

## 16. Offline Testing Instructions
To verify the offline-first architecture locally:
1. Run `npm run dev:vercel` and open `http://localhost:3000`.
2. Open Chrome DevTools (F12) -> Network tab.
3. Change the throttling dropdown from "No throttling" to "Offline".
4. Fill out the inspection form and submit. Notice the "waiting to sync" UI indicator.
5. (Optional) Refresh the page or close the tab to verify IndexedDB persistence.
6. Change the Network tab back to "No throttling".
7. Observe the UI automatically trigger synchronization and successfully update the backend.

## 17. Deployment Instructions
This project is configured for zero-config deployment to Vercel.
1. Push the repository to GitHub.
2. Log into [Vercel](https://vercel.com) and import the repository.
3. Vercel will automatically detect the Vite build pipeline and the `api/` serverless functions directory. No custom `vercel.json` is required.

## 18. Screenshots
*(Placeholder for UI screenshots)*
- `docs/screenshot_home.png`
- `docs/screenshot_form.png`
- `docs/screenshot_offline.png`

## 19. Known Limitations
* **Missing Edit/Delete UI**: The underlying repository layer supports editing and deleting surveys, but the UI components for this have not been implemented yet.
* **Manual Cache Versioning**: The Service Worker utilizes a hardcoded cache string (`v1`). This must be bumped manually in `sw.js` when deploying new frontend assets to force cache invalidation.
* **Mock Backend Database**: The current `api/surveys.ts` endpoint successfully processes JSON payloads but does not connect to a real SQL/NoSQL database for permanent cloud storage.

## 20. Future Work
* Package the static HTML/JS output using **Capacitor** to generate a native Android `.apk` for direct distribution to VKU staff.
* Integrate a real backend database (e.g., Supabase or PostgreSQL) into the Vercel API.
* Implement UI views for Editing and Deleting pending surveys before they synchronize.
* Implement Photo/Image upload capabilities using the IndexedDB Blob storage format.
