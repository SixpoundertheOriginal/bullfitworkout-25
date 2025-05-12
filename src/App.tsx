
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'

import Index from './pages/Index'
import Auth from './pages/Auth'
import NotFound from './pages/NotFound'
import Overview from './pages/Overview'
import TrainingSession from './pages/TrainingSession'
import WorkoutComplete from './pages/WorkoutComplete'
import WorkoutDetailsPage from './pages/workout/WorkoutDetailsPage'
import WorkoutCompletePage from './pages/WorkoutCompletePage'
import WorkoutManagementPage from './pages/WorkoutManagementPage'
import AllExercisesPage from './pages/AllExercisesPage'
import ProfilePage from './pages/ProfilePage'
import ExerciseEditorPage from './pages/ExerciseEditorPage'
import { AuthProvider } from './context/AuthContext'
import { WorkoutNavigationContextProvider } from './context/WorkoutNavigationContext'
import { DateRangeProvider } from './context/DateRangeContext'
import { WeightUnitProvider } from './context/WeightUnitContext'
import { Toaster } from './components/ui/toaster'
import { LayoutProvider } from './context/LayoutContext'
import { RouterProvider } from './context/RouterProvider'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WeightUnitProvider defaultUnit="kg">
          <DateRangeProvider>
            <WorkoutNavigationContextProvider>
              <LayoutProvider>
                <RouterProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/overview" element={<Overview />} />
                    <Route path="/training-session" element={<TrainingSession />} />
                    <Route path="/workout-complete" element={<WorkoutComplete />} />
                    <Route path="/workout/:workoutId" element={<WorkoutDetailsPage />} />
                    <Route path="/workout-complete/:workoutId" element={<WorkoutCompletePage />} />
                    <Route path="/workouts" element={<WorkoutManagementPage />} />
                    <Route path="/all-exercises" element={<AllExercisesPage />} />
                    <Route path="/exercises" element={<ExerciseEditorPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </RouterProvider>
              </LayoutProvider>
            </WorkoutNavigationContextProvider>
          </DateRangeProvider>
        </WeightUnitProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
