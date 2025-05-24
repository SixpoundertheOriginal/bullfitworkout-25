
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExerciseSet } from "@/types/exercise";
import { Check, Clock, Edit, MinusCircle, PlusCircle, Save, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedTooltip } from "@/components/ui/enhanced-tooltip";

interface SetRowProps {
  set: ExerciseSet;
  index: number;
  onComplete: () => void;
  onEdit: () => void;
  onSave: () => void;
  onRemove: () => void;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onRestTimeChange: (value: string) => void;
  onWeightIncrement: (increment: number) => void;
  onRepsIncrement: (increment: number) => void;
  onRestTimeIncrement: (increment: number) => void;
  onShowRestTimer: () => void;
  onResetRestTimer: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  index,
  onComplete,
  onEdit,
  onSave,
  onRemove,
  onWeightChange,
  onRepsChange,
  onRestTimeChange,
  onWeightIncrement,
  onRepsIncrement,
  onRestTimeIncrement,
  onShowRestTimer,
  onResetRestTimer
}) => {
  const getRestTimeColor = (time: number | undefined) => {
    if (!time) return "text-gray-400";
    if (time < 30) return "text-red-400";
    if (time < 60) return "text-yellow-400";
    if (time < 120) return "text-green-400";
    return "text-blue-400";
  };
  
  return (
    <div 
      className={cn(
        "grid grid-cols-12 gap-2 items-center rounded-md px-2 py-1.5 transition-colors",
        set.completed ? "bg-green-900/10 border border-green-500/20" : 
          set.isEditing ? "bg-gray-800/50 border border-gray-700" : "hover:bg-gray-800/30"
      )}
    >
      {/* Set number */}
      <div className="col-span-2 flex items-center">
        <span className={cn(
          "text-sm font-medium",
          set.completed ? "text-green-400" : "text-gray-400"
        )}>
          {index + 1}
        </span>
      </div>
      
      {/* Weight field */}
      <div className="col-span-3">
        {set.isEditing ? (
          <div className="flex items-center">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-500"
              onClick={() => onWeightIncrement(-2.5)}
            >
              <MinusCircle size={14} />
            </Button>
            <Input
              type="number"
              value={set.weight}
              onChange={(e) => onWeightChange(e.target.value)}
              className="h-7 text-center mx-1 bg-gray-800"
              min={0}
              step={2.5}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-500"
              onClick={() => onWeightIncrement(2.5)}
            >
              <PlusCircle size={14} />
            </Button>
          </div>
        ) : (
          <div className="text-center font-mono text-sm">
            {set.weight || 0}
          </div>
        )}
      </div>
      
      {/* Reps field */}
      <div className="col-span-3">
        {set.isEditing ? (
          <div className="flex items-center">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-500"
              onClick={() => onRepsIncrement(-1)}
            >
              <MinusCircle size={14} />
            </Button>
            <Input
              type="number"
              value={set.reps}
              onChange={(e) => onRepsChange(e.target.value)}
              className="h-7 text-center mx-1 bg-gray-800"
              min={0}
              step={1}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-500"
              onClick={() => onRepsIncrement(1)}
            >
              <PlusCircle size={14} />
            </Button>
          </div>
        ) : (
          <div className="text-center font-mono text-sm">
            {set.reps || 0}
          </div>
        )}
      </div>
      
      {/* Rest time field */}
      <div className="col-span-2">
        {set.isEditing ? (
          <div className="flex items-center">
            <Input
              type="number"
              value={set.restTime}
              onChange={(e) => onRestTimeChange(e.target.value)}
              className="h-7 text-center bg-gray-800"
              min={0}
              step={15}
            />
          </div>
        ) : (
          <EnhancedTooltip 
            content={`Start rest timer (${set.restTime}s)`}
            side="top"
            contentClassName="bg-gray-900 border-gray-800"
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-full p-0 text-xs font-mono flex items-center justify-center",
                getRestTimeColor(set.restTime)
              )}
              onClick={onShowRestTimer}
            >
              <Clock size={10} className="mr-1" /> 
              {set.restTime}s
            </Button>
          </EnhancedTooltip>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="col-span-2 flex justify-end space-x-1">
        {set.isEditing ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSave}
              className="h-6 w-6 p-0 hover:bg-green-900/30 hover:text-green-500"
            >
              <Save size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-6 w-6 p-0 hover:bg-red-900/30 hover:text-red-500"
            >
              <Trash2 size={14} />
            </Button>
          </>
        ) : set.completed ? (
          <div className="flex items-center text-green-400">
            <Check size={16} />
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onComplete}
              className="h-6 w-6 p-0 hover:bg-green-900/30 hover:text-green-500"
            >
              <Check size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-6 w-6 p-0 hover:bg-gray-700"
            >
              <Edit size={14} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
