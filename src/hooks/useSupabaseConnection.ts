
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  retryCount: number;
  lastError: string | null;
}

/**
 * Hook to manage Supabase real-time connection with retry logic
 * Provides graceful degradation when WebSocket connections fail
 */
export const useSupabaseConnection = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    retryCount: 0,
    lastError: null
  });
  
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const maxRetries = 3;
  const baseRetryDelay = 1000; // 1 second
  
  const connectWithRetry = async (retryCount = 0) => {
    if (retryCount >= maxRetries) {
      console.log('🔌 Maximum WebSocket retry attempts reached, operating in offline mode');
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        lastError: 'Maximum retry attempts reached'
      }));
      
      // Show user-friendly message only on first failure
      if (retryCount === maxRetries) {
        toast({
          title: "Connection Issue",
          description: "Real-time features temporarily unavailable. App functionality preserved.",
          variant: "destructive"
        });
      }
      
      return;
    }
    
    setConnectionState(prev => ({
      ...prev,
      isConnecting: true,
      retryCount
    }));
    
    try {
      console.log(`🔌 Attempting WebSocket connection (attempt ${retryCount + 1}/${maxRetries})`);
      
      // Test connection by subscribing to a simple channel
      const channel = supabase.channel('connection-test');
      
      // Set up connection handlers
      channel.on('error', (error) => {
        console.error('🔌 WebSocket connection error:', error);
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          lastError: error.message || 'Connection error'
        }));
        
        // Retry with exponential backoff
        const delay = baseRetryDelay * Math.pow(2, retryCount);
        retryTimeoutRef.current = setTimeout(() => {
          connectWithRetry(retryCount + 1);
        }, delay);
      });
      
      channel.on('connected', () => {
        console.log('✅ WebSocket connection established');
        setConnectionState({
          isConnected: true,
          isConnecting: false,
          retryCount: 0,
          lastError: null
        });
        
        // Clean up the test channel
        supabase.removeChannel(channel);
      });
      
      // Subscribe to test the connection
      await channel.subscribe();
      
    } catch (error) {
      console.error('🔌 WebSocket connection failed:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      }));
      
      // Retry with exponential backoff
      const delay = baseRetryDelay * Math.pow(2, retryCount);
      retryTimeoutRef.current = setTimeout(() => {
        connectWithRetry(retryCount + 1);
      }, delay);
    }
  };
  
  // Initialize connection on mount
  useEffect(() => {
    connectWithRetry();
    
    // Cleanup on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  
  // Retry connection manually
  const retryConnection = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    connectWithRetry(0);
  };
  
  return {
    ...connectionState,
    retryConnection,
    hasConnectivity: connectionState.isConnected || connectionState.retryCount < maxRetries
  };
};
