
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { TimeOfDayChart } from "@/components/metrics/TimeOfDayChart";

interface WorkoutTimeAndCompositionProps {
  metrics: {
    durationByTimeOfDay: {
      morning: number;
      afternoon: number;
      evening: number;
      night: number;
    };
    composition: {
      compound: { count: number; percentage: number };
      isolation: { count: number; percentage: number };
      bodyweight: { count: number; percentage: number };
      isometric: { count: number; percentage: number };
      totalExercises: number;
    };
  };
}

export const WorkoutTimeAndComposition: React.FC<WorkoutTimeAndCompositionProps> = ({
  metrics
}) => {
  const hasTimeOfDayData = Object.values(metrics.durationByTimeOfDay).some(value => value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Time of Day Chart */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Time of Day</CardTitle>
        </CardHeader>
        <CardContent className="h-60">
          {hasTimeOfDayData ? (
            <div aria-label="Time of Day distribution chart">
              <TimeOfDayChart
                durationByTimeOfDay={metrics.durationByTimeOfDay}
                height={200}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No time-of-day data available
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Workout Composition Card */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Workout Composition</CardTitle>
        </CardHeader>
        <CardContent className="h-60">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(metrics.composition)
              .filter(([key]) => key !== 'totalExercises')
              .map(([type, data]) => {
                // Check if data is an object with count and percentage properties
                const count = typeof data === 'object' && data !== null ? data.count || 0 : 0;
                const percentage = typeof data === 'object' && data !== null ? data.percentage || 0 : 0;
                
                return (
                  <div key={type} className="flex flex-col p-3 rounded-md bg-gray-800/50 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1 capitalize">{type}</div>
                    <div className="text-lg font-medium">
                      {count} <span className="text-sm text-gray-400">({Math.round(percentage)}%)</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
