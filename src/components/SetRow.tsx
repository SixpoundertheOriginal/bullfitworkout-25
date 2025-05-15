
import React, { useState, useEffect } from 'react';
import { ExerciseSet } from '@/types/exercise';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Trash2, Timer, ChevronUp, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWeightUnit } from '@/context/WeightUnitContext';

export interface SetRowProps {
  exerciseSet: ExerciseSet;
  onUpdate: (updatedSet: ExerciseSet) => void;
  onDelete: (setToDelete: ExerciseSet) => void;
  onTimerStart?: () => void;
}

export function SetRow({ exerciseSet, onUpdate, onDelete, onTimerStart }: SetRowProps) {
  const [weight, setWeight] = useState(exerciseSet.weight?.toString() || '');
  const [reps, setReps] = useState(exerciseSet.reps?.toString() || '');
  const [completed, setCompleted] = useState(exerciseSet.completed || false);
  const [isEditing, setIsEditing] = useState(false);
  const [restTime, setRestTime] = useState<number>(exerciseSet.restTime || 60);
  const { weightUnit } = useWeightUnit();

  useEffect(() => {
    setWeight(exerciseSet.weight?.toString() || '');
    setReps(exerciseSet.reps?.toString() || '');
    setCompleted(exerciseSet.completed || false);
    setRestTime(exerciseSet.restTime || 60);
  }, [exerciseSet]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeight(e.target.value);
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReps(e.target.value);
  };

  const handleCompletedChange = (checked: boolean) => {
    setCompleted(checked);
  };

  const handleRestTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setRestTime(value);
  };

  const handleUpdate = async () => {
    setIsEditing(false);
    const updatedSet: ExerciseSet = {
      ...exerciseSet,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      completed: completed,
      restTime: restTime,
    };
    await onUpdate(updatedSet);
  };

  const handleDelete = async () => {
    await onDelete(exerciseSet);
  };

  // Add increment/decrement handlers
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

  return (
    <div className="grid grid-cols-8 items-center gap-2 py-2 px-4 border-b border-gray-700 last:border-none">
      <div className="col-span-1 text-right font-mono">{exerciseSet.set_number}</div>
      
      {/* Weight input with increment/decrement buttons */}
      <div className="col-span-2 flex items-center">
        <div className="flex-1 flex items-center relative">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 absolute left-0 text-gray-400 hover:text-white"
            onClick={() => handleWeightIncrement(-2.5)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          <Input
            type="number"
            className="bg-gray-800 border-gray-700 text-right font-mono px-8"
            value={weight}
            onChange={handleWeightChange}
            onBlur={handleUpdate}
          />
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 absolute right-0 text-gray-400 hover:text-white"
            onClick={() => handleWeightIncrement(2.5)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <span className="ml-2 text-xs text-gray-400">{weightUnit}</span>
      </div>
      
      {/* Reps input with increment/decrement buttons */}
      <div className="col-span-1 flex items-center relative">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7 absolute left-0 text-gray-400 hover:text-white"
          onClick={() => handleRepsIncrement(-1)}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        
        <Input
          type="number"
          className="bg-gray-800 border-gray-700 text-right font-mono px-8"
          value={reps}
          onChange={handleRepsChange}
          onBlur={handleUpdate}
        />
        
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7 absolute right-0 text-gray-400 hover:text-white"
          onClick={() => handleRepsIncrement(1)}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Rest time input with increment/decrement buttons */}
      <div className="col-span-2 flex items-center">
        <div className="flex-1 flex items-center relative">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 absolute left-0 text-gray-400 hover:text-white"
            onClick={() => handleRestTimeIncrement(-15)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          <Input
            type="number"
            className="bg-gray-800 border-gray-700 text-right font-mono px-8"
            value={restTime.toString()}
            onChange={handleRestTimeChange}
            onBlur={handleUpdate}
          />
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 absolute right-0 text-gray-400 hover:text-white"
            onClick={() => handleRestTimeIncrement(15)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center ml-2">
          <span className="text-xs text-gray-400 mr-1">s</span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onTimerStart}
            className="h-7 w-7 text-gray-400 hover:text-purple-400"
          >
            <Timer className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Completed checkbox */}
      <div className="col-span-1 flex justify-center">
        <Checkbox
          checked={completed}
          onCheckedChange={handleCompletedChange}
          className="border-gray-700 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
          onBlur={handleUpdate}
        />
      </div>
      
      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
          <DropdownMenuItem 
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
