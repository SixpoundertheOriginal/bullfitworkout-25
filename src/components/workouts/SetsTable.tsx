
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SetRow } from '@/components/SetRow';
import { ExerciseSet } from '@/types/exercise';
import { cn } from '@/lib/utils';

interface SetsTableProps {
  sets: ExerciseSet[];
  onAddSet?: () => void;
  onUpdateSet?: (updatedSet: ExerciseSet) => void;
  onDeleteSet?: (setToDelete: ExerciseSet) => void;
  onShowRestTimer?: () => void;
  expanded: boolean;
  onToggleExpanded: () => void;
  onFocusSet?: (index: number) => void;
  highlightActive?: boolean;
  activeSets?: number[];
}

export function SetsTable({
  sets,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onShowRestTimer,
  expanded,
  onToggleExpanded,
  onFocusSet,
  highlightActive = false,
  activeSets = []
}: SetsTableProps) {
  const sortedSets = [...sets].sort((a, b) => {
    // Handle missing set_number by using index order
    const aNum = a.set_number !== undefined ? a.set_number : 0;
    const bNum = b.set_number !== undefined ? b.set_number : 0;
    return aNum - bNum;
  });

  // Count completed sets for summary
  const completedSetsCount = sets.filter(s => s.completed).length;
  
  // Handle updating set values
  const handleUpdateSet = (updatedSet: ExerciseSet) => {
    console.log("SetsTable - updating set:", updatedSet);
    if (onUpdateSet) {
      onUpdateSet(updatedSet);
    }
  };

  return (
    <div className="w-full bg-gray-900/50 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onToggleExpanded}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <span className="text-sm font-medium">
            Sets ({completedSetsCount}/{sets.length} completed)
          </span>
        </div>
        {/* Removed the "Add Set" button from the header */}
      </div>
      
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-xs text-gray-400">
                <th className="py-2 px-3 font-medium">Set</th>
                <th className="py-2 px-3 font-medium text-center">Weight</th>
                <th className="py-2 px-3 font-medium text-center">Reps</th>
                <th className="py-2 px-3 font-medium text-center">Rest</th>
                <th className="py-2 px-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSets.map((exerciseSet, index) => (
                <SetRow
                  key={exerciseSet.id || `set-${exerciseSet.set_number || index}-${index}`}
                  exerciseSet={exerciseSet}
                  onUpdate={handleUpdateSet}
                  onDelete={(setToDelete) => {
                    if (onDeleteSet) onDeleteSet(setToDelete);
                  }}
                  onTimerStart={onShowRestTimer}
                  onFocusSet={onFocusSet ? () => onFocusSet(index) : undefined}
                  highlightActive={highlightActive && activeSets ? activeSets.includes(index) : false}
                />
              ))}
            </tbody>
          </table>
          
          {/* Removed the "Add Set" button at the bottom of the expanded table */}
        </div>
      )}
      
      {/* Compact set view when collapsed */}
      {!expanded && sets.length > 0 && (
        <div className="px-3 py-2 flex flex-wrap gap-2">
          {sortedSets.map((set, index) => (
            <div
              key={set.id || `set-mini-${set.set_number || index}-${index}`}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs",
                set.completed 
                  ? "bg-green-900/30 text-green-400 border border-green-500/30" 
                  : "bg-gray-800/50 text-gray-400 border border-gray-700/50"
              )}
              onClick={() => onFocusSet && onFocusSet(index)}
            >
              {set.set_number || index + 1}
            </div>
          ))}
          
          {/* Removed the "Add Set" button in compact view */}
        </div>
      )}
    </div>
  );
}
