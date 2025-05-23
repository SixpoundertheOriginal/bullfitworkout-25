
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { WorkoutProvider } from '@/store/workout';
import { EmergencyWorkoutReset } from './components/training/EmergencyWorkoutReset';
import EnhancedExercisesPage from './pages/EnhancedExercisesPage';
import TrainingSessionPage from './pages/TrainingSession';
import AllExercisesPage from './pages/AllExercisesPage';
import ProfilePage from './pages/ProfilePage';
import Auth from './pages/Auth';

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-950 text-white">
            <main className="flex-grow">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/training-session" element={<TrainingSessionPage />} />
                <Route path="/exercises" element={<AllExercisesPage />} />
                <Route path="/enhanced-exercises" element={<EnhancedExercisesPage />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </Routes>
              <EmergencyWorkoutReset />
            </main>
            <Toaster />
          </div>
        </Router>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;
