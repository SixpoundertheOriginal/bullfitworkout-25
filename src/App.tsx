
import React, { useEffect } from 'react'
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from '@/context/AuthContext';
import { WeightUnitContextProvider } from '@/context/WeightUnitContext';
import { DateRangeProvider } from '@/context/DateRangeContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { RouterProvider } from '@/context/RouterProvider';
import { WorkoutNavigationProvider } from '@/context/WorkoutNavigationContext';
import { applyIOSEnhancements, isIOS } from '@/utils/iosUtils';

// Create a new QueryClient instance with enhanced stability settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60000, // Increased to 60 seconds to reduce refetching
      refetchOnWindowFocus: false,
      refetchOnReconnect: false, // Disable reconnect refetching
      refetchOnMount: false,     // Disable mount refetching
    },
  },
});

function App() {
  // Apply iOS optimizations on mount
  useEffect(() => {
    // Apply iOS-specific enhancements if running on iOS
    if (isIOS()) {
      applyIOSEnhancements();
      
      // Add iOS status bar meta tags for standalone mode
      const metaStatusBar = document.createElement('meta');
      metaStatusBar.name = 'apple-mobile-web-app-status-bar-style';
      metaStatusBar.content = 'black-translucent';
      document.head.appendChild(metaStatusBar);
      
      // Add Apple Touch Icon for better home screen experience
      const linkAppleIcon = document.createElement('link');
      linkAppleIcon.rel = 'apple-touch-icon';
      linkAppleIcon.href = '/icon-512x512.png';
      document.head.appendChild(linkAppleIcon);
    }
    
    // Improve touch response on all devices
    document.documentElement.style.setProperty('touch-action', 'manipulation');
    
    // Prevent overscrolling on iOS
    document.body.style.overscrollBehaviorY = 'none';
  }, []);
  
  // Provider order is important - from most global to most specific
  // Auth must be first as other contexts may depend on it
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <WeightUnitContextProvider>
            <DateRangeProvider>
              <LayoutProvider>
                <WorkoutNavigationProvider>
                  <RouterProvider />
                </WorkoutNavigationProvider>
              </LayoutProvider>
            </DateRangeProvider>
          </WeightUnitContextProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
