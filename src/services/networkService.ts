import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export type NetworkStatusListener = (isOnline: boolean) => void;

class NetworkService {
  private isNative = Capacitor.isNativePlatform();
  private listeners: Set<NetworkStatusListener> = new Set();
  private currentStatus: boolean = true;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.isNative) {
      const status = await Network.getStatus();
      this.currentStatus = status.connected;

      Network.addListener('networkStatusChange', (status) => {
        this.currentStatus = status.connected;
        this.notifyListeners();
      });
    } else {
      this.currentStatus = navigator.onLine;

      window.addEventListener('online', () => {
        this.currentStatus = true;
        this.notifyListeners();
      });

      window.addEventListener('offline', () => {
        this.currentStatus = false;
        this.notifyListeners();
      });
    }
  }

  public async isOnline(): Promise<boolean> {
    if (this.isNative) {
      const status = await Network.getStatus();
      this.currentStatus = status.connected;
      return status.connected;
    }
    this.currentStatus = navigator.onLine;
    return navigator.onLine;
  }

  public subscribeToNetworkChanges(callback: NetworkStatusListener): () => void {
    this.listeners.add(callback);
    // Fire immediately with current state
    callback(this.currentStatus);

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentStatus));
  }
}

export const networkService = new NetworkService();
