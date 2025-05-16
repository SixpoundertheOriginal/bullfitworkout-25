
import React from 'react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import TrainingSession from "@/pages/TrainingSession";
import Overview from "@/pages/Overview";
import ExerciseSetup from "@/pages/ExerciseSetup";
import { DateRangeProvider } from '@/context/DateRangeContext';
import { WeightUnitContextProvider } from '@/context/WeightUnitContext';
import { AuthProvider } from '@/context/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { LayoutProvider } from '@/context/LayoutContext';
import { RouterProvider as AppRouterProvider } from '@/context/RouterProvider';

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

// We'll now use the RouterProvider component to handle all routes
function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DateRangeProvider>
            <WeightUnitContextProvider>
              <LayoutProvider>
                <AppRouterProvider />
              </LayoutProvider>
            </WeightUnitContextProvider>
          </DateRangeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  )
}

export default App
