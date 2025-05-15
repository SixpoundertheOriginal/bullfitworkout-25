
import React from 'react';
import { Exercise } from '@/types/exercise';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dumbbell, 
  LayoutGrid, 
  ArrowRight, 
  Zap,
  Image as ImageIcon,
  ChevronRight,
  MoveDiagonal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Variation } from '@/types/exerciseVariation';
import { Button } from '@/components/ui/button';

interface ExerciseDetailViewProps {
  exercise: Exercise | null;
  onClose?: () => void;
  onEditExercise?: (exercise: Exercise) => void;
}

export function ExerciseDetailView({ exercise, onClose, onEditExercise }: ExerciseDetailViewProps) {
  if (!exercise) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p className="text-gray-400">Select an exercise to view details</p>
      </Card>
    );
  }

  const variationList = exercise.metadata?.variations || [];
  
  // Get primary muscles as a string
  const primaryMuscles = Array.isArray(exercise.primary_muscle_groups) 
    ? exercise.primary_muscle_groups.join(', ')
    : 'None';
    
  // Get secondary muscles as a string  
  const secondaryMuscles = Array.isArray(exercise.secondary_muscle_groups) && exercise.secondary_muscle_groups.length > 0
    ? exercise.secondary_muscle_groups.join(', ')
    : 'None';
    
  // Map difficulty to color
  const difficultyColor = {
    'beginner': 'bg-green-700/30 text-green-400',
    'intermediate': 'bg-blue-700/30 text-blue-400',
    'advanced': 'bg-orange-700/30 text-orange-400',
    'expert': 'bg-red-700/30 text-red-400',
  }[exercise.difficulty] || 'bg-gray-700/30 text-gray-400';

  // Get equipment as a string
  const equipmentList = Array.isArray(exercise.equipment_type) && exercise.equipment_type.length > 0
    ? exercise.equipment_type.join(', ')
    : 'None';

  return (
    <Card className="h-full flex flex-col border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950">
      <CardHeader className="flex flex-row justify-between items-start pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-semibold">{exercise.name}</h2>
          </div>
          <Badge variant="outline" className={cn("capitalize", difficultyColor)}>
            {exercise.difficulty}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {onEditExercise && (
            <Button 
              size="sm"
              variant="outline"
              className="bg-gray-800/50 hover:bg-gray-700"
              onClick={() => onEditExercise(exercise)}
            >
              Edit
            </Button>
          )}
          {onClose && (
            <Button 
              size="sm"
              variant="ghost"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden pt-0">
        <ScrollArea className="h-full pr-4">
          {/* Image Placeholder */}
          <div className="rounded-md bg-gray-800/50 border border-gray-700 h-52 mb-4 flex items-center justify-center relative overflow-hidden group">
            {exercise.media_url ? (
              <img 
                src={exercise.media_url} 
                alt={exercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No image available</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Button variant="outline" size="sm" className="bg-black/50">
                {exercise.media_url ? 'Change Image' : 'Add Image'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Description */}
            <div>
              <h3 className="text-sm text-gray-400 uppercase font-medium mb-2">Description</h3>
              <p className="text-gray-200">
                {exercise.description || "No description provided."}
              </p>
            </div>
            
            <Separator className="bg-gray-800" />
            
            {/* Exercise Details */}
            <div>
              <h3 className="text-sm text-gray-400 uppercase font-medium mb-2">Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-400 w-32">Primary Muscles:</span>
                  <span>{primaryMuscles}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-400 w-32">Secondary Muscles:</span>
                  <span>{secondaryMuscles}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MoveDiagonal className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-400 w-32">Movement Pattern:</span>
                  <span className="capitalize">{exercise.movement_pattern}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  <span className="text-gray-400 w-32">Type:</span>
                  <span>{exercise.is_compound ? 'Compound' : 'Isolation'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400 w-32">Equipment:</span>
                  <span className="capitalize">{equipmentList}</span>
                </div>
              </div>
            </div>
            
            {/* Instructions */}
            {exercise.instructions && Object.keys(exercise.instructions).length > 0 && (
              <>
                <Separator className="bg-gray-800" />
                <div>
                  <h3 className="text-sm text-gray-400 uppercase font-medium mb-2">Instructions</h3>
                  <ol className="list-decimal ml-5 space-y-1">
                    {Object.entries(exercise.instructions)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([key, value]) => (
                        <li key={key}>{value as string}</li>
                      ))
                    }
                  </ol>
                </div>
              </>
            )}
            
            {/* Tips */}
            {exercise.tips && exercise.tips.length > 0 && (
              <>
                <Separator className="bg-gray-800" />
                <div>
                  <h3 className="text-sm text-gray-400 uppercase font-medium mb-2">Tips</h3>
                  <ul className="list-disc ml-5 space-y-1">
                    {exercise.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            
            {/* Variations */}
            {variationList && variationList.length > 0 && (
              <>
                <Separator className="bg-gray-800" />
                <div>
                  <h3 className="text-sm text-gray-400 uppercase font-medium mb-2">Variations</h3>
                  <div className="flex flex-wrap gap-1">
                    {variationList.map((variation: Variation, index: number) => (
                      <Badge key={index} variant="outline" className="bg-purple-900/20 border-purple-700/30 text-purple-300">
                        {variation.type}: {variation.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
