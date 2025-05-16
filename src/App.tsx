
import React from 'react'
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DateRangeProvider } from '@/context/DateRangeContext';
import { WeightUnitContextProvider } from '@/context/WeightUnitContext';
import { AuthProvider } from '@/context/AuthContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { RouterProvider as AppRouterProvider } from '@/context/RouterProvider';
import { WorkoutNavigationProvider } from '@/context/WorkoutNavigationContext';

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    // Removed React.StrictMode to prevent double rendering
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <DateRangeProvider>
            <WeightUnitContextProvider>
              <LayoutProvider>
                <WorkoutNavigationProvider>
                  <AppRouterProvider />
                </WorkoutNavigationProvider>
              </LayoutProvider>
            </WeightUnitContextProvider>
          </DateRangeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
