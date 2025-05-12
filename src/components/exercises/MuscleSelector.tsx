
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MUSCLE_GROUP_CATEGORIES } from '@/constants/exerciseMetadata';
import { cn } from '@/lib/utils';

interface MuscleSelectorProps {
  selectedPrimary: string[];
  selectedSecondary: string[];
  onPrimarySelect: (muscles: string[]) => void;
  onSecondarySelect: (muscles: string[]) => void;
}

export function MuscleSelector({ 
  selectedPrimary, 
  selectedSecondary, 
  onPrimarySelect, 
  onSecondarySelect 
}: MuscleSelectorProps) {
  // Handle primary muscle selection
  const handlePrimarySelect = (muscle: string) => {
    if (selectedPrimary.includes(muscle)) {
      // Remove from primary
      onPrimarySelect(selectedPrimary.filter(m => m !== muscle));
    } else {
      // Add to primary, remove from secondary if present
      onPrimarySelect([...selectedPrimary, muscle]);
      if (selectedSecondary.includes(muscle)) {
        onSecondarySelect(selectedSecondary.filter(m => m !== muscle));
      }
    }
  };

  // Handle secondary muscle selection
  const handleSecondarySelect = (muscle: string) => {
    if (selectedSecondary.includes(muscle)) {
      // Remove from secondary
      onSecondarySelect(selectedSecondary.filter(m => m !== muscle));
    } else {
      // Add to secondary, remove from primary if present
      onSecondarySelect([...selectedSecondary, muscle]);
      if (selectedPrimary.includes(muscle)) {
        onPrimarySelect(selectedPrimary.filter(m => m !== muscle));
      }
    }
  };

  // Toggle muscle selection status (right-click)
  const handleContextMenu = (e: React.MouseEvent, muscle: string) => {
    e.preventDefault();
    handleSecondarySelect(muscle);
  };

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
          <svg 
            viewBox="0 0 300 500" 
            className="w-full h-full opacity-50"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))' }}
          >
            <path 
              d="M150,60 C180,60 200,40 200,0 H100 C100,40 120,60 150,60 Z" 
              fill="#333" 
              className="muscle-head" 
              data-muscle="head"
            />
            <path 
              d="M110,60 L100,140 L90,160 L100,220 L120,230 L130,220 L130,180 L150,200 L170,180 L170,220 L180,230 L200,220 L210,160 L200,140 L190,60 L160,80 L140,80 Z" 
              fill="#333" 
              className="muscle-torso" 
              data-muscle="torso"
            />
            <path 
              d="M90,160 L60,200 L50,250 L55,280 L70,290 L80,270 L100,260 L100,220 Z" 
              fill="#333" 
              className="muscle-arm-left" 
              data-muscle="arms"
            />
            <path 
              d="M210,160 L240,200 L250,250 L245,280 L230,290 L220,270 L200,260 L200,220 Z" 
              fill="#333" 
              className="muscle-arm-right" 
              data-muscle="arms"
            />
            <path 
              d="M120,230 L110,300 L90,450 L80,480 L100,490 L120,480 L130,450 L140,300 L150,280 Z" 
              fill="#333" 
              className="muscle-leg-left" 
              data-muscle="legs"
            />
            <path 
              d="M180,230 L190,300 L210,450 L220,480 L200,490 L180,480 L170,450 L160,300 L150,280 Z" 
              fill="#333" 
              className="muscle-leg-right" 
              data-muscle="legs"
            />
          </svg>
          
          {/* Clickable muscle regions */}
          <div className="absolute inset-0">
            {MUSCLE_GROUP_CATEGORIES.flatMap(category => 
              category.muscles.map(muscle => {
                const isPrimary = selectedPrimary.includes(muscle);
                const isSecondary = selectedSecondary.includes(muscle);
                
                const getPosition = () => {
                  // Return position coordinates based on muscle
                  switch(muscle) {
                    // Upper body
                    case 'chest': return { top: '25%', left: '50%', width: '30%', height: '10%' };
                    case 'shoulders': return { top: '19%', left: '50%', width: '50%', height: '5%' };
                    case 'back': return { top: '27%', left: '50%', width: '22%', height: '15%' };
                    case 'traps': return { top: '22%', left: '50%', width: '20%', height: '5%' };
                    case 'lats': return { top: '30%', left: '50%', width: '30%', height: '10%' };
                    case 'biceps': return { top: '30%', left: '25%', width: '10%', height: '10%', right: 'auto' };
                    case 'triceps': return { top: '30%', left: 'auto', width: '10%', height: '10%', right: '25%' };
                    case 'forearms': return { top: '40%', left: '50%', width: '40%', height: '5%' };
                    
                    // Core
                    case 'abs': return { top: '35%', left: '50%', width: '16%', height: '10%' };
                    case 'obliques': return { top: '35%', left: '50%', width: '26%', height: '10%' };
                    case 'lower back': return { top: '35%', left: '50%', width: '16%', height: '7%' };
                    
                    // Lower body
                    case 'glutes': return { top: '46%', left: '50%', width: '20%', height: '7%' };
                    case 'quads': return { top: '55%', left: '50%', width: '30%', height: '15%' };
                    case 'hamstrings': return { top: '55%', left: '50%', width: '25%', height: '15%' };
                    case 'calves': return { top: '70%', left: '50%', width: '20%', height: '13%' };
                    
                    // General
                    case 'arms': return { top: '30%', left: '50%', width: '60%', height: '15%' };
                    case 'legs': return { top: '60%', left: '50%', width: '40%', height: '30%' };
                    case 'core': return { top: '35%', left: '50%', width: '30%', height: '15%' };
                    case 'cardio': return { top: '40%', left: '50%', width: '80%', height: '40%' };
                    case 'full body': return { top: '40%', left: '50%', width: '90%', height: '60%' };
                    
                    default: return { display: 'none' };
                  }
                };
                
                const pos = getPosition();
                if (pos.display === 'none') return null;
                
                return (
                  <div 
                    key={muscle}
                    onClick={() => handlePrimarySelect(muscle)}
                    onContextMenu={(e) => handleContextMenu(e, muscle)}
                    className={cn(
                      "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer",
                      "transition-all duration-200 ease-in-out hover:opacity-90",
                      "flex items-center justify-center text-xs font-medium",
                      isPrimary ? "bg-purple-600/70" : 
                      isSecondary ? "bg-blue-600/70" : 
                      "bg-gray-600/30 hover:bg-gray-500/30"
                    )}
                    style={{
                      top: pos.top,
                      left: pos.left,
                      right: pos.right,
                      width: pos.width,
                      height: pos.height,
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
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
