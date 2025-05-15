
import React, { useMemo } from 'react';
import { Exercise } from '@/types/exercise';
import { CommonExerciseCard } from './CommonExerciseCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useExercises } from '@/hooks/useExercises';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Variation } from '@/types/exerciseVariation';
import { ChevronRight, Edit, Trash } from 'lucide-react';

interface ExerciseVariationGroupProps {
  baseExercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onAddVariation?: (exercise: Exercise) => void;
}

export const ExerciseVariationGroup: React.FC<ExerciseVariationGroupProps> = React.memo(({
  baseExercise,
  onSelect,
  onEdit,
  onDelete,
  onAddVariation
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
    <div className="space-y-2 transition-all">
      {/* Base Exercise Card */}
      <CommonExerciseCard 
        exercise={baseExercise}
        variant="list"
        onSelect={onSelect ? () => onSelect(baseExercise) : undefined}
        onEdit={onEdit ? () => onEdit(baseExercise) : undefined}
        onDelete={onDelete ? () => onDelete(baseExercise) : undefined}
        rightContent={
          <div className="flex items-center gap-2">
            {hasVariations ? (
              <Badge 
                variant="outline" 
                className="bg-gray-800/70 hover:bg-gray-700 text-gray-300 flex items-center gap-1"
              >
                {variations.length} variation{variations.length !== 1 ? 's' : ''}
                <ChevronRight className="h-3 w-3" />
              </Badge>
            ) : (
              onAddVariation && (
                <Badge 
                  variant="outline" 
                  className="bg-purple-900/30 hover:bg-purple-800/50 border-purple-700/30 text-purple-300 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddVariation(baseExercise);
                  }}
                >
                  Add variation
                </Badge>
              )
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(baseExercise);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(baseExercise);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        }
      />
      
      {/* Variations Accordion */}
      {hasVariations && (
        <div className="ml-8 mt-1 transition-all">
          <Accordion type="single" collapsible className="border-l-2 border-gray-800 pl-4">
            <AccordionItem value="variations" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline group">
                <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 flex items-center">
                  Variations 
                  <span className="ml-2 bg-gray-800/50 text-xs px-2 py-0.5 rounded-full">
                    {variations.length}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="animate-accordion-down space-y-2 pt-1">
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
                        className="border-gray-800 hover:border-purple-600/50 transition-colors"
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
                        rightContent={
                          <div className="flex items-center gap-2">
                            {onEdit && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(variation);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(variation);
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        }
                      />
                    </div>
                  );
                })}
                
                {/* Add variation button */}
                {onAddVariation && (
                  <div className="pl-4 relative">
                    <div className="absolute left-0 top-0 bottom-1/2 w-0.5 bg-gray-800"></div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-1 bg-gray-800/30 border-gray-700/50 hover:bg-purple-900/30 hover:border-purple-700/50 text-gray-300 hover:text-purple-100"
                      onClick={() => onAddVariation(baseExercise)}
                    >
                      Add variation
                    </Button>
                  </div>
                )}
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
