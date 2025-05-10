
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { WorkoutDensityChart } from "@/components/metrics/WorkoutDensityChart";
import { WeightUnit } from "@/utils/unitConversion";

interface WorkoutDensitySectionProps {
  metrics: {
    duration: number;
    timeDistribution: {
      activeTime: number;
      restTime: number;
    };
    totalVolume: number;
    densityMetrics: {
      overallDensity: number;
      activeOnlyDensity: number;
    };
    intensity: number;
    efficiency: number;
  };
  weightUnit: WeightUnit;
}

export const WorkoutDensitySection: React.FC<WorkoutDensitySectionProps> = ({
  metrics,
  weightUnit
}) => {
  return (
    <Card className="bg-gray-900 border-gray-800 mb-6">
      <CardHeader>
        <CardTitle>Workout Density Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60 mb-4" aria-label="Workout density analysis chart">
          <WorkoutDensityChart
            totalTime={metrics.duration || 0}
            activeTime={metrics.timeDistribution.activeTime}
            restTime={metrics.timeDistribution.restTime}
            totalVolume={metrics.totalVolume}
            weightUnit={weightUnit}
            overallDensity={metrics.densityMetrics.overallDensity}
            activeOnlyDensity={metrics.densityMetrics.activeOnlyDensity}
            height={220}
          />
        </div>
        
        {/* Intensity & Efficiency metrics */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="p-4 rounded-md bg-gray-800/50 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Intensity</div>
            <div className="text-lg font-medium">{metrics.intensity.toFixed(1)}%</div>
          </div>
          <div className="p-4 rounded-md bg-gray-800/50 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Efficiency</div>
            <div className="text-lg font-medium">{metrics.efficiency.toFixed(1)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
