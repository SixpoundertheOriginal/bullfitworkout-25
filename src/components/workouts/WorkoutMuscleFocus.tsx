
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MuscleGroupChart } from "@/components/metrics/MuscleGroupChart";

interface WorkoutMuscleFocusProps {
  metrics: {
    muscleFocus: Record<string, number>;
  };
}

export const WorkoutMuscleFocus: React.FC<WorkoutMuscleFocusProps> = ({
  metrics
}) => {
  return (
    <Card className="bg-gray-900 border-gray-800 mb-6">
      <CardHeader>
        <CardTitle>Muscle Group Focus</CardTitle>
      </CardHeader>
      <CardContent className="h-60" aria-label="Muscle Group Focus chart">
        <MuscleGroupChart muscleFocus={metrics.muscleFocus} height={200} />
      </CardContent>
    </Card>
  );
};
