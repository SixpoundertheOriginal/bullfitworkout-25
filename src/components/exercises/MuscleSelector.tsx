
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MUSCLE_GROUP_CATEGORIES } from '@/constants/exerciseMetadata';
import { cn } from '@/lib/utils';
import { MuscleSilhouette } from './MuscleSilhouette';
import { MuscleHotspot } from './MuscleHotspot';
import { getMusclePosition } from '@/utils/musclePositions';

interface MuscleSelectorProps {
  selectedMuscles?: string[];
  selectedPrimary?: string[];
  selectedSecondary?: string[];
  onSelectMuscle?: (muscle: string) => void;
  onPrimarySelect?: (muscles: string[]) => void;
  onSecondarySelect?: (muscles: string[]) => void;
}

export function MuscleSelector({ 
  selectedMuscles = [],
  selectedPrimary = [], 
  selectedSecondary = [], 
  onSelectMuscle,
  onPrimarySelect, 
  onSecondarySelect 
}: MuscleSelectorProps) {
  // Support both new and old API
  const safePrimary = Array.isArray(selectedPrimary) ? selectedPrimary : [];
  const safeSecondary = Array.isArray(selectedSecondary) ? selectedSecondary : [];
  const safeMuscles = Array.isArray(selectedMuscles) ? selectedMuscles : [];
  
  // Handle primary muscle selection
  const handlePrimarySelect = (muscle: string) => {
    if (onSelectMuscle) {
      // If using simplified API
      onSelectMuscle(muscle);
      return;
    }
    
    if (!onPrimarySelect) return;
    
    if (safePrimary.includes(muscle)) {
      // Remove from primary
      onPrimarySelect(safePrimary.filter(m => m !== muscle));
    } else {
      // Add to primary, remove from secondary if present
      onPrimarySelect([...safePrimary, muscle]);
      if (safeSecondary.includes(muscle) && onSecondarySelect) {
        onSecondarySelect(safeSecondary.filter(m => m !== muscle));
      }
    }
  };

  // Handle secondary muscle selection
  const handleSecondarySelect = (muscle: string) => {
    if (!onSecondarySelect) return;
    
    if (safeSecondary.includes(muscle)) {
      // Remove from secondary
      onSecondarySelect(safeSecondary.filter(m => m !== muscle));
    } else {
      // Add to secondary, remove from primary if present
      onSecondarySelect([...safeSecondary, muscle]);
      if (safePrimary.includes(muscle) && onPrimarySelect) {
        onPrimarySelect(safePrimary.filter(m => m !== muscle));
      }
    }
  };

  // Toggle muscle selection status (right-click)
  const handleContextMenu = (e: React.MouseEvent, muscle: string) => {
    e.preventDefault();
    handleSecondarySelect(muscle);
  };

  // Determine if a muscle is selected based on either API
  const isMuscleSelected = (muscle: string) => {
    return safeMuscles.includes(muscle) || safePrimary.includes(muscle);
  };

  const isSecondaryMuscle = (muscle: string) => {
    return safeSecondary.includes(muscle);
  };

  // Memoize muscle hotspots to prevent unnecessary re-renders
  const muscleHotspots = useMemo(() => {
    return MUSCLE_GROUP_CATEGORIES.flatMap(category => 
      category.muscles.map(muscle => {
        const isPrimary = safePrimary.includes(muscle) || safeMuscles.includes(muscle);
        const isSecondary = safeSecondary.includes(muscle);
        const position = getMusclePosition(muscle);
        
        // Check if position has display property with 'none' value
        if (position.display === 'none') return null;
        
        return (
          <MuscleHotspot 
            key={muscle}
            muscle={muscle}
            isPrimary={isPrimary}
            isSecondary={isSecondary}
            position={position}
            onPrimarySelect={handlePrimarySelect}
            onContextMenu={handleContextMenu}
          />
        );
      })
    ).filter(Boolean); // Filter out null values
  }, [safePrimary, safeSecondary, safeMuscles]);

  return (
    <Card className="border-gray-800 bg-gray-900/60 overflow-hidden">
      <CardContent className="p-4">
        <div className="mb-3 text-center">
          <div className="flex justify-center space-x-4 mb-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-600 mr-1"></div>
              <span>Primary</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-600 mr-1"></div>
              <span>Secondary</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">Click to select primary, right-click for secondary</p>
        </div>
        
        <div className="relative w-full aspect-[3/5] overflow-hidden rounded-lg bg-gray-800/50">
          {/* Male silhouette SVG */}
          <MuscleSilhouette className="w-full h-full opacity-50" />
          
          {/* Clickable muscle regions */}
          <div className="absolute inset-0">
            {muscleHotspots}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
