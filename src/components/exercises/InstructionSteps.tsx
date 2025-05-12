
import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Edit, 
  Trash, 
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface InstructionStepsProps {
  value: string;
  onChange: (value: string) => void;
}

export function InstructionSteps({ value, onChange }: InstructionStepsProps) {
  const [steps, setSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // Parse the value string into steps
  useEffect(() => {
    if (value) {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setSteps(parsed);
          return;
        }
      } catch (e) {
        // If not valid JSON, split by newlines or numbered list
        const splitLines = value
          .split(/\n|(?=\d+\.)/g)
          .map(line => line.trim())
          .filter(line => line)
          .map(line => line.replace(/^\d+\.\s*/, '')); // Remove leading numbers
        
        setSteps(splitLines);
      }
    } else {
      setSteps([]);
    }
  }, [value]);

  // Update the parent component with serialized steps
  const updateSteps = (newSteps: string[]) => {
    setSteps(newSteps);
    try {
      onChange(JSON.stringify(newSteps));
    } catch (e) {
      onChange(newSteps.join('\n'));
    }
  };

  // Add a new step
  const addStep = () => {
    if (newStep.trim()) {
      const updatedSteps = [...steps, newStep.trim()];
      updateSteps(updatedSteps);
      setNewStep('');
    }
  };

  // Start editing a step
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(steps[index]);
  };

  // Save the edited step
  const saveEdit = () => {
    if (editingIndex !== null) {
      const updatedSteps = [...steps];
      updatedSteps[editingIndex] = editValue.trim();
      updateSteps(updatedSteps);
      setEditingIndex(null);
      setEditValue('');
    }
  };

  // Delete a step
  const deleteStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    updateSteps(updatedSteps);
  };

  // Move a step up
  const moveStepUp = (index: number) => {
    if (index > 0) {
      const updatedSteps = [...steps];
      [updatedSteps[index - 1], updatedSteps[index]] = [updatedSteps[index], updatedSteps[index - 1]];
      updateSteps(updatedSteps);
    }
  };

  // Move a step down
  const moveStepDown = (index: number) => {
    if (index < steps.length - 1) {
      const updatedSteps = [...steps];
      [updatedSteps[index], updatedSteps[index + 1]] = [updatedSteps[index + 1], updatedSteps[index]];
      updateSteps(updatedSteps);
    }
  };

  return (
    <div className="space-y-3">
      {/* List of steps */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex group relative rounded-md border border-gray-800 bg-gray-900/30 p-3">
            <div className="mr-3 flex-none text-lg font-medium text-gray-400">
              {index + 1}.
            </div>
            <div className="flex-grow">
              {editingIndex === index ? (
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="min-h-[60px]"
                  autoFocus
                />
              ) : (
                <p className="text-sm">{step}</p>
              )}
            </div>
            <div className={`flex items-start space-x-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
              {editingIndex === index ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={saveEdit}
                  className="h-7 w-7"
                >
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(index)}
                  className="h-7 w-7"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteStep(index)}
                className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-900/20"
              >
                <Trash className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => moveStepUp(index)}
                className="h-7 w-7"
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => moveStepDown(index)}
                className="h-7 w-7"
                disabled={index === steps.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {steps.length === 0 && (
          <div className="text-center py-4 text-gray-500 border border-dashed border-gray-800 rounded-md">
            No steps added yet. Add your first instruction below.
          </div>
        )}
      </div>
      
      {/* Add new step */}
      <div className="flex gap-2 items-center mt-4">
        <Input
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          placeholder="Add a new step..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              addStep();
            }
          }}
        />
        <Button variant="outline" onClick={addStep}>
          <Plus className="h-4 w-4 mr-1" /> Add Step
        </Button>
      </div>
    </div>
  );
}
