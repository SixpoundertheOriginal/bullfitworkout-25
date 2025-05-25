
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MUSCLE_GROUP_CATEGORIES } from '@/constants/exerciseMetadata';

interface FocusAndDurationStepProps {
  selectedFocus: string[];
  duration: number;
  trainingType: string;
  onUpdateFocus: (focus: string[]) => void;
  onUpdateDuration: (duration: number) => void;
  onUpdateTags: (tags: string[]) => void;
}

interface MuscleGroupButtonProps {
  muscle: string;
  isSelected: boolean;
  onToggle: (muscle: string) => void;
}

const MuscleGroupButton = ({ muscle, isSelected, onToggle }: MuscleGroupButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    console.log('💪 Muscle group clicked:', { muscle, isSelected, event: e.type });
    e.preventDefault();
    e.stopPropagation();
    onToggle(muscle);
  };

  return (
    <motion.div
      key={muscle}
      whileTap={{ scale: 0.96 }}
      className="relative"
    >
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "w-full px-3 py-2 rounded-lg text-sm font-medium transition-all",
          "flex items-center justify-between cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-purple-500",
          isSelected
            ? "bg-purple-900/50 border-purple-500/50 border text-white"
            : "bg-gray-800/50 border-gray-700 border text-gray-400 hover:bg-gray-800"
        )}
      >
        <span className="truncate">{muscle}</span>
        {isSelected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 rounded-full bg-purple-400"
          />
        )}
      </button>
    </motion.div>
  );
};

export function FocusAndDurationStep({ 
  selectedFocus, 
  duration, 
  trainingType,
  onUpdateFocus,
  onUpdateTags
}: FocusAndDurationStepProps) {
  // Get predefined tags based on training type
  const suggestedTags = React.useMemo(() => {
    switch (trainingType) {
      case 'strength':
        return ['hypertrophy', 'power', 'endurance', 'max-strength'];
      case 'cardio': 
        return ['steady-state', 'intervals', 'endurance', 'recovery'];
      case 'hiit':
        return ['tabata', 'amrap', 'emom', 'circuit'];
      case 'mobility':
        return ['flexibility', 'balance', 'recovery', 'core'];
      default:
        return ['general', 'custom', 'full-body'];
    }
  }, [trainingType]);
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Toggle a muscle group selection
  const toggleMuscleGroup = (muscleGroup: string) => {
    console.log('🎯 Toggling muscle group:', { muscleGroup, current: selectedFocus });
    if (selectedFocus.includes(muscleGroup)) {
      onUpdateFocus(selectedFocus.filter(m => m !== muscleGroup));
    } else {
      onUpdateFocus([...selectedFocus, muscleGroup]);
    }
  };
  
  // Toggle a tag selection
  const toggleTag = (tag: string) => {
    console.log('🏷️ Toggling tag:', { tag, current: selectedTags });
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    onUpdateTags(newTags);
  };

  const handleTagClick = (tag: string) => {
    console.log('🏷️ Tag button clicked:', { tag });
    toggleTag(tag);
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-semibold mb-1">Customize Your Workout</h2>
        <p className="text-gray-400 text-sm mb-4">
          Select muscle groups to focus on (optional)
        </p>
      </div>

      {/* Smart Duration Display */}
      <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">
            ~{duration} <span className="text-lg text-gray-400">minutes</span>
          </div>
          <div className="text-sm text-gray-500">
            Estimated duration • ~{Math.round(duration * 2)} XP
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Automatically calculated based on your selections
          </div>
        </div>
      </div>
        
      {/* Muscle Groups Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Target Muscle Groups</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MUSCLE_GROUP_CATEGORIES.flatMap(category => 
            category.muscles.map(muscle => (
              <MuscleGroupButton 
                key={muscle}
                muscle={muscle}
                isSelected={selectedFocus.includes(muscle)}
                onToggle={toggleMuscleGroup}
              />
            ))
          )}
        </div>
        
        {selectedFocus.length > 0 && (
          <div className="text-sm text-gray-500 mt-2">
            Selected: {selectedFocus.join(', ')}
          </div>
        )}
      </div>
      
      {/* Workout Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Workout Style</h3>
        <div className="flex flex-wrap gap-2">
          {suggestedTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={cn(
                "px-3 py-1 rounded-full text-sm transition-all cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-purple-500",
                selectedTags.includes(tag)
                  ? "bg-gray-700 text-white border border-gray-600"
                  : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-800"
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
