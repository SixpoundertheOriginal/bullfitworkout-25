
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { WeightUnit } from "@/utils/unitConversion";

interface WorkoutSummaryCardsProps {
  workoutDetails: {
    start_time: string;
    duration: number;
  };
  metrics: {
    exerciseCount: number;
    setCount: {
      total: number;
    };
    totalVolume: number;
    intensityMetrics: {
      peakLoad: number;
    };
  };
  weightUnit: WeightUnit;
}

export const WorkoutSummaryCards: React.FC<WorkoutSummaryCardsProps> = ({
  workoutDetails,
  metrics,
  weightUnit
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      {[
        { 
          label: "Date", 
          value: new Date(workoutDetails.start_time).toLocaleDateString(), 
          colSpan: "md:col-span-1" 
        },
        { 
          label: "Duration", 
          value: `${workoutDetails.duration} min`, 
          colSpan: "md:col-span-1" 
        },
        { 
          label: "Exercises", 
          value: metrics.exerciseCount, 
          colSpan: "md:col-span-1" 
        },
        { 
          label: "Sets", 
          value: metrics.setCount.total, 
          colSpan: "md:col-span-1" 
        },
        { 
          label: "Volume", 
          value: `${Math.round(metrics.totalVolume).toLocaleString()} ${weightUnit}`, 
          colSpan: "md:col-span-1" 
        },
        { 
          label: "Max Load", 
          value: `${Math.round(metrics.intensityMetrics.peakLoad)} ${weightUnit}`, 
          colSpan: "md:col-span-1" 
        },
      ].map((item, idx) => (
        <Card key={idx} className={`bg-gray-900 border-gray-800 ${item.colSpan}`}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">{item.label}</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-lg">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
