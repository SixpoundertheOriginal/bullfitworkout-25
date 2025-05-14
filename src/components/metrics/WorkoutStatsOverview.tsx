
import React from 'react';
import { Card } from "@/components/ui/card";

interface WorkoutStatsOverviewProps {
  workoutDetails: any;
}

export const WorkoutStatsOverview: React.FC<WorkoutStatsOverviewProps> = ({
  workoutDetails
}) => {
  return (
    <Card className="border-gray-800">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4">Workout Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400">Duration</div>
            <div className="text-lg font-semibold">{workoutDetails.duration} minutes</div>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400">Exercises</div>
            <div className="text-lg font-semibold">
              {workoutDetails.exercises ? Object.keys(workoutDetails.exercises).length : 0}
            </div>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400">Training Type</div>
            <div className="text-lg font-semibold">{workoutDetails.training_type}</div>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400">Start Time</div>
            <div className="text-lg font-semibold">
              {new Date(workoutDetails.start_time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
