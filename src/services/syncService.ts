import { surveyRepository } from '../db/surveyRepository';
import { api } from './api';

let isSyncing = false;
let syncRequested = false; // Tracks if a new sync was requested while already syncing

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const syncService = {
  async syncAll(): Promise<{ success: boolean; syncedCount: number; error?: string }> {
    if (!navigator.onLine) {
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

        console.log(`[Sync Service] Attempting to sync ${pendingSurveys.length} surveys...`);

        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        let lastError = '';
        let result: { success: boolean; syncedIds?: string[]; error?: string; status?: number } | undefined;

        while (attempts < maxAttempts && !success) {
          attempts++;
          result = await api.syncSurveys(pendingSurveys);

          if (result?.success && result.syncedIds) {
            success = true;
            await Promise.all(
              pendingSurveys
                .filter(s => result?.syncedIds?.includes(s.id))
                .map(async (survey) => {
                  survey.syncStatus = 'synced';
                  await surveyRepository.updateSurvey(survey);
                })
            );
          } else {
            lastError = result?.error || 'Unknown error';
            console.warn(`[Sync Service] Sync attempt ${attempts} failed: ${lastError}`);
            if (attempts < maxAttempts) {
              await wait(Math.pow(2, attempts - 1) * 1000);
            }
          }
        }

        if (success) {
          totalSyncedCount += pendingSurveys.length;
        } else {
          globalSuccess = false;
          globalError = lastError;
          break; // If one batch fails completely, we stop the loop and let it retry later
        }

      } while (syncRequested);

      if (globalSuccess) {
        console.log(`[Sync Service] Successfully synced ${totalSyncedCount} surveys total.`);
        if (totalSyncedCount > 0) {
          localStorage.setItem('lastSyncTime', Date.now().toString());
        }
        return { success: true, syncedCount: totalSyncedCount };
      } else {
        console.error(`[Sync Service] Sync loop failed. Leaving remaining as pending.`);
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
