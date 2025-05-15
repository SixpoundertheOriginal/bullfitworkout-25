
import React from 'react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Index from "@/pages/Index";
import TrainingSession from "@/pages/TrainingSession";
import Overview from "@/pages/Overview";
import ExerciseSetup from "@/pages/ExerciseSetup";
import { DateRangeProvider } from '@/context/DateRangeContext';

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
    <DateRangeProvider>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </DateRangeProvider>
  )
}

export default App
