
import React from "react";
import { PageHeader } from "@/components/navigation/PageHeader";
import { ExerciseTabs } from "./components/ExerciseTabs";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { useExerciseDialog } from "./hooks/useExerciseDialog";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { useIsMobile } from "@/hooks/use-mobile";
import { Exercise } from "@/types/exercise";
import { useAuth } from "@/hooks/useAuth";

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
  
  const {
    showDialog,
    setShowDialog,
    dialogMode,
    exerciseToEdit,
    baseExerciseForVariation,
    handleAdd,
    handleEdit,
    handleAddVariation,
    handleDelete,
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
    }
  };

  return (
    <div className={`${standalone ? 'pt-16 pb-24' : ''} h-full overflow-hidden flex flex-col`}>
      {standalone && <PageHeader title="Exercise Library" />}
      
      <div className={`flex-1 overflow-hidden flex flex-col mx-auto w-full max-w-4xl px-4 ${standalone ? 'py-4' : 'pt-0'}`}>
        <ExerciseDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSubmit={handleDialogSubmit}
          initialExercise={exerciseToEdit}
          baseExercise={baseExerciseForVariation}
          loading={isPending}
          mode={dialogMode}
        />
        
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
      
      {/* Add Exercise FAB - for mobile */}
      {standalone && isMobile && (
        <ExerciseFAB onClick={handleAdd} />
      )}
    </div>
  );
}
