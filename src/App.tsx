
import React from 'react'
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from '@/context/AuthContext';
import { WeightUnitContextProvider } from '@/context/WeightUnitContext';
import { DateRangeProvider } from '@/context/DateRangeContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { RouterProvider } from '@/context/RouterProvider';
import { WorkoutNavigationProvider } from '@/context/WorkoutNavigationContext';

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
