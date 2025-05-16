
import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ExerciseCard } from "@/components/training/ExerciseCard";
import { Search } from "lucide-react";
import { useExercises } from "@/hooks/useExercises";

export interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (exerciseName: string) => void | Promise<void>;
}

export function ExerciseDialog({ open, onOpenChange, onSelect }: ExerciseDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { exercises } = useExercises();

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return exercises;
    
    const query = searchQuery.toLowerCase();
    return exercises.filter(exercise => 
      exercise.name.toLowerCase().includes(query) || 
      exercise.primary_muscle_groups.some(muscle => muscle.toLowerCase().includes(query))
    );
  }, [exercises, searchQuery]);

  const handleExerciseSelect = (exerciseName: string) => {
    if (onSelect) {
      onSelect(exerciseName);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Add Exercise</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-800 text-white border-gray-700"
          />
        </div>
        
        <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              name={exercise.name}
              muscles={exercise.primary_muscle_groups.join(', ')}
              onClick={() => handleExerciseSelect(exercise.name)}
              className="cursor-pointer hover:bg-gray-800 transition-colors"
            />
          ))}
          
          {filteredExercises.length === 0 && (
            <div className="text-center p-4 text-gray-400">
              No exercises found matching "{searchQuery}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
