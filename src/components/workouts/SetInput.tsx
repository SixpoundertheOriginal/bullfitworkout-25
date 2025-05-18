
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronUp, ChevronDown } from 'lucide-react';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { useHaptics } from '@/hooks/use-haptics';
import { ExerciseSet } from '@/types/exercise';

interface SetInputProps {
  set: ExerciseSet;
  exerciseName: string;
  index: number;
  onComplete: () => void;
  onWeightChange?: (value: string) => void;
  onRepsChange?: (value: string) => void;
}

export const SetInput: React.FC<SetInputProps> = ({
  set,
  exerciseName,
  index,
  onComplete,
  onWeightChange,
  onRepsChange
}) => {
  const { weightUnit } = useWeightUnit();
  const { triggerHaptic } = useHaptics();
  const [weight, setWeight] = useState(set.weight ? set.weight.toString() : "0");
  const [reps, setReps] = useState(set.reps ? set.reps.toString() : "0");
  
  // Use refs for previous values to detect changes
  const prevWeightRef = useRef(weight);
  const prevRepsRef = useRef(reps);
  
  // Sync with incoming props when they change
  useEffect(() => {
    if (set.weight !== undefined) {
      setWeight(set.weight.toString());
      prevWeightRef.current = set.weight.toString();
    }
    if (set.reps !== undefined) {
      setReps(set.reps.toString());
      prevRepsRef.current = set.reps.toString();
    }
  }, [set.weight, set.reps]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setWeight(newValue);
    
    // Update parent immediately to prevent data loss
    if (onWeightChange) {
      onWeightChange(newValue);
    }
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setReps(newValue);
    
    // Update parent immediately to prevent data loss
    if (onRepsChange) {
      onRepsChange(newValue);
    }
  };

  const handleWeightIncrement = (inc: number) => {
    const currentWeight = parseFloat(weight) || 0;
    const newValue = (currentWeight + inc).toString();
    setWeight(newValue);
    
    triggerHaptic('light');
    
    // Update parent
    if (onWeightChange) {
      onWeightChange(newValue);
    }
  };

  const handleRepsIncrement = (inc: number) => {
    const currentReps = parseInt(reps) || 0;
    const newValue = Math.max(1, currentReps + inc).toString();
    setReps(newValue);
    
    triggerHaptic('light');
    
    // Update parent
    if (onRepsChange) {
      onRepsChange(newValue);
    }
  };

  const handleComplete = () => {
    triggerHaptic('success');
    onComplete();
  };

  // Check for focus/blur to ensure values are saved
  const handleInputBlur = () => {
    // Compare with previous values
    if (weight !== prevWeightRef.current && onWeightChange) {
      console.log(`Saving weight change on blur: ${prevWeightRef.current} -> ${weight}`);
      onWeightChange(weight);
      prevWeightRef.current = weight;
    }
    
    if (reps !== prevRepsRef.current && onRepsChange) {
      console.log(`Saving reps change on blur: ${prevRepsRef.current} -> ${reps}`);
      onRepsChange(reps);
      prevRepsRef.current = reps;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-md p-3">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Weight ({weightUnit})</label>
          <div className="flex">
            <Input
              type="number"
              value={weight}
              onChange={handleWeightChange}
              onBlur={handleInputBlur}
              className="bg-gray-800 border-gray-700"
            />
            <div className="flex flex-col ml-2">
              <Button
                variant="outline" 
                size="sm"
                className="px-2 py-0 h-6 bg-gray-800 border-gray-700"
                onClick={() => handleWeightIncrement(2.5)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" 
                size="sm"
                className="px-2 py-0 h-6 mt-1 bg-gray-800 border-gray-700"
                onClick={() => handleWeightIncrement(-2.5)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Reps</label>
          <div className="flex">
            <Input
              type="number"
              value={reps}
              onChange={handleRepsChange}
              onBlur={handleInputBlur}
              className="bg-gray-800 border-gray-700"
            />
            <div className="flex flex-col ml-2">
              <Button
                variant="outline" 
                size="sm"
                className="px-2 py-0 h-6 bg-gray-800 border-gray-700"
                onClick={() => handleRepsIncrement(1)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" 
                size="sm"
                className="px-2 py-0 h-6 mt-1 bg-gray-800 border-gray-700"
                onClick={() => handleRepsIncrement(-1)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleComplete}
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={set.completed}
      >
        {set.completed ? (
          <span className="flex items-center">
            <Check className="mr-2 h-4 w-4" />
            Completed
          </span>
        ) : (
          "Complete Set"
        )}
      </Button>
    </div>
  );
};
