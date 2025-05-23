import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WorkoutPage from './pages/WorkoutPage';
import TrainingSessionPage from './pages/TrainingSession';
import AllExercisesPage from './pages/AllExercisesPage';
import ExerciseStatsPage from './pages/ExerciseStatsPage';
import { Toaster } from '@/components/ui/toaster';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { WorkoutProvider } from './hooks/useWorkout';
import { EmergencyWorkoutReset } from './components/training/EmergencyWorkoutReset';
import EnhancedExercisesPage from './pages/EnhancedExercisesPage';

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-950 text-white">
            <SiteHeader />
            <main className="flex-grow">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/workout/:workoutId?" element={<WorkoutPage />} />
                <Route path="/training-session" element={<TrainingSessionPage />} />
                <Route path="/exercises" element={<AllExercisesPage />} />
                <Route path="/exercise-stats/:exerciseId" element={<ExerciseStatsPage />} />
                <Route path="/enhanced-exercises" element={<EnhancedExercisesPage />} />
              </Routes>
              <EmergencyWorkoutReset />
            </main>
            <SiteFooter />
            <Toaster />
          </div>
        </Router>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;
