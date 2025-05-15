
import React from 'react';
import { Exercise } from '@/types/exercise';
import { Image } from 'lucide-react';

interface ExerciseThumbnailProps {
  exercise: Exercise;
  className?: string;
}

export const ExerciseThumbnail: React.FC<ExerciseThumbnailProps> = ({ exercise, className }) => {
  if (!exercise.media_url) {
    return (
      <div className={`w-10 h-10 rounded overflow-hidden bg-gray-800 flex items-center justify-center ${className}`}>
        <Image size={16} className="text-gray-500" />
      </div>
    );
  }

  return (
    <div className={`w-10 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0 ${className}`}>
      <img 
        src={exercise.media_url} 
        alt={exercise.name} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};
