'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import api from '@/lib/api';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkConnection = async () => {
    try {
      await api.get('/health');
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isConnected === null) return null;

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
      isConnected 
        ? 'bg-green-100 text-green-800' 
        : 'bg-yellow-100 text-yellow-800'
    }`}>
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>API Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Demo Mode</span>
        </>
      )}
      {lastChecked && (
        <span className="text-xs opacity-75">
          • {lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
