
import React, { useState } from "react";
import { PageHeader } from "@/components/navigation/PageHeader";
import { ExerciseTabs } from "./components/ExerciseTabs";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { useExerciseDialog } from "./hooks/useExerciseDialog";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { useIsMobile } from "@/hooks/use-mobile";
import { Exercise } from "@/types/exercise";
import { useAuth } from "@/hooks/useAuth";
import { ExerciseDetailView } from "./components/ExerciseDetailView";
import { Separator } from "@/components/ui/separator";

interface ExerciseLibraryPageProps {
  onSelectExercise?: (exercise: string | Exercise) => void;
  standalone?: boolean;
  onBack?: () => void;
}

export default function ExerciseLibraryPage({ 
  onSelectExercise, 
  standalone = true, 
  onBack 
}: ExerciseLibraryPageProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  const {
    showDialog,
    setShowDialog,
    dialogMode,
    exerciseToEdit,
    baseExerciseForVariation,
    handleAdd,
    handleEdit,
    handleDelete,
    handleAddVariation,
    handleDialogSubmit,
    isPending,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    exerciseToDelete,
    confirmDelete
  } = useExerciseDialog(user, standalone);

  const handleSelectExercise = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    } else {
      setSelectedExercise(exercise);
    }
  };

  const handleCloseDetail = () => {
    setSelectedExercise(null);
  };

  return (
    <div className={`${standalone ? 'pt-16 pb-24' : ''} h-full overflow-hidden flex flex-col`}>
      {standalone && <PageHeader title="Exercise Library" />}
      
      <div className={`flex-1 overflow-hidden flex flex-col mx-auto w-full max-w-6xl px-4 ${standalone ? 'py-4' : 'pt-0'}`}>
        <ExerciseDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSubmit={handleDialogSubmit}
          initialExercise={exerciseToEdit}
          baseExercise={baseExerciseForVariation}
          loading={isPending}
          mode={dialogMode}
        />
        
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row md:gap-6">
          {/* Exercise List */}
          <div className={`flex-1 overflow-hidden flex flex-col ${selectedExercise && !isMobile ? 'md:max-w-[60%]' : ''}`}>
            <ExerciseTabs 
              standalone={standalone}
              onBack={onBack}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddVariation={handleAddVariation}
              onSelectExercise={handleSelectExercise}
              deleteConfirmOpen={deleteConfirmOpen}
              setDeleteConfirmOpen={setDeleteConfirmOpen}
              exerciseToDelete={exerciseToDelete}
              confirmDelete={confirmDelete}
            />
          </div>
          
          {/* Exercise Detail View - Only show on desktop */}
          {!isMobile && (
            <>
              <Separator orientation="vertical" className="h-auto hidden md:block bg-gray-800" />
              
              <div className="hidden md:flex flex-col flex-1 overflow-hidden">
                <ExerciseDetailView 
                  exercise={selectedExercise} 
                  onClose={handleCloseDetail}
                  onEditExercise={handleEdit}
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Add Exercise FAB - for mobile */}
      {standalone && isMobile && (
        <ExerciseFAB onClick={handleAdd} />
      )}
    </div>
  );
}
