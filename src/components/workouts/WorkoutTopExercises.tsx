
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { TopExercisesTable } from "@/components/metrics/TopExercisesTable";

interface WorkoutTopExercisesProps {
  exerciseVolumeHistory: Array<{
    exercise_name: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
    percentChange: number;
  }>;
}

export const WorkoutTopExercises: React.FC<WorkoutTopExercisesProps> = ({
  exerciseVolumeHistory
}) => {
  return (
    <Card className="bg-gray-900 border-gray-800 mb-6">
      <CardHeader>
        <CardTitle>Top Exercises</CardTitle>
      </CardHeader>
      <CardContent>
        <TopExercisesTable exerciseVolumeHistory={exerciseVolumeHistory} />
      </CardContent>
    </Card>
  );
};
