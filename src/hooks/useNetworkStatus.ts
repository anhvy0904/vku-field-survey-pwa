import { useState, useEffect } from 'react';
import { networkService } from '../services/networkService';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Initial fetch to ensure we don't start with incorrect state
    networkService.isOnline().then(setIsOnline);

    const unsubscribe = networkService.subscribeToNetworkChanges((status) => {
      setIsOnline(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isOnline;
};

