
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MuscleGroupVisualizerProps {
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MuscleGroupVisualizer: React.FC<MuscleGroupVisualizerProps> = ({
  primaryMuscles = [],
  secondaryMuscles = [],
  size = 'md',
  className
}) => {
  const sizesMap = {
    sm: 'w-16 h-28',
    md: 'w-24 h-40',
    lg: 'w-32 h-56'
  };
  
  // Helper function to get color class based on muscle group
  const getMuscleHighlightClass = (muscle: string, isPrimary: boolean) => {
    const baseColor = isPrimary ? 'text-purple-500' : 'text-blue-400';
    const intensity = isPrimary ? '70' : '40';
    
    const lowerMuscle = muscle.toLowerCase();
    
    if (lowerMuscle.includes('chest')) return `${baseColor} fill-purple-500/${intensity}`;
    if (lowerMuscle.includes('back') || lowerMuscle.includes('lats')) return `${baseColor} fill-blue-500/${intensity}`;
    if (lowerMuscle.includes('shoulder') || lowerMuscle.includes('delt')) return `${baseColor} fill-cyan-500/${intensity}`;
    if (lowerMuscle.includes('bicep')) return `${baseColor} fill-green-500/${intensity}`;
    if (lowerMuscle.includes('tricep')) return `${baseColor} fill-emerald-500/${intensity}`;
    if (lowerMuscle.includes('abs') || lowerMuscle.includes('core')) return `${baseColor} fill-yellow-500/${intensity}`;
    if (lowerMuscle.includes('glute')) return `${baseColor} fill-red-500/${intensity}`;
    if (lowerMuscle.includes('quad')) return `${baseColor} fill-orange-500/${intensity}`;
    if (lowerMuscle.includes('hamstring')) return `${baseColor} fill-rose-500/${intensity}`;
    if (lowerMuscle.includes('calv')) return `${baseColor} fill-pink-500/${intensity}`;
    
    // Default color
    return `${baseColor} fill-gray-500/${intensity}`;
  };
  
  // Render a simplified human figure highlighting muscle groups
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("relative", sizesMap[size])}>
        {/* SVG placeholder - this would be replaced with a proper SVG in a real implementation */}
        <svg viewBox="0 0 100 180" className="w-full h-full">
          <g className="human-figure stroke-white/20 stroke-[0.5]">
            {/* Basic human figure outline */}
            <circle cx="50" cy="25" r="20" className="fill-gray-800/30" /> {/* Head */}
            <rect x="40" y="45" width="20" height="40" rx="5" className="fill-gray-800/30" /> {/* Torso */}
            <rect x="30" y="50" width="10" height="35" rx="5" className="fill-gray-800/30" /> {/* Left arm */}
            <rect x="60" y="50" width="10" height="35" rx="5" className="fill-gray-800/30" /> {/* Right arm */}
            <rect x="40" y="85" width="10" height="45" rx="5" className="fill-gray-800/30" /> {/* Left leg */}
            <rect x="50" y="85" width="10" height="45" rx="5" className="fill-gray-800/30" /> {/* Right leg */}
            
            {/* Muscle group highlights - these would be proper paths in a real implementation */}
            {primaryMuscles.map((muscle, i) => {
              const muscleClass = getMuscleHighlightClass(muscle, true);
              
              // This is simplified - in a real implementation we'd have proper paths for each muscle
              if (muscle.toLowerCase().includes('chest')) {
                return <rect key={i} x="40" y="45" width="20" height="15" rx="3" className={muscleClass} />;
              }
              if (muscle.toLowerCase().includes('back') || muscle.toLowerCase().includes('lats')) {
                return <rect key={i} x="40" y="60" width="20" height="15" rx="3" className={muscleClass} />;
              }
              if (muscle.toLowerCase().includes('shoulder') || muscle.toLowerCase().includes('delt')) {
                return (
                  <g key={i} className={muscleClass}>
                    <circle cx="35" cy="50" r="5" />
                    <circle cx="65" cy="50" r="5" />
                  </g>
                );
              }
              if (muscle.toLowerCase().includes('bicep')) {
                return (
                  <g key={i} className={muscleClass}>
                    <rect x="30" y="55" width="10" height="10" rx="5" />
                    <rect x="60" y="55" width="10" height="10" rx="5" />
                  </g>
                );
              }
              if (muscle.toLowerCase().includes('tricep')) {
                return (
                  <g key={i} className={muscleClass}>
                    <rect x="30" y="65" width="10" height="10" rx="5" />
                    <rect x="60" y="65" width="10" height="10" rx="5" />
                  </g>
                );
              }
              if (muscle.toLowerCase().includes('abs') || muscle.toLowerCase().includes('core')) {
                return <rect key={i} x="40" y="75" width="20" height="10" rx="3" className={muscleClass} />;
              }
              if (muscle.toLowerCase().includes('glute')) {
                return <rect key={i} x="40" y="85" width="20" height="10" rx="5" className={muscleClass} />;
              }
              if (muscle.toLowerCase().includes('quad')) {
                return (
                  <g key={i} className={muscleClass}>
                    <rect x="40" y="95" width="10" height="20" rx="5" />
                    <rect x="50" y="95" width="10" height="20" rx="5" />
                  </g>
                );
              }
              if (muscle.toLowerCase().includes('hamstring')) {
                return (
                  <g key={i} className={muscleClass}>
                    <rect x="40" y="115" width="10" height="10" rx="5" />
                    <rect x="50" y="115" width="10" height="10" rx="5" />
                  </g>
                );
              }
              if (muscle.toLowerCase().includes('calv')) {
                return (
                  <g key={i} className={muscleClass}>
                    <rect x="40" y="125" width="10" height="5" rx="2.5" />
                    <rect x="50" y="125" width="10" height="5" rx="2.5" />
                  </g>
                );
              }
              
              return null;
            })}
            
            {/* Secondary muscle group highlights with lighter opacity */}
            {secondaryMuscles.map((muscle, i) => {
              const muscleClass = getMuscleHighlightClass(muscle, false);
              
              // Similar to primary muscles but with different styling
              // Simplified for brevity - would use the same logic as above
              return null;
            })}
          </g>
        </svg>
      </div>
      
      {/* Muscle labels */}
      <div className="flex flex-wrap gap-1 justify-center mt-2 max-w-full">
        {primaryMuscles.map((muscle, i) => (
          <Badge key={i} variant="outline" className="text-xs bg-purple-900/20 border-purple-600/30 capitalize">
            {muscle}
          </Badge>
        ))}
      </div>
      
      {secondaryMuscles && secondaryMuscles.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mt-1 max-w-full">
          {secondaryMuscles.map((muscle, i) => (
            <Badge key={i} variant="outline" className="text-xs bg-blue-900/20 border-blue-600/30 capitalize">
              {muscle}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default MuscleGroupVisualizer;
