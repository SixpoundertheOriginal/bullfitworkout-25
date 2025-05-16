
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WeightUnit } from '@/utils/unitConversion';

export interface KPISectionProps {
  totalWorkouts: number;
  volumeTotal: number;
  avgDensity: number;
  weightUnit: WeightUnit | string;
}

export const KPISection: React.FC<KPISectionProps> = ({
  totalWorkouts,
  volumeTotal,
  avgDensity,
  weightUnit
}) => {
  // Log the input values for debugging
  console.log("[KPISection] Props:", { totalWorkouts, volumeTotal, avgDensity, weightUnit });

  // Ensure the density value is valid and formatted properly
  const formattedDensity = typeof avgDensity === 'number' && !isNaN(avgDensity) 
    ? avgDensity.toFixed(1) 
    : "0.0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2"><CardTitle>Total Workouts</CardTitle></CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalWorkouts || 0}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2"><CardTitle>Total Volume</CardTitle></CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {Math.round(volumeTotal || 0).toLocaleString()} {weightUnit}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2"><CardTitle>Avg Volume Rate</CardTitle></CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {formattedDensity} {weightUnit}/min
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
