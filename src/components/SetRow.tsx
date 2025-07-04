import React, { useState, useEffect } from 'react';
import { ExerciseSet } from '@/types/exercise';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Timer, Trash2, Check, ChevronUp, ChevronDown, Target, ThumbsUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWeightUnit } from '@/context/WeightUnitContext';
import { cn } from '@/lib/utils';
import { EnhancedTooltip } from '@/components/ui/enhanced-tooltip';

export interface SetRowProps {
  exerciseSet: ExerciseSet;
  onUpdate: (updatedSet: ExerciseSet) => void;
  onDelete: (setToDelete: ExerciseSet) => void;
  onTimerStart?: () => void;
  onFocusSet?: () => void;
  highlightActive?: boolean;
}

export function SetRow({ 
  exerciseSet, 
  onUpdate, 
  onDelete, 
  onTimerStart,
  onFocusSet,
  highlightActive = false 
}: SetRowProps) {
  const [weight, setWeight] = useState(exerciseSet.weight?.toString() || '');
  const [reps, setReps] = useState(exerciseSet.reps?.toString() || '');
  const [completed, setCompleted] = useState(exerciseSet.completed || false);
  const [restTime, setRestTime] = useState<number>(exerciseSet.restTime || 60);
  const { weightUnit } = useWeightUnit();
  
  const isAutoAdjusted = !!exerciseSet.metadata?.autoAdjusted;
  const previousValues = exerciseSet.metadata?.previousValues;

  useEffect(() => {
    // Sync component state with the incoming props
    setWeight(exerciseSet.weight?.toString() || '');
    setReps(exerciseSet.reps?.toString() || '');
    setCompleted(exerciseSet.completed || false);
    setRestTime(exerciseSet.restTime || 60);
  }, [exerciseSet]);

  // Handlers for input changes
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setWeight(newValue);
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setReps(newValue);
  };

  const handleCompletedChange = (checked: boolean) => {
    setCompleted(checked);
    
    // Auto-update when completion status changes
    const updatedSet: ExerciseSet = {
      ...exerciseSet,
      completed: checked,
    };
    onUpdate(updatedSet);
  };

  const handleRestTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setRestTime(isNaN(value) ? 0 : value);
  };

  // Important: Ensure we update the parent component with our changes when input loses focus
  const handleUpdate = () => {
    console.log('Updating set with weight:', weight, 'reps:', reps);
    
    // Create updated set object with parsed values
    const updatedSet: ExerciseSet = {
      ...exerciseSet,
      weight: parseFloat(weight) || 0,
      reps: parseInt(reps) || 0,
      completed: completed,
      restTime: restTime,
    };
    
    // Call the onUpdate prop to update the parent component
    onUpdate(updatedSet);
  };

  // Handle increments for weight, reps, and rest time
  const handleWeightIncrement = (increment: number) => {
    const currentWeight = parseFloat(weight) || 0;
    const newWeight = Math.max(0, currentWeight + increment);
    setWeight(newWeight.toString());
    
    // Auto-update after changing
    setTimeout(() => {
      const updatedSet: ExerciseSet = {
        ...exerciseSet,
        weight: newWeight,
        reps: parseInt(reps) || 0,
        completed: completed,
        restTime: restTime,
      };
      onUpdate(updatedSet);
    }, 0);
  };

  const handleRepsIncrement = (increment: number) => {
    const currentReps = parseInt(reps) || 0;
    const newReps = Math.max(0, currentReps + increment);
    setReps(newReps.toString());
    
    // Auto-update after changing
    setTimeout(() => {
      const updatedSet: ExerciseSet = {
        ...exerciseSet,
        weight: parseFloat(weight) || 0,
        reps: newReps,
        completed: completed,
        restTime: restTime,
      };
      onUpdate(updatedSet);
    }, 0);
  };

  const handleRestTimeIncrement = (increment: number) => {
    const newRestTime = Math.max(0, restTime + increment);
    setRestTime(newRestTime);
    
    // Auto-update after changing
    setTimeout(() => {
      const updatedSet: ExerciseSet = {
        ...exerciseSet,
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps) || 0,
        completed: completed,
        restTime: newRestTime,
      };
      onUpdate(updatedSet);
    }, 0);
  };

  // Helper to format weight difference
  const getWeightDifference = () => {
    if (!previousValues || previousValues.weight === undefined) return '';
    const diff = exerciseSet.weight - previousValues.weight;
    return diff > 0 ? `+${diff}` : diff.toString();
  };

  // Helper to format reps difference
  const getRepsDifference = () => {
    if (!previousValues || previousValues.reps === undefined) return '';
    const diff = exerciseSet.reps - previousValues.reps;
    return diff > 0 ? `+${diff}` : diff.toString();
  };

  return (
    <tr className={cn(
      "border-b border-gray-800/50 last:border-none transition-all duration-200",
      highlightActive && "bg-purple-500/10 hover:bg-purple-500/15",
      isAutoAdjusted && "bg-green-500/5"
    )}>
      <td className="text-center py-3 px-3 text-sm font-mono">
        {exerciseSet.set_number}
        {isAutoAdjusted && (
          <span className="ml-1">
            <EnhancedTooltip content="Auto-adjusted based on your feedback">
              <ThumbsUp className="inline-block h-3 w-3 text-green-500" />
            </EnhancedTooltip>
          </span>
        )}
      </td>
      
      {/* Weight cell with editable field */}
      <td className="py-3 px-3">
        <div className="flex items-center justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400 hover:text-white"
            onClick={() => handleWeightIncrement(-2.5)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            <Input
              type="number"
              className={cn(
                "h-9 w-20 mx-1 text-center border-gray-700 text-white",
                highlightActive ? "bg-gray-900" : "bg-gray-800",
                isAutoAdjusted && "border-green-500/30"
              )}
              value={weight}
              onChange={handleWeightChange}
              onBlur={handleUpdate}
            />
            
            {isAutoAdjusted && previousValues?.weight !== undefined && (
              <div className="absolute -right-2 -top-2">
                <EnhancedTooltip content={`Changed from ${previousValues.weight}${weightUnit}`}>
                  <span className={cn(
                    "text-xs font-medium px-1 rounded",
                    getWeightDifference().startsWith('+') ? "text-green-400" : "text-amber-400"
                  )}>
                    {getWeightDifference()}
                  </span>
                </EnhancedTooltip>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400 hover:text-white"
            onClick={() => handleWeightIncrement(2.5)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          
          <span className="ml-1 text-xs text-gray-400">{weightUnit}</span>
        </div>
      </td>
      
      {/* Reps cell with editable field */}
      <td className="py-3 px-3">
        <div className="flex items-center justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400 hover:text-white"
            onClick={() => handleRepsIncrement(-1)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            <Input
              type="number"
              className={cn(
                "h-9 w-16 mx-1 text-center border-gray-700 text-white",
                highlightActive ? "bg-gray-900" : "bg-gray-800",
                isAutoAdjusted && "border-green-500/30"
              )}
              value={reps}
              onChange={handleRepsChange}
              onBlur={handleUpdate}
            />
            
            {isAutoAdjusted && previousValues?.reps !== undefined && (
              <div className="absolute -right-2 -top-2">
                <EnhancedTooltip content={`Changed from ${previousValues.reps} reps`}>
                  <span className={cn(
                    "text-xs font-medium px-1 rounded",
                    getRepsDifference().startsWith('+') ? "text-green-400" : "text-amber-400"
                  )}>
                    {getRepsDifference()}
                  </span>
                </EnhancedTooltip>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400 hover:text-white"
            onClick={() => handleRepsIncrement(1)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </td>
      
      {/* Rest time cell with editable field and timer trigger */}
      <td className="py-3 px-3">
        <div className="flex items-center justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400 hover:text-white"
            onClick={() => handleRestTimeIncrement(-15)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          <Input
            type="number"
            className={cn(
              "h-9 w-16 mx-1 text-center border-gray-700 text-white",
              highlightActive ? "bg-gray-900" : "bg-gray-800",
              isAutoAdjusted && "border-green-500/30"
            )}
            value={restTime.toString()}
            onChange={handleRestTimeChange}
            onBlur={handleUpdate}
          />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400 hover:text-white"
            onClick={() => handleRestTimeIncrement(15)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onTimerStart}
            className="ml-1 h-7 w-7 text-gray-400 hover:text-purple-400"
          >
            <Timer className="h-4 w-4" />
          </Button>
          
          <span className="ml-1 text-xs text-gray-400">s</span>
        </div>
      </td>
      
      {/* Actions cell with completion checkbox and delete */}
      <td className="py-3 px-3">
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant={completed ? "secondary" : "outline"}
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => handleCompletedChange(!completed)}
          >
            {completed ? <Check className="h-4 w-4 text-green-400" /> : null}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <span className="sr-only">Open menu</span>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem 
                className="text-red-400 cursor-pointer hover:text-red-300 hover:bg-red-900/20"
                onClick={() => onDelete(exerciseSet)}
              >
                Delete Set
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {onFocusSet && (
            <Button
              variant={highlightActive ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full",
                highlightActive 
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20" 
                  : "text-purple-400 hover:bg-purple-600/20 hover:text-purple-300"
              )}
              onClick={onFocusSet}
            >
              <Target className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
