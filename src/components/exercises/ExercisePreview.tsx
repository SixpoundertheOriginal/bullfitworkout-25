
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dumbbell, 
  LayoutGrid, 
  ChevronRight, 
  Zap,
  MoveDiagonal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExercisePreviewProps {
  exercise: any;
  className?: string;
}

export function ExercisePreview({ exercise, className }: ExercisePreviewProps) {
  // Safely get the first few characters of the description
  const shortDescription = exercise.description?.substring(0, 120) + (exercise.description?.length > 120 ? '...' : '') || 'No description provided';

  // Map difficulty to color
  const difficultyColor = {
    'beginner': 'bg-green-700/30 text-green-400',
    'intermediate': 'bg-blue-700/30 text-blue-400',
    'advanced': 'bg-orange-700/30 text-orange-400',
    'expert': 'bg-red-700/30 text-red-400',
  }[exercise.difficulty] || 'bg-gray-700/30 text-gray-400';

  // Get the primary muscles as a string
  const primaryMuscles = Array.isArray(exercise.primary_muscle_groups) 
    ? exercise.primary_muscle_groups.slice(0, 2).join(', ') + (exercise.primary_muscle_groups.length > 2 ? ' +' + (exercise.primary_muscle_groups.length - 2) : '')
    : 'None';

  return (
    <Card className={cn("overflow-hidden backdrop-blur-sm border-gray-800", className)}>
      <CardHeader className="space-y-1 pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-gray-400" />
            <CardTitle className="text-lg">{exercise.name}</CardTitle>
          </div>
          <Badge variant="outline" className={cn("capitalize", difficultyColor)}>
            {exercise.difficulty}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">{shortDescription}</p>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-purple-400" />
            <span className="text-gray-400">Primary:</span>
            <span className="font-medium">{primaryMuscles}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MoveDiagonal className="h-4 w-4 text-blue-400" />
            <span className="text-gray-400">Pattern:</span>
            <span className="font-medium capitalize">{exercise.movement_pattern}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-400">Type:</span>
            <span className="font-medium">{exercise.is_compound ? 'Compound' : 'Isolation'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">Equipment:</span>
            <span className="font-medium capitalize">
              {Array.isArray(exercise.equipment_type) && exercise.equipment_type.length > 0
                ? exercise.equipment_type[0]
                : 'None'}
            </span>
          </div>
        </div>
        
        {exercise.tips && exercise.tips.length > 0 && (
          <>
            <Separator className="bg-gray-800" />
            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-1">QUICK TIPS</h4>
              <ul className="list-disc pl-4 text-sm space-y-1">
                {exercise.tips.slice(0, 2).map((tip: string, index: number) => (
                  <li key={index}>{tip}</li>
                ))}
                {exercise.tips.length > 2 && (
                  <li className="text-gray-500">+{exercise.tips.length - 2} more tips</li>
                )}
              </ul>
            </div>
          </>
        )}
        
        {exercise.variationList && exercise.variationList.length > 0 && (
          <>
            <Separator className="bg-gray-800" />
            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-1">VARIATIONS</h4>
              <div className="flex flex-wrap gap-1">
                {exercise.variationList.slice(0, 3).map((variation: any, index: number) => (
                  <Badge key={index} variant="outline" className="bg-gray-800/50">
                    {variation.value}
                  </Badge>
                ))}
                {exercise.variationList.length > 3 && (
                  <Badge variant="outline" className="bg-gray-800/50">
                    +{exercise.variationList.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
