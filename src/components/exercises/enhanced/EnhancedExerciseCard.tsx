
import React, { useState } from 'react';
import { Exercise } from '@/types/exercise';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Edit, Plus, Trash2, Copy, Dumbbell, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface EnhancedExerciseCardProps {
  exerciseName: string;
  exerciseData?: Exercise;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddVariation?: () => void;
  isVariation?: boolean;
  className?: string;
  expanded?: boolean;
  toggleExpand?: () => void;
  variations?: Exercise[];
}

export function EnhancedExerciseCard({
  exerciseName,
  exerciseData,
  onEdit,
  onDelete,
  onAddVariation,
  isVariation = false,
  className,
  expanded = false,
  toggleExpand,
  variations = []
}: EnhancedExerciseCardProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  // Get variation types from metadata if available
  const exerciseVariations = exerciseData?.metadata?.variations || [];
  
  // Generate a summary of muscles targeted
  const primaryMuscles = exerciseData?.primary_muscle_groups || [];
  const secondaryMuscles = exerciseData?.secondary_muscle_groups || [];
  
  // Get equipment information
  const equipment = exerciseData?.equipment_type || [];
  const isBodyweight = exerciseData?.metadata?.is_bodyweight || equipment.includes('bodyweight');
  
  return (
    <Card className={cn(
      "transition-all duration-200 border-gray-800 bg-gray-900/50",
      isVariation && "border-l-4 border-l-purple-700",
      className
    )}>
      <CardHeader className={cn("pb-3", isVariation && "py-3")}>
        <div className="flex items-start justify-between">
          <CardTitle className={cn(
            "text-lg flex items-start gap-2",
            isVariation && "text-base"
          )}>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-gray-400 shrink-0" />
              <span>{exerciseName}</span>
            </div>
          </CardTitle>
          
          <div className="flex gap-1">
            {onAddVariation && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onAddVariation}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-gray-200">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                      <Edit className="h-4 w-4 mr-2" /> Edit Exercise
                    </DropdownMenuItem>
                  )}
                  {onAddVariation && (
                    <DropdownMenuItem onClick={onAddVariation} className="cursor-pointer">
                      <Copy className="h-4 w-4 mr-2" /> Add Variation
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={onDelete} 
                      className="cursor-pointer text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {toggleExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpand}
                className="h-8 w-8 p-0"
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        "space-y-3",
        isVariation && "py-1"
      )}>
        {/* Description */}
        {exerciseData?.description && (
          <p className="text-sm text-gray-300 line-clamp-2">
            {exerciseData.description}
          </p>
        )}
        
        {/* Muscles and attributes */}
        {!isVariation && (
          <div className="flex flex-wrap gap-2 items-center">
            {primaryMuscles.slice(0, 3).map(muscle => (
              <Badge key={muscle} className="bg-purple-700/60 hover:bg-purple-700/80">
                {muscle}
              </Badge>
            ))}
            
            {secondaryMuscles.slice(0, 1).map(muscle => (
              <Badge key={muscle} variant="outline" className="bg-transparent border-gray-600">
                {muscle}
              </Badge>
            ))}
            
            {primaryMuscles.length > 3 && (
              <Badge variant="outline" className="bg-transparent border-gray-600">
                +{primaryMuscles.length - 3} more
              </Badge>
            )}
            
            {exerciseData?.is_compound && (
              <Badge className="bg-blue-700/60 hover:bg-blue-700/80">
                Compound
              </Badge>
            )}
            
            {isBodyweight && (
              <Badge className="bg-green-700/60 hover:bg-green-700/80">
                Bodyweight
              </Badge>
            )}
          </div>
        )}
        
        {/* Variation info */}
        {isVariation && exerciseVariations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {exerciseVariations.slice(0, 2).map((variation, i) => (
              <Badge key={i} className="bg-purple-700/40 hover:bg-purple-700/60">
                {variation.type}: {variation.value}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Equipment */}
        {!isVariation && equipment.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-xs text-gray-400">Equipment:</span>
            {equipment.slice(0, 2).map(item => (
              <span key={item} className="text-xs text-gray-300 capitalize">
                {item}{equipment.indexOf(item) < Math.min(equipment.length, 2) - 1 ? ',' : ''}
              </span>
            ))}
            {equipment.length > 2 && (
              <span className="text-xs text-gray-400">
                +{equipment.length - 2} more
              </span>
            )}
          </div>
        )}
        
        {/* Expanded section - instructions */}
        {expanded && exerciseData?.instructions?.steps && exerciseData.instructions.steps.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="mb-2 text-gray-300"
            >
              {showInstructions ? 'Hide Instructions' : 'Show Instructions'} 
              {showInstructions ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
            
            {showInstructions && (
              <div className="space-y-2 mt-2 pl-2 border-l-2 border-gray-800">
                {exerciseData.instructions.steps.map((step, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-semibold text-gray-300">{i+1}.</span> {step}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Expanded section - variations */}
        {expanded && variations && variations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h4 className="text-sm font-medium mb-3">Variations</h4>
            <div className="space-y-2">
              {variations.map(variation => (
                <EnhancedExerciseCard
                  key={variation.id}
                  exerciseName={variation.name}
                  exerciseData={variation}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isVariation
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Only show footer with expansion toggle when there are variations */}
      {!isVariation && variations && variations.length > 0 && !expanded && (
        <CardFooter className="pt-0 pb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleExpand} 
            className="w-full justify-center text-gray-400 hover:text-gray-200"
          >
            Show {variations.length} Variation{variations.length !== 1 ? 's' : ''} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
