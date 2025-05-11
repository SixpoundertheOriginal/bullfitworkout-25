
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExerciseFormState } from '@/hooks/useExerciseFormState';
import { Variation, VariationType, VARIATION_TYPES, getVariationLabel, getDefaultValueForType, getVariationValueSuggestions } from '@/types/exerciseVariation';
import { X, Plus } from 'lucide-react';

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
  const [newVariationValue, setNewVariationValue] = useState<string>('');
  const suggestions = getVariationValueSuggestions(newVariationType);

  const handleAddVariation = () => {
    if (newVariationType && newVariationValue.trim()) {
      onAddVariation({
        type: newVariationType,
        value: newVariationValue.trim()
      });
      // Reset form
      setNewVariationValue('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Existing Variations</h3>
        {exercise.variationList && exercise.variationList.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {exercise.variationList.map((variation, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center gap-1 px-2 py-1"
              >
                <span className="font-medium text-gray-500">{variation.type}:</span>
                <span>{variation.value}</span>
                <button
                  onClick={() => onRemoveVariation(index)}
                  className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No variations added yet.</p>
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Add New Variation</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="variation-type">Variation Type</Label>
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
          className="mt-4"
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
