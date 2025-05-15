
import React from 'react';
import { Exercise } from '@/types/exercise';
import { Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseThumbnailProps {
  exercise: Exercise;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPlaceholder?: boolean;
}

export const ExerciseThumbnail: React.FC<ExerciseThumbnailProps> = ({ 
  exercise, 
  className,
  size = 'md',
  showPlaceholder = true
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  if (!exercise.media_url && !showPlaceholder) {
    return null;
  }

  if (!exercise.media_url) {
    return (
      <div className={cn(
        sizeClasses[size],
        'rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center',
        'border border-white/5',
        className
      )}>
        <Image size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} className="text-gray-500" />
      </div>
    );
  }

  return (
    <div className={cn(
      sizeClasses[size],
      'rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 relative',
      'shadow-md hover:shadow-lg transition-shadow duration-300',
      'border border-white/5',
      className
    )}>
      <img 
        src={exercise.media_url} 
        alt={exercise.name} 
        className="w-full h-full object-cover absolute inset-0 transition-transform duration-300 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};
