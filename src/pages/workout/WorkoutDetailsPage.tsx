
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkoutDetailsLoading } from "@/components/workouts/WorkoutDetailsLoading";
import { WorkoutDetailsHeader } from "@/components/workouts/WorkoutDetailsHeader";
import { WorkoutDetailsEnhanced } from "@/components/workouts/WorkoutDetailsEnhanced";
import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useWorkoutDialogs } from "@/hooks/useWorkoutDialogs";
import { WorkoutSummaryCards } from "@/components/workouts/WorkoutSummaryCards";
import { WorkoutDensitySection } from "@/components/workouts/WorkoutDensitySection";
import { WorkoutTimeAndComposition } from "@/components/workouts/WorkoutTimeAndComposition";
import { WorkoutMuscleFocus } from "@/components/workouts/WorkoutMuscleFocus";
import { WorkoutTopExercises } from "@/components/workouts/WorkoutTopExercises";
import { ProcessedWorkoutMetrics, processWorkoutMetrics } from "@/utils/workoutMetricsProcessor";
import { useMemo } from "react";
import { WeightUnit } from "@/utils/unitConversion";

const WorkoutDetailsPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const { weightUnit } = useWeightUnit();

  const {
    workoutDetails,
    exerciseSets,
    loading: loadingDetails,
    setWorkoutDetails,
    setExerciseSets
  } = useWorkoutDetails(workoutId);

  // Calculate metrics from workout data
  const { metrics, exerciseVolumeHistory } = useWorkoutMetrics(workoutDetails, exerciseSets, weightUnit);

  // Handle dialog management
  const { handlers, dialogs } = useWorkoutDialogs({
    workoutId,
    workoutDetails,
    setExerciseSets,
    setWorkoutDetails
  });

  if (loadingDetails || !workoutDetails) {
    return <WorkoutDetailsLoading />;
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <main className="flex-1 overflow-auto px-4 py-6 pb-24 mt-16">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/training?tab=history">Workouts</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{workoutDetails.name || "Workout Details"}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header card */}
          <WorkoutDetailsHeader
            workoutDetails={workoutDetails}
            onEditClick={handlers.openEditWorkoutModal}
            onDeleteClick={handlers.openDeleteWorkoutDialog}
          />

          {/* Summary cards */}
          <WorkoutSummaryCards
            workoutDetails={workoutDetails}
            metrics={metrics}
            weightUnit={weightUnit}
          />

          {/* Workout Density & Time Distribution */}
          <WorkoutDensitySection metrics={metrics} weightUnit={weightUnit} />

          {/* Time of Day and Workout Composition side by side */}
          <WorkoutTimeAndComposition metrics={metrics} />

          {/* Muscle Focus */}
          <WorkoutMuscleFocus metrics={metrics} />

          {/* Top Exercises */}
          <WorkoutTopExercises exerciseVolumeHistory={exerciseVolumeHistory} />

          {/* Raw exercise list & editing */}
          <WorkoutDetailsEnhanced
            workout={workoutDetails}
            exercises={exerciseSets}
            onEditClick={handlers.openEditWorkoutModal}
            onEditExercise={handlers.editExercise}
          />
        </main>

        {/* Render all dialog components */}
        {dialogs}
      </div>
    </ErrorBoundary>
  );
};

// Custom hook to calculate and process all workout metrics
function useWorkoutMetrics(workoutDetails: any, exerciseSets: Record<string, any[]>, weightUnit: WeightUnit) {
  // Convert exercise sets into grouped format
  const groupedExercises = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (workoutDetails && exerciseSets) {
      if (Array.isArray(exerciseSets)) {
        exerciseSets.forEach(set => {
          const name = set.exercise_name || "Unknown";
          if (!map[name]) map[name] = [];
          map[name].push(set);
        });
      } else if (typeof exerciseSets === "object" && exerciseSets !== null) {
        Object.assign(map, exerciseSets);
      }
    }
    return map;
  }, [exerciseSets, workoutDetails]);

  // Calculate all metrics using the processor utility
  const metrics = useMemo(() => {
    if (!workoutDetails) {
      // Return default/empty metrics when workoutDetails isn't available
      return {
        duration: 0,
        totalVolume: 0,
        adjustedVolume: 0,
        density: 0,
        exerciseCount: 0,
        setCount: { total: 0, completed: 0, failed: 0 },
        densityMetrics: {
          setsPerMinute: 0,
          volumePerMinute: 0,
          overallDensity: 0,
          activeOnlyDensity: 0,
          formattedOverallDensity: "0.0 kg/min",
          formattedActiveOnlyDensity: "0.0 kg/min"
        },
        intensityMetrics: {
          averageRpe: 0,
          peakLoad: 0,
          averageLoad: 0
        },
        intensity: 0,
        efficiency: 0,
        muscleFocus: {},
        estimatedEnergyExpenditure: 0,
        movementPatterns: {},
        timeDistribution: { 
          activeTime: 0, 
          restTime: 0, 
          activeTimePercentage: 0, 
          restTimePercentage: 0 
        },
        composition: {
          compound: { count: 0, percentage: 0 },
          isolation: { count: 0, percentage: 0 },
          bodyweight: { count: 0, percentage: 0 },
          isometric: { count: 0, percentage: 0 },
          totalExercises: 0
        },
        durationByTimeOfDay: {
          morning: 0,
          afternoon: 0,
          evening: 0,
          night: 0
        }
      } as ProcessedWorkoutMetrics;
    }

    // Pass optional workout object with start_time property to enable time-of-day feature 
    const workoutWithTiming = workoutDetails ? {
      start_time: workoutDetails.start_time,
      duration: workoutDetails.duration || 0
    } : undefined;

    return processWorkoutMetrics(
      groupedExercises,
      workoutDetails.duration || 0,
      weightUnit as WeightUnit,
      undefined, // userBodyInfo
      workoutWithTiming // Pass the workout timing data
    );
  }, [groupedExercises, workoutDetails, weightUnit]);

  // Create exercise volume history from muscle focus data
  const exerciseVolumeHistory = useMemo(() => 
    metrics.muscleFocus ? 
      Object.entries(metrics.muscleFocus).map(([name, value]) => ({
        exercise_name: name,
        trend: 'stable' as const,
        percentChange: 0
      })) : [],
    [metrics.muscleFocus]
  );

  return { metrics, exerciseVolumeHistory };
}

export default WorkoutDetailsPage;
