import { openDB } from './database';
import type { Survey } from '../types/survey';

const STORE_NAME = 'surveys';

export const surveyRepository = {
  
  async addSurvey(survey: Survey): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(survey);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  async getSurvey(id: string): Promise<Survey | undefined> {
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

  async getAllSurveys(): Promise<Survey[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      // Creating an index request to order by createdAt descending (most recent first)
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev');
      const surveys: Survey[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          surveys.push(cursor.value);
          cursor.continue();
        } else {
          resolve(surveys);
        }
      };

      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  async updateSurvey(survey: Survey): Promise<void> {
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

  async deleteSurvey(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  },

  async getPendingSurveys(): Promise<Survey[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('syncStatus');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  }
};
