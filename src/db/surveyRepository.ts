import { openDB } from './database';
import type { SurveySubmission } from '../types/survey';

const STORE_NAME = 'submissions';

export const surveyRepository = {
  
  async enqueueSurvey(survey: SurveySubmission): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(survey);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  async getSurvey(id: string): Promise<SurveySubmission | undefined> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  async getAllSurveys(): Promise<SurveySubmission[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      const submissions: SurveySubmission[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          submissions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(submissions);
        }
      };

      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  async getPendingSurveys(): Promise<SurveySubmission[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('status');
      const request = index.getAll('PENDING_SYNC');

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  async markAsSynced(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const submission = getRequest.result as SurveySubmission;
        if (submission) {
          submission.status = 'SYNCED';
          const updateRequest = store.put(submission);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Submission not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  async markAsFailed(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const submission = getRequest.result as SurveySubmission;
        if (submission) {
          submission.status = 'FAILED';
          const updateRequest = store.put(submission);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Submission not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  async deleteSubmission(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  }
};
