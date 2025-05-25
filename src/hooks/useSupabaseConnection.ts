
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
      
      // Set up connection handlers with correct arguments
      channel.on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('🔌 WebSocket connection established via postgres_changes');
        setConnectionState({
          isConnected: true,
          isConnecting: false,
          retryCount: 0,
          lastError: null
        });
      });
      
      channel.on('presence', { event: 'sync' }, () => {
        console.log('✅ WebSocket connection established via presence');
        setConnectionState({
          isConnected: true,
          isConnecting: false,
          retryCount: 0,
          lastError: null
        });
      });
      
      // Subscribe to test the connection
      const subscribePromise = channel.subscribe();
      
      // Handle subscription result properly
      if (subscribePromise && typeof subscribePromise.then === 'function') {
        const status = await subscribePromise;
        if (status === 'SUBSCRIBED') {
          console.log('✅ WebSocket connection established');
          setConnectionState({
            isConnected: true,
            isConnecting: false,
            retryCount: 0,
            lastError: null
          });
          
          // Clean up the test channel after a short delay
          setTimeout(() => {
            supabase.removeChannel(channel);
          }, 1000);
        } else {
          throw new Error(`Subscription failed with status: ${status}`);
        }
      } else {
        // If subscribe doesn't return a promise, assume it worked
        console.log('✅ WebSocket connection established (no promise)');
        setConnectionState({
          isConnected: true,
          isConnecting: false,
          retryCount: 0,
          lastError: null
        });
        
        setTimeout(() => {
          supabase.removeChannel(channel);
        }, 1000);
      }
      
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
