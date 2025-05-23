
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty } from "@/types/exercise";
import { ExerciseVariationGroup } from "@/components/exercises/ExerciseVariationGroup";
import { useExerciseList } from "../hooks/useExerciseList";
import { ExercisePagination } from "./ExercisePagination";
import { EnhancedExerciseVariationGroup } from "../components/EnhancedExerciseVariationGroup";
import { motion, AnimatePresence } from "framer-motion";
import { isIOS } from "@/utils/iosUtils";
import { Info, Filter, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExerciseTabContentProps {
  tab: "suggested" | "recent" | "browse";
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  onAddVariation: (exercise: Exercise) => void;
  onSelectExercise?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
  standalone: boolean;
  showPagination?: boolean;
  filters: {
    searchQuery: string;
    selectedMuscleGroup: MuscleGroup | "all";
    selectedEquipment: EquipmentType | "all";
    selectedDifficulty: Difficulty | "all";
    selectedMovement: MovementPattern | "all";
  };
  useEnhancedUI?: boolean;
}

export function ExerciseTabContent({
  tab,
  onEdit,
  onDelete,
  onAddVariation,
  onSelectExercise,
  onViewDetails,
  standalone,
  showPagination = false,
  filters,
  useEnhancedUI = true
}: ExerciseTabContentProps) {
  const isIOSDevice = isIOS();
  
  const {
    filteredExercises,
    currentExercises,
    totalPages,
    currentPage,
    setCurrentPage,
    isFiltering
  } = useExerciseList(tab, filters, showPagination);

  // Render active filter chips
  const renderActiveFilters = () => {
    const activeFilters = [];
    
    if (filters.selectedMuscleGroup !== "all") {
      activeFilters.push(
        <Badge key="muscle" className="bg-purple-700/70 hover:bg-purple-600 text-xs px-2 py-0.5 capitalize">
          <Dumbbell className="h-3 w-3 mr-1" />
          {filters.selectedMuscleGroup}
        </Badge>
      );
    }
    
    if (filters.selectedEquipment !== "all") {
      activeFilters.push(
        <Badge key="equipment" className="bg-blue-700/70 hover:bg-blue-600 text-xs px-2 py-0.5 capitalize">
          {filters.selectedEquipment}
        </Badge>
      );
    }
    
    if (filters.selectedDifficulty !== "all") {
      activeFilters.push(
        <Badge key="difficulty" className="bg-orange-700/70 hover:bg-orange-600 text-xs px-2 py-0.5 capitalize">
          {filters.selectedDifficulty}
        </Badge>
      );
    }
    
    if (filters.selectedMovement !== "all") {
      activeFilters.push(
        <Badge key="movement" className="bg-green-700/70 hover:bg-green-600 text-xs px-2 py-0.5 capitalize">
          {filters.selectedMovement}
        </Badge>
      );
    }
    
    if (activeFilters.length === 0) return null;
    
    return (
      <motion.div 
        className="flex flex-wrap gap-2 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Badge className="bg-gray-700 text-xs px-2 py-0.5 mr-2 flex items-center">
          <Filter className="h-3 w-3 mr-1" />
          Filters:
        </Badge>
        {activeFilters}
      </motion.div>
    );
  };

  // Render ExerciseVariationGroup component
  const renderExerciseVariationGroup = (exercise: Exercise, index: number) => {
    if (!exercise) return null;
    
    if (useEnhancedUI) {
      return (
        <motion.div 
          key={exercise.id} 
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.05,
            ease: isIOSDevice ? [0.23, 1, 0.32, 1] : 'easeOut'
          }}
        >
          <EnhancedExerciseVariationGroup
            baseExercise={exercise}
            onSelect={standalone ? undefined : onSelectExercise}
            onEdit={standalone ? onEdit : undefined}
            onDelete={standalone ? onDelete : undefined}
            onAddVariation={standalone ? onAddVariation : undefined}
            onViewDetails={onViewDetails}
          />
        </motion.div>
      );
    }
    
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
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 text-gray-400"
        >
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-lg">No exercises found</p>
          <p className="mt-1 text-sm">
            {isFiltering ? 'Try adjusting your filters or search terms' : 'Get started by adding exercises to your library'}
          </p>
          {isFiltering && (
            <div className="mt-4">
              <Badge variant="outline" className="bg-gray-800/50 border-gray-700 px-3 py-1 text-sm">
                {filters.searchQuery ? `Search: "${filters.searchQuery}"` : 'No search term'}
              </Badge>
            </div>
          )}
        </motion.div>
      );
    }

    return (
      <AnimatePresence>
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {exercisesToRender.map((exercise, index) => 
            exercise ? renderExerciseVariationGroup(exercise, index) : null
          )}
          
          {showPagination && totalPages > 1 && (
            <ExercisePagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <TabsContent value={tab} className="mt-0 flex-1 overflow-auto">
      <ScrollArea className="h-full px-0.5">
        {filters && renderActiveFilters()}
        {renderExerciseList()}
      </ScrollArea>
    </TabsContent>
  );
}
