
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

// Create router with pages that actually exist
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/training-session",
    element: <TrainingSession />
  },
  {
    path: "/overview",
    element: <Overview />
  },
  {
    path: "/setup-workout",
    element: <ExerciseSetup />
  }
]);

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DateRangeProvider>
            <WeightUnitContextProvider>
              <RouterProvider router={router} />
            </WeightUnitContextProvider>
          </DateRangeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  )
}

export default App
