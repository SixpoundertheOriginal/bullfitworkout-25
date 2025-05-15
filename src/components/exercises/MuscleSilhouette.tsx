
import React from 'react';

interface MuscleSilhouetteProps {
  className?: string;
}

export function MuscleSilhouette({ className }: MuscleSilhouetteProps) {
  return (
    <svg 
      viewBox="0 0 300 500" 
      className={className}
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
  );
}
