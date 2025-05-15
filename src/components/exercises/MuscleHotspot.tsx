
import React from 'react';
import { cn } from '@/lib/utils';
import { MusclePosition } from '@/utils/musclePositions';

interface MuscleHotspotProps {
  muscle: string;
  isPrimary: boolean;
  isSecondary: boolean;
  position: MusclePosition;
  onPrimarySelect: (muscle: string) => void;
  onContextMenu: (e: React.MouseEvent, muscle: string) => void;
}

export function MuscleHotspot({ 
  muscle, 
  isPrimary, 
  isSecondary, 
  position, 
  onPrimarySelect, 
  onContextMenu 
}: MuscleHotspotProps) {
  // Early return if position should not be displayed
  if (position.display === 'none') {
    return null;
  }
  
  return (
    <div 
      onClick={() => onPrimarySelect(muscle)}
      onContextMenu={(e) => onContextMenu(e, muscle)}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer",
        "transition-all duration-200 ease-in-out hover:opacity-90",
        "flex items-center justify-center text-xs font-medium",
        isPrimary ? "bg-purple-600/70" : 
        isSecondary ? "bg-blue-600/70" : 
        "bg-gray-600/30 hover:bg-gray-500/30"
      )}
      style={{
        top: position.top,
        left: position.left,
        right: position.right,
        width: position.width,
        height: position.height,
        zIndex: isPrimary || isSecondary ? 2 : 1
      }}
      title={muscle}
    >
      {(isPrimary || isSecondary) && (
        <span className="capitalize text-white text-opacity-90">
          {muscle.length > 8 ? `${muscle.substring(0, 6)}...` : muscle}
        </span>
      )}
    </div>
  );
}
