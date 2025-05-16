
import React from 'react';
import { ExerciseSet } from '@/types/exercise';
import { SetRow } from '@/components/SetRow';
import { Button } from "@/components/ui/button";
import { Plus, Clock, ChevronUp, ChevronDown, Target, ThumbsUp } from "lucide-react";
import { useWeightUnit } from '@/context/WeightUnitContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SetsTableProps {
  sets: ExerciseSet[];
  onAddSet: () => void;
  onUpdateSet: (updatedSet: ExerciseSet) => void;
  onDeleteSet: (setToDelete: ExerciseSet) => void;
  onShowRestTimer: () => void;
  onFocusSet?: (setIndex: number) => void;
  highlightActive?: boolean;
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

export const SetsTable: React.FC<SetsTableProps> = ({
  sets,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onShowRestTimer,
  onFocusSet,
  highlightActive = false,
  expanded = true,
  onToggleExpanded
}) => {
  const { weightUnit } = useWeightUnit();
  const isMobile = useIsMobile();
  
  // Check if any sets have been auto-adjusted
  const hasAutoAdjustedSets = sets.some(set => set.metadata?.autoAdjusted);
  
  return (
    <div className="w-full">
      {expanded ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden mb-4"
        >
          <div className={cn(
            "rounded-lg",
            isMobile ? "overflow-visible" : "overflow-x-auto",
            highlightActive && "bg-purple-500/5 border border-purple-500/10 p-2"
          )}>
            {isMobile ? (
              // Card-based layout for mobile
              <div className="space-y-3">
                {sets.map((set, index) => (
                  <div 
                    key={set.id || `set-${set.set_number}`}
                    className={cn(
                      "bg-gray-800/50 rounded-lg p-3 border border-gray-700/30",
                      set.completed ? "border-green-500/20" : ""
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-sm text-gray-300">Set {set.set_number}</div>
                      {set.completed && (
                        <div className="flex items-center text-xs text-green-400">
                          <ThumbsUp size={12} className="mr-1" />
                          Completed
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1">Weight ({weightUnit})</label>
                        <div className="flex items-center bg-gray-900/70 rounded border border-gray-700 h-10 px-2">
                          <input
                            type="text"
                            value={set.weight}
                            onChange={(e) => {
                              const updatedSet = { ...set, weight: parseFloat(e.target.value) || 0 };
                              onUpdateSet(updatedSet);
                            }}
                            className="bg-transparent w-full text-center text-white"
                            readOnly={set.completed}
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1">Reps</label>
                        <div className="flex items-center bg-gray-900/70 rounded border border-gray-700 h-10 px-2">
                          <input
                            type="text"
                            value={set.reps}
                            onChange={(e) => {
                              const updatedSet = { ...set, reps: parseInt(e.target.value) || 0 };
                              onUpdateSet(updatedSet);
                            }}
                            className="bg-transparent w-full text-center text-white"
                            readOnly={set.completed}
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1">Rest (s)</label>
                        <div className="flex items-center bg-gray-900/70 rounded border border-gray-700 h-10 px-2">
                          <input
                            type="text"
                            value={set.restTime || 60}
                            onChange={(e) => {
                              const updatedSet = { ...set, restTime: parseInt(e.target.value) || 60 };
                              onUpdateSet(updatedSet);
                            }}
                            className="bg-transparent w-full text-center text-white"
                            readOnly={set.completed}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-3">
                      {!set.completed ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            const updatedSet = { ...set, completed: true };
                            onUpdateSet(updatedSet);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Complete
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const updatedSet = { ...set, completed: false };
                            onUpdateSet(updatedSet);
                          }}
                          className="text-green-400 border-green-500/20"
                        >
                          Undo
                        </Button>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteSet(set)}
                          className="text-red-400 border-red-500/20"
                        >
                          Delete
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onShowRestTimer}
                          className="text-orange-400 border-orange-500/20"
                        >
                          Rest
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Table layout for desktop
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
                  {sets.map((set, index) => (
                    <SetRow
                      key={set.id || `set-${set.set_number}`}
                      exerciseSet={set}
                      onUpdate={onUpdateSet}
                      onDelete={onDeleteSet}
                      onTimerStart={onShowRestTimer}
                      onFocusSet={onFocusSet ? () => onFocusSet(index) : undefined}
                      highlightActive={highlightActive}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Legend for auto-adjusted sets */}
          {hasAutoAdjustedSets && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 px-2">
              <ThumbsUp className="h-3 w-3 text-green-500" />
              <span>Auto-adjusted based on your feedback</span>
            </div>
          )}
        </motion.div>
      ) : null}
      
      {/* Separate focus mode bar that doesn't overlap with content */}
      {highlightActive && (
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-2 mb-3 shadow-md">
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFocusSet && onFocusSet(0)}
              className="bg-gray-800/80 hover:bg-gray-700 border-gray-700 text-gray-300"
            >
              <Target className="mr-1 h-4 w-4" />
              Exit Focus Mode
            </Button>
          </div>
        </div>
      )}
      
      {/* Actions bar - now separate from focus mode controls */}
      <div className={cn(
        "flex justify-between items-center",
        isMobile && "flex-col space-y-2"
      )}>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleExpanded}
          className={cn(
            "bg-gray-800/80 hover:bg-gray-700 border-gray-700 text-gray-300",
            isMobile && "w-full"
          )}
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
        
        <div className={cn(
          "flex",
          isMobile ? "w-full space-x-2" : "space-x-2"
        )}>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddSet}
            className={cn(
              "bg-gray-800/80 hover:bg-gray-700 border-gray-700 text-gray-300",
              isMobile && "flex-1 h-10"
            )}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Set
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowRestTimer}
            className={cn(
              "bg-gray-800/80 hover:bg-gray-700 border-gray-700 text-gray-300",
              isMobile && "flex-1 h-10"
            )}
          >
            <Clock className="mr-1 h-4 w-4" />
            Rest
          </Button>
          
          {onFocusSet && !highlightActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFocusSet(0)}
              className={cn(
                "bg-gray-800/80 hover:bg-gray-700 border-gray-700 text-gray-300",
                isMobile && "flex-1 h-10"
              )}
            >
              <Target className="mr-1 h-4 w-4" />
              Focus
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
