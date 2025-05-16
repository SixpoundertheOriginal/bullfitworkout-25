
import React from 'react'
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DateRangeProvider } from '@/context/DateRangeContext';
import { WeightUnitContextProvider } from '@/context/WeightUnitContext';
import { AuthProvider } from '@/context/AuthContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { RouterProvider } from '@/context/RouterProvider';
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
  // Remove StrictMode to prevent double rendering in production
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
