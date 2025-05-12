
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
import { WeightUnitContextProvider } from './context/WeightUnitContext'
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
        <WeightUnitContextProvider>
          <DateRangeProvider>
            <WorkoutNavigationContextProvider>
              <LayoutProvider>
                <RouterProvider />
                <Toaster />
              </LayoutProvider>
            </WorkoutNavigationContextProvider>
          </DateRangeProvider>
        </WeightUnitContextProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
