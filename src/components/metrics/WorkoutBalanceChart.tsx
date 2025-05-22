
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts';

interface MuscleGroupData {
  name: string;
  value: number;
  fullMark: number;
}

interface WorkoutBalanceChartProps {
  data: MuscleGroupData[];
  className?: string;
}

export const WorkoutBalanceChart: React.FC<WorkoutBalanceChartProps> = ({ 
  data, 
  className = "" 
}) => {
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <Card className={`bg-gray-900/80 border-gray-800 shadow-md ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Dumbbell className="h-5 w-5 text-purple-400 mr-2" />
            Training Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <Dumbbell className="h-10 w-10 text-gray-700 mb-2" />
          <p className="text-gray-500">No training data available</p>
          <p className="text-xs text-gray-600 mt-1">Complete more workouts to see your training balance</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gray-900/80 border-gray-800 shadow-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Dumbbell className="h-5 w-5 text-purple-400 mr-2" />
          Training Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#aaa', fontSize: 12 }} />
              <Radar
                name="Current"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.5}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
