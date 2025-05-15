import React from 'react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Index from "@/pages/Index";
import TrainingSession from "@/pages/TrainingSession";
import AllExercises from "@/pages/AllExercises";
import Workouts from "@/pages/Workouts";
import WorkoutDetails from "@/pages/WorkoutDetails";
import Profile from "@/pages/Profile";
import Overview from "@/pages/Overview";
import ExerciseSetup from "@/pages/ExerciseSetup";

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
    path: "/all-exercises",
    element: <AllExercises />
  },
  {
    path: "/workouts",
    element: <Workouts />
  },
  {
    path: "/workout-details/:id",
    element: <WorkoutDetails />
  },
  {
    path: "/profile",
    element: <Profile />
  },
  {
    path: "/overview",
    element: <Overview />
  },
  // Add new route for the ExerciseSetup page
  {
    path: "/setup-workout",
    element: <ExerciseSetup />
  }
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}

export default App
