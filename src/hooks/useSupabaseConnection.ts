
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
  const channelRef = useRef<any>(null);
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
      
      // Clean up existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      // Test connection by subscribing to a simple channel
      const channel = supabase.channel('connection-test');
      channelRef.current = channel;
      
      // Subscribe to test the connection
      const subscriptionResult = channel.subscribe((status) => {
        console.log('🔌 Connection status:', status);
        
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
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }
          }, 1000);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          throw new Error(`Subscription failed with status: ${status}`);
        }
      });
      
      // Handle subscription errors
      if (!subscriptionResult) {
        throw new Error('Failed to create subscription');
      }
      
    } catch (error) {
      console.error('🔌 WebSocket connection failed:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      }));
      
      // Clean up failed channel
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (cleanupError) {
          console.warn('Failed to cleanup failed channel:', cleanupError);
        }
        channelRef.current = null;
      }
      
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
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.warn('Failed to cleanup channel on unmount:', error);
        }
        channelRef.current = null;
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
