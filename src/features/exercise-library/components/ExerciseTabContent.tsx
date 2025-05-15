
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty } from "@/types/exercise";
import { ExerciseVariationGroup } from "@/components/exercises/ExerciseVariationGroup";
import { useExerciseList } from "../hooks/useExerciseList";
import { ExercisePagination } from "./ExercisePagination";

interface ExerciseTabContentProps {
  tab: "suggested" | "recent" | "browse";
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  onAddVariation: (exercise: Exercise) => void;
  onSelectExercise?: (exercise: Exercise) => void;
  standalone: boolean;
  showPagination?: boolean;
  filters: {
    searchQuery: string;
    selectedMuscleGroup: MuscleGroup | "all";
    selectedEquipment: EquipmentType | "all";
    selectedDifficulty: Difficulty | "all";
    selectedMovement: MovementPattern | "all";
  };
}

export function ExerciseTabContent({
  tab,
  onEdit,
  onDelete,
  onAddVariation,
  onSelectExercise,
  standalone,
  showPagination = false,
  filters
}: ExerciseTabContentProps) {
  const {
    filteredExercises,
    currentExercises,
    totalPages,
    currentPage,
    setCurrentPage
  } = useExerciseList(tab, filters, showPagination);

  // Render ExerciseVariationGroup component
  const renderExerciseVariationGroup = (exercise: Exercise) => {
    if (!exercise) return null;
    
    return (
      <div key={exercise.id} className="mb-4">
        <ExerciseVariationGroup
          baseExercise={exercise}
          onSelect={standalone ? undefined : onSelectExercise}
          onEdit={standalone ? onEdit : undefined}
          onDelete={standalone ? onDelete : undefined}
          onAddVariation={standalone ? onAddVariation : undefined}
        />
      </div>
    );
  };

  // Render exercise list
  const renderExerciseList = () => {
    const exercisesToRender = showPagination ? currentExercises : filteredExercises;
    
    if (!exercisesToRender || !Array.isArray(exercisesToRender) || exercisesToRender.length === 0) {
      return (
        <div className="text-center py-6 text-gray-400">
          No exercises found
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {exercisesToRender.map(exercise => 
          exercise ? renderExerciseVariationGroup(exercise) : null
        )}
        
        {showPagination && totalPages > 1 && (
          <ExercisePagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    );
  };

  return (
    <TabsContent value={tab} className="mt-0 flex-1 overflow-auto">
      <ScrollArea className="h-full">
        {renderExerciseList()}
      </ScrollArea>
    </TabsContent>
  );
}
