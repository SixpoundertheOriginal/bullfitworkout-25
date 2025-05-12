
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import './App.css'

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
      <BrowserRouter>
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
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
