import React, { useState, useEffect } from 'react';
import { ExerciseSet } from '@/types/exercise';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Trash2, Timer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  return (
    <div className="grid grid-cols-8 items-center gap-2 py-2 px-4 border-b border-gray-700 last:border-none">
      <div className="col-span-1 text-right font-mono">{exerciseSet.set_number}</div>
      <Input
        type="number"
        className="col-span-2 bg-gray-800 border-gray-700 text-right font-mono"
        value={weight}
        onChange={handleWeightChange}
        onBlur={handleUpdate}
      />
      <Input
        type="number"
        className="col-span-1 bg-gray-800 border-gray-700 text-right font-mono"
        value={reps}
        onChange={handleRepsChange}
        onBlur={handleUpdate}
      />
       <div className="col-span-2 flex items-center">
        <Input
          type="number"
          className="bg-gray-800 border-gray-700 text-right font-mono w-20 mr-2"
          value={restTime.toString()}
          onChange={handleRestTimeChange}
          onBlur={handleUpdate}
        />
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onTimerStart}
          className="h-8 w-8"
        >
          <Timer className="h-4 w-4" />
        </Button>
      </div>
      <div className="col-span-1 flex justify-center">
        <Checkbox
          checked={completed}
          onCheckedChange={handleCompletedChange}
          className="border-gray-700"
          onBlur={handleUpdate}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
