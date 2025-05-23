
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { WorkoutProvider } from '@/store/workout';
import { EmergencyWorkoutReset } from './components/training/EmergencyWorkoutReset';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@/context/RouterProvider';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WorkoutProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-gray-950 text-white">
              <main className="flex-grow">
                <RouterProvider />
                <EmergencyWorkoutReset />
              </main>
              <Toaster />
            </div>
          </Router>
        </WorkoutProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
