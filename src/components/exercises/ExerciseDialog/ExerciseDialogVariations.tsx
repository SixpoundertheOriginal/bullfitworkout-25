
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExerciseFormState } from '@/hooks/useExerciseFormState';
import { Variation, VariationType, VARIATION_TYPES, getVariationLabel, getDefaultValueForType, getVariationValueSuggestions, getVariationTypeDescriptions } from '@/types/exerciseVariation';
import { X, Plus, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';

interface ExerciseDialogVariationsProps {
  exercise: ExerciseFormState;
  onAddVariation: (variation: Variation) => void;
  onRemoveVariation: (index: number) => void;
}

export const ExerciseDialogVariations = React.memo(function ExerciseDialogVariations({
  exercise,
  onAddVariation,
  onRemoveVariation
}: ExerciseDialogVariationsProps) {
  const [newVariationType, setNewVariationType] = useState<VariationType>('grip');
  const [newVariationValue, setNewVariationValue] = useState<string>(getDefaultValueForType('grip'));
  const [showHelp, setShowHelp] = useState(false);
  const suggestions = getVariationValueSuggestions(newVariationType);
  const typeDescriptions = getVariationTypeDescriptions();

  const handleAddVariation = () => {
    if (newVariationType && newVariationValue.trim()) {
      // Check for duplicates
      const isDuplicate = exercise.variationList?.some(
        v => v.type === newVariationType && v.value.toLowerCase() === newVariationValue.trim().toLowerCase()
      );
      
      if (!isDuplicate) {
        onAddVariation({
          type: newVariationType,
          value: newVariationValue.trim()
        });
        // Reset value but keep the type
        setNewVariationValue(getDefaultValueForType(newVariationType));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Help section */}
      <Card className="p-3 bg-blue-900/20 border-blue-800/30 text-sm text-blue-100">
        <div className="flex items-start gap-2">
          <HelpCircle className="h-5 w-5 text-blue-300 shrink-0 mt-0.5" />
          <div>
            <p className="mb-1">
              <strong>Variations</strong> allow you to create different versions of the same base exercise.
            </p>
            <p>
              For example, you can add variations like "wide grip" or "incline" to exercises like "Push-up" or "Bench Press".
            </p>
          </div>
        </div>
        <Button 
          variant="link" 
          className="text-blue-300 p-0 h-auto text-xs mt-2"
          onClick={() => setShowHelp(!showHelp)}
        >
          {showHelp ? "Hide details" : "Show variation types"}
        </Button>
        
        {showHelp && (
          <div className="mt-3 grid grid-cols-1 gap-2 pt-2 border-t border-blue-800/30">
            {VARIATION_TYPES.map(type => (
              <div key={type} className="text-xs">
                <span className="font-semibold text-blue-200">{getVariationLabel(type)}:</span> {typeDescriptions[type]}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Exercise Variations</h3>
        {exercise.variationList && exercise.variationList.length > 0 ? (
          <div className="flex flex-col gap-2 mb-4">
            {exercise.variationList.map((variation, index) => (
              <div 
                key={index}
                className="flex items-center justify-between gap-2 bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-900/50 text-purple-100">
                    {variation.type}
                  </Badge>
                  <span>{variation.value}</span>
                </div>
                <button
                  onClick={() => onRemoveVariation(index)}
                  className="text-gray-400 hover:text-gray-200 focus:outline-none"
                  aria-label="Remove variation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 mb-4 p-4 border border-dashed border-gray-700 rounded-md text-center">
            <p>No variations added yet</p>
            <p className="text-xs mt-1">Variations help organize similar exercises</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 pt-4">
        <h3 className="text-sm font-medium mb-2">Add New Variation</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="variation-type">Variation Type</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="block w-full">
                    <Select 
                      value={newVariationType} 
                      onValueChange={(value) => {
                        setNewVariationType(value as VariationType);
                        setNewVariationValue(getDefaultValueForType(value as VariationType));
                      }}
                    >
                      <SelectTrigger id="variation-type">
                        <SelectValue placeholder="Select variation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VARIATION_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {getVariationLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{typeDescriptions[newVariationType]}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div>
            <Label htmlFor="variation-value">Value</Label>
            <Input
              id="variation-value"
              value={newVariationValue}
              onChange={(e) => setNewVariationValue(e.target.value)}
              placeholder="e.g. Wide, 30°, Sumo, etc."
              list="variation-suggestions"
            />
            <datalist id="variation-suggestions">
              {suggestions.map((suggestion, i) => (
                <option key={i} value={suggestion} />
              ))}
            </datalist>
          </div>
        </div>
        
        <Button 
          onClick={handleAddVariation}
          className="mt-4 w-full"
          size="sm"
          type="button"
          disabled={!newVariationType || !newVariationValue.trim()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Variation
        </Button>
      </div>
    </div>
  );
});
