
import React from 'react';
import { ExerciseSet } from '@/types/exercise';
import { SetRow } from '@/components/SetRow';
import { Button } from "@/components/ui/button";
import { Plus, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { useWeightUnit } from '@/context/WeightUnitContext';
import { motion } from 'framer-motion';

interface SetsTableProps {
  sets: ExerciseSet[];
  onAddSet: () => void;
  onUpdateSet: (updatedSet: ExerciseSet) => void;
  onDeleteSet: (setToDelete: ExerciseSet) => void;
  onShowRestTimer: () => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

export const SetsTable: React.FC<SetsTableProps> = ({
  sets,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onShowRestTimer,
  expanded = true,
  onToggleExpanded
}) => {
  const { weightUnit } = useWeightUnit();
  
  return (
    <div className="w-full">
      {expanded ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden mb-4"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-center py-3 px-3 text-sm text-gray-400">Set</th>
                  <th className="text-center py-3 px-3 text-sm text-gray-400">Weight ({weightUnit})</th>
                  <th className="text-center py-3 px-3 text-sm text-gray-400">Reps</th>
                  <th className="text-center py-3 px-3 text-sm text-gray-400">Rest</th>
                  <th className="text-center py-3 px-3 text-sm text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sets.map((set) => (
                  <SetRow
                    key={set.id || `set-${set.set_number}`}
                    exerciseSet={set}
                    onUpdate={onUpdateSet}
                    onDelete={onDeleteSet}
                    onTimerStart={onShowRestTimer}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : null}
      
      <div className="flex justify-between items-center mt-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleExpanded}
          className="bg-gray-800/80 hover:bg-gray-700 border-gray-700 text-gray-300"
        >
          {expanded ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              Hide Sets
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              Show Sets
            </>
          )}
        </Button>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddSet}
            className="bg-gray-800/80 hover:bg-gray-700 border-gray-700 text-gray-300"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Set
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowRestTimer}
            className="bg-gray-800/80 hover:bg-gray-700 border-gray-700 text-gray-300"
          >
            <Clock className="mr-1 h-4 w-4" />
            Rest
          </Button>
        </div>
      </div>
    </div>
  );
};
