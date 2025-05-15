
import React from 'react';
import { useWorkoutDetails } from '@/hooks/useWorkoutDetails';
import { WorkoutDetailsEnhanced } from '@/components/workouts/WorkoutDetailsEnhanced';
import { WorkoutDetailsLoading } from '@/components/workouts/WorkoutDetailsLoading';
import { useParams } from 'react-router-dom';

export default function WorkoutDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { workout, isLoading, error } = useWorkoutDetails(id || '');

  if (isLoading) {
    return <WorkoutDetailsLoading />;
  }

  if (error || !workout) {
    return (
      <div className="pt-16 h-full flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Workout Not Found</h2>
          <p className="text-gray-400">The workout could not be loaded or does not exist.</p>
        </div>
      </div>
    );
  }

  return <WorkoutDetailsEnhanced workout={workout} />;
}
