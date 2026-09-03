import { surveyRepository } from '../db/surveyRepository';
import { api } from './api';
import { networkService } from './networkService';

let isSyncing = false;
let syncRequested = false; // Tracks if a new sync was requested while already syncing

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const syncService = {
  async syncAll(): Promise<{ success: boolean; syncedCount: number; error?: string }> {
    const online = await networkService.isOnline();
    if (!online) {
      console.log('[Sync Service] Network is offline. Skipping sync.');
      return { success: false, syncedCount: 0, error: 'Network offline' };
    }

    if (isSyncing) {
      console.log('[Sync Service] Sync already in progress. Queuing next sync...');
      syncRequested = true;
      return { success: false, syncedCount: 0, error: 'Sync already in progress' };
    }

    try {
      isSyncing = true;
      let totalSyncedCount = 0;
      let globalSuccess = true;
      let globalError = '';

      // Loop to handle any surveys that were added while we were already syncing
      do {
        syncRequested = false;
        
        const pendingSurveys = await surveyRepository.getPendingSurveys();
        if (pendingSurveys.length === 0) {
          continue; // Breaks the do-while if nothing to sync and syncRequested is false
        }

        console.log(`[Sync Service] Attempting to sync ${pendingSurveys.length} surveys sequentially...`);

        for (const survey of pendingSurveys) {
          let attempts = 0;
          const maxAttempts = 3;
          let success = false;
          let abortQueue = false;

          while (attempts < maxAttempts && !success && !abortQueue) {
            attempts++;
            const result = await api.syncSurvey(survey);

            if (result.success) {
              success = true;
              await surveyRepository.markAsSynced(survey.id);
              totalSyncedCount++;
            } else {
              const status = result.status || 0;
              console.warn(`[Sync Service] Sync attempt ${attempts} failed for ${survey.id}: ${result.error || 'Unknown error'} (HTTP ${status})`);
              
              if (status >= 400 && status < 500) {
                // Permanent error (e.g., 400 Bad Request, 404 Not Found)
                console.error(`[Sync Service] Permanent error. Marking ${survey.id} as FAILED.`);
                await surveyRepository.markAsFailed(survey.id);
                // Do not abort queue for other surveys, just break this retry loop
                break;
              } else {
                // Transient error (5xx or network failure)
                if (attempts < maxAttempts) {
                  await wait(Math.pow(2, attempts - 1) * 1000); // Exponential backoff
                } else {
                  console.error(`[Sync Service] Max retries reached for ${survey.id}. Aborting sync queue.`);
                  abortQueue = true;
                  globalSuccess = false;
                  globalError = result.error || 'Network error';
                }
              }
            }
          }

          if (abortQueue) {
            break; // Break the sequential for...of loop
          }
        }

      } while (syncRequested && globalSuccess);

      if (globalSuccess) {
        console.log(`[Sync Service] Successfully synced ${totalSyncedCount} surveys total.`);
        if (totalSyncedCount > 0) {
          localStorage.setItem('lastSyncTime', Date.now().toString());
        }
        return { success: true, syncedCount: totalSyncedCount };
      } else {
        console.error(`[Sync Service] Sync queue aborted. Some surveys remain pending.`);
        return { success: false, syncedCount: totalSyncedCount, error: globalError };
      }

    } catch (error: any) {
      console.error('[Sync Service] Critical sync error:', error);
      return { success: false, syncedCount: 0, error: error.message };
    } finally {
      isSyncing = false;
    }
  }
};
