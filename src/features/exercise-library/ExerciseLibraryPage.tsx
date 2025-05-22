
import React, { useState } from "react";
import { PageHeader } from "@/components/navigation/PageHeader";
import { ExerciseTabs } from "./components/ExerciseTabs";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { ExerciseDialogV2 } from "@/components/ExerciseDialogV2";
import { useExerciseDialog } from "./hooks/useExerciseDialog";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { FloatingLibraryButton } from "@/components/FloatingAddExerciseButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Exercise } from "@/types/exercise";
import { useAuth } from "@/hooks/useAuth";
import { ExerciseDetailView } from "./components/ExerciseDetailView";
import { EnhancedExerciseDetailView } from "./components/EnhancedExerciseDetailView";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { isIOS } from "@/utils/iosUtils";

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
  const [useNewDialog, setUseNewDialog] = useState(true);
  const [useEnhancedDetail, setUseEnhancedDetail] = useState(true);
  const isIOSDevice = isIOS();
  
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

  const renderDetailView = () => {
    if (!selectedExercise) return null;
    
    return useEnhancedDetail ? (
      <EnhancedExerciseDetailView 
        exercise={selectedExercise}
        onClose={handleCloseDetail}
        onEditExercise={handleEdit}
      />
    ) : (
      <ExerciseDetailView 
        exercise={selectedExercise} 
        onClose={handleCloseDetail}
        onEditExercise={handleEdit}
      />
    );
  };

  return (
    <div className={`${standalone ? 'pt-16 pb-24' : ''} h-full overflow-hidden flex flex-col`}>
      {standalone && <PageHeader title="Exercise Library" />}
      
      <div className={`flex-1 overflow-hidden flex flex-col mx-auto w-full max-w-6xl px-4 ${standalone ? 'py-4' : 'pt-0'}`}>
        {useNewDialog ? (
          <ExerciseDialogV2
            open={showDialog}
            onOpenChange={setShowDialog}
            onSubmit={handleDialogSubmit}
            initialExercise={exerciseToEdit}
            baseExercise={baseExerciseForVariation}
            loading={isPending}
            mode={dialogMode}
          />
        ) : (
          <ExerciseDialog
            open={showDialog}
            onOpenChange={setShowDialog}
            onSubmit={handleDialogSubmit}
            initialExercise={exerciseToEdit}
            baseExercise={baseExerciseForVariation}
            loading={isPending}
            mode={dialogMode}
          />
        )}
        
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row md:gap-6">
          {/* Exercise List */}
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex-1 overflow-hidden flex flex-col ${selectedExercise && !isMobile ? 'md:max-w-[60%]' : ''}`}
            >
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
            </motion.div>
          </AnimatePresence>
          
          {/* Exercise Detail View - Only show on desktop */}
          {!isMobile && (
            <>
              <Separator orientation="vertical" className="h-auto hidden md:block bg-gray-800" />
              
              <AnimatePresence>
                {selectedExercise && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: isIOSDevice ? [0.23, 1, 0.32, 1] : 'easeOut' }}
                    className="hidden md:flex flex-col flex-1 overflow-hidden"
                  >
                    {renderDetailView()}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
      
      {/* Add Exercise FAB - for mobile */}
      {standalone && isMobile && (
        <FloatingLibraryButton onClick={handleAdd} />
      )}
    </div>
  );
}
