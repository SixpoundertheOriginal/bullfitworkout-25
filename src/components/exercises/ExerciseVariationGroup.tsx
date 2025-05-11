
import React, { useMemo } from 'react';
import { Exercise } from '@/types/exercise';
import { CommonExerciseCard } from './CommonExerciseCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useExercises } from '@/hooks/useExercises';
import { Badge } from '@/components/ui/badge';
import { Variation } from '@/types/exerciseVariation';
import { ChevronDown } from 'lucide-react';

interface ExerciseVariationGroupProps {
  baseExercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
}

export const ExerciseVariationGroup: React.FC<ExerciseVariationGroupProps> = React.memo(({
  baseExercise,
  onSelect,
  onEdit,
  onDelete
}) => {
  const { getVariationsForExercise } = useExercises();
  
  // Memoize variations to prevent unnecessary re-renders
  const variations = useMemo(() => {
    return getVariationsForExercise(baseExercise.id);
  }, [baseExercise.id, getVariationsForExercise]);
  
  // Get variation list from metadata if available
  const getVariationList = (exercise: Exercise): Variation[] => {
    if (exercise.metadata && Array.isArray(exercise.metadata.variations)) {
      return exercise.metadata.variations;
    }
    
    // If we have legacy variation fields but no list in metadata, create a single variation
    if (exercise.variation_type && exercise.variation_value) {
      return [{
        type: exercise.variation_type as any,
        value: exercise.variation_value
      }];
    }
    
    return [];
  };
  
  // Only show accordion if there are variations
  const hasVariations = variations.length > 0;
  
  return (
    <div className="space-y-2">
      {/* Base Exercise Card */}
      <CommonExerciseCard 
        exercise={baseExercise}
        variant="list"
        onSelect={onSelect ? () => onSelect(baseExercise) : undefined}
        onEdit={onEdit ? () => onEdit(baseExercise) : undefined}
        onDelete={onDelete ? () => onDelete(baseExercise) : undefined}
        rightContent={
          hasVariations ? (
            <Badge 
              variant="outline" 
              className="bg-gray-800 hover:bg-gray-700 text-gray-300"
            >
              {variations.length} variation{variations.length !== 1 ? 's' : ''}
            </Badge>
          ) : null
        }
      />
      
      {/* Variations Accordion */}
      {hasVariations && (
        <div className="ml-8 mt-1">
          <Accordion type="single" collapsible className="border-l-2 border-gray-800 pl-4">
            <AccordionItem value="variations" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline">
                <span className="text-sm font-medium text-gray-400">Variations</span>
              </AccordionTrigger>
              <AccordionContent className="animate-fade-in">
                <div className="space-y-2 pt-2">
                  {variations.map((variation) => {
                    // Get variation list for this exercise
                    const variationList = getVariationList(variation);
                    
                    return (
                      <div key={variation.id} className="relative pl-4">
                        {/* Connecting line */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-800"></div>
                        
                        <CommonExerciseCard
                          exercise={variation}
                          variant="list"
                          isVariation={true}
                          onSelect={onSelect ? () => onSelect(variation) : undefined}
                          onEdit={onEdit ? () => onEdit(variation) : undefined}
                          onDelete={onDelete ? () => onDelete(variation) : undefined}
                          className="border-gray-800 hover:border-purple-600/30"
                          variationBadge={
                            variationList.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {variationList.map((v, i) => (
                                  <Badge 
                                    key={i}
                                    variant="outline" 
                                    className="bg-purple-900/20 text-xs border-purple-700/30 text-purple-300"
                                  >
                                    {v.type}: {v.value}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <Badge 
                                variant="outline" 
                                className="bg-purple-900/20 text-xs border-purple-700/30 text-purple-300"
                              >
                                {variation.variation_type}: {variation.variation_value}
                              </Badge>
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
});

ExerciseVariationGroup.displayName = 'ExerciseVariationGroup';

export default ExerciseVariationGroup;
