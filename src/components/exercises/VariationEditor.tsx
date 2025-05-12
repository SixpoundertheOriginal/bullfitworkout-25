import React, { useState } from 'react';
import { Variation, VARIATION_TYPES, getVariationLabel, getVariationValueSuggestions } from '@/types/exerciseVariation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash, Edit, Check, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VariationEditorProps {
  variations: Variation[];
  onChange: (variations: Variation[]) => void;
}

export function VariationEditor({ variations, onChange }: VariationEditorProps) {
  const [newType, setNewType] = useState<string>("");
  const [newValue, setNewValue] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  
  const suggestedValues = newType ? getVariationValueSuggestions(newType as any) : [];

  // Add a new variation
  const addVariation = () => {
    if (newType && newValue.trim()) {
      const newVariation: Variation = {
        type: newType as any,
        value: newValue.trim()
      };
      onChange([...variations, newVariation]);
      setNewType("");
      setNewValue("");
    }
  };

  // Remove a variation
  const removeVariation = (index: number) => {
    onChange(variations.filter((_, i) => i !== index));
  };

  // Start editing a variation
  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(variations[index].value);
  };

  // Save edited variation
  const saveEdit = () => {
    if (editIndex !== null && editValue.trim()) {
      const updatedVariations = [...variations];
      updatedVariations[editIndex] = {
        ...updatedVariations[editIndex],
        value: editValue.trim()
      };
      onChange(updatedVariations);
      setEditIndex(null);
      setEditValue("");
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (value: string) => {
    if (editIndex !== null) {
      setEditValue(value);
    } else {
      setNewValue(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Variations */}
      <div className="space-y-2">
        <Label className="mb-2 block">Current Variations</Label>
        
        {variations.length === 0 && (
          <div className="text-center py-4 text-gray-500 border border-dashed border-gray-800 rounded-md">
            No variations added yet. Add your first variation below.
          </div>
        )}
        
        <div className="space-y-2">
          {variations.map((variation, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-center justify-between p-3 rounded-md",
                editIndex === index ? "border border-purple-600/50 bg-purple-900/10" : "border border-gray-800 bg-gray-900/30"
              )}
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize bg-gray-800 text-gray-300">
                  {variation.type}
                </Badge>
                
                {editIndex === index ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-32 sm:w-44"
                    autoFocus
                  />
                ) : (
                  <span>{variation.value}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {editIndex === index ? (
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
                  onClick={() => removeVariation(index)}
                  className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Variation */}
      <Card className="border-gray-800">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-3">Add New Variation</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 sm:items-end">
            <div className="sm:col-span-3">
              <Label htmlFor="variation-type" className="mb-1.5 block">Type</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger id="variation-type">
                  <SelectValue placeholder="Select type" />
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
            
            <div className="sm:col-span-3">
              <Label htmlFor="variation-value" className="mb-1.5 block">Value</Label>
              <Input
                id="variation-value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g., Wide, 30°, etc."
              />
            </div>
            
            <div className="sm:col-span-1">
              <Button
                onClick={addVariation}
                disabled={!newType || !newValue.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>
          
          {/* Suggestions */}
          {newType && suggestedValues.length > 0 && (
            <div className="mt-3">
              <Label className="text-xs text-gray-400">Suggested values</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {suggestedValues.map((value, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="cursor-pointer hover:bg-gray-800"
                    onClick={() => handleSuggestionClick(value)}
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
