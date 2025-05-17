
// src/components/metrics/TopExercisesTable.tsx

import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useWeightUnit } from "@/context/WeightUnitContext";

interface ExerciseVolumeHistory {
  exercise_name: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  percentChange: number;
}

interface TopExercisesTableProps {
  exerciseVolumeHistory?: ExerciseVolumeHistory[];
  comparisonData?: ExerciseVolumeHistory[];
}

// Define as a named function component
const TopExercisesTableComponent: React.FC<TopExercisesTableProps> = ({
  exerciseVolumeHistory = [],
  comparisonData
}) => {
  const { weightUnit } = useWeightUnit();
  const hasComparison = !!comparisonData && comparisonData.length > 0;

  // Memoize check for data existence
  const hasData = useMemo(
    () => Array.isArray(exerciseVolumeHistory) && exerciseVolumeHistory.length > 0,
    [exerciseVolumeHistory]
  );

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-gray-400">
        <p>No exercise data available</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-800 hover:bg-transparent">
          <TableHead className="text-gray-400">Exercise</TableHead>
          <TableHead className="text-gray-400 text-right">Trend</TableHead>
          <TableHead className="text-gray-400 text-right">Change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exerciseVolumeHistory.map((exercise) => (
          <TableRow
            key={exercise.exercise_name}
            className="border-gray-800 hover:bg-gray-800/50"
          >
            <TableCell className="font-medium">
              {exercise.exercise_name}
              {hasComparison && comparisonData.find(e => e.exercise_name === exercise.exercise_name) && (
                <span className="ml-1 text-xs bg-purple-900/30 text-purple-300 px-1 rounded">
                  *
                </span>
              )}
            </TableCell>
            <TableCell className="text-right">
              {exercise.trend === 'increasing' ? (
                <TrendingUp className="inline ml-2 h-4 w-4 text-green-500" />
              ) : exercise.trend === 'decreasing' ? (
                <TrendingDown className="inline ml-2 h-4 w-4 text-red-500" />
              ) : (
                <Minus className="inline ml-2 h-4 w-4 text-gray-400" />
              )}
            </TableCell>
            <TableCell
              className={`text-right ${
                exercise.percentChange > 0
                  ? 'text-green-500'
                  : exercise.percentChange < 0
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`}
            >
              {exercise.percentChange > 0 && '+'}
              {exercise.percentChange.toFixed(1)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Export the memoized component correctly
export const TopExercisesTable = React.memo(TopExercisesTableComponent);
