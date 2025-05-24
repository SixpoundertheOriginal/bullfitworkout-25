
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
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
  return (
    <motion.div
      key={muscle}
      whileTap={{ scale: 0.96 }}
      className="relative"
    >
      <button
        type="button"
        onClick={(e) => {
          console.log('💪 Muscle group clicked:', { muscle, isSelected, event: e.type });
          e.preventDefault();
          e.stopPropagation();
          onToggle(muscle);
        }}
        className={cn(
          "w-full px-3 py-2 rounded-lg text-sm font-medium transition-all",
          "flex items-center justify-between cursor-pointer",
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
  onUpdateDuration,
  onUpdateTags
}: FocusAndDurationStepProps) {
  const [activeTab, setActiveTab] = useState<'areas' | 'duration'>('areas');
  
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

  // Map duration value to a more readable format
  const getDurationLabel = (value: number) => {
    if (value < 15) return 'Quick';
    if (value < 30) return 'Short';
    if (value < 45) return 'Medium';
    if (value < 60) return 'Standard';
    if (value < 90) return 'Thorough';
    return 'Extended';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Tab Navigation */}
      <div className="flex rounded-lg bg-gray-800/50 p-1 mb-6">
        <button
          type="button"
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-center text-sm font-medium transition-all",
            activeTab === 'areas' 
              ? "bg-gray-700 text-white shadow-sm" 
              : "text-gray-400 hover:text-gray-200"
          )}
          onClick={() => {
            console.log('📑 Tab clicked: areas');
            setActiveTab('areas');
          }}
        >
          Focus Areas
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-center text-sm font-medium transition-all",
            activeTab === 'duration' 
              ? "bg-gray-700 text-white shadow-sm" 
              : "text-gray-400 hover:text-gray-200"
          )}
          onClick={() => {
            console.log('📑 Tab clicked: duration');
            setActiveTab('duration');
          }}
        >
          Duration & Tags
        </button>
      </div>
      
      {activeTab === 'areas' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Target Muscle Groups</h2>
            <p className="text-gray-400 text-sm mb-4">
              Select the muscle groups you want to focus on
            </p>
          </div>
            
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
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
        </div>
      )}
      
      {activeTab === 'duration' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Workout Duration</h2>
            <p className="text-gray-400 text-sm">
              How long do you want to work out?
            </p>
            
            <div className="mt-8 px-4 mb-12">
              <div className="flex justify-between mb-2 text-sm text-gray-400">
                <span>15m</span>
                <span>30m</span>
                <span>45m</span>
                <span>60m</span>
                <span>90m+</span>
              </div>
              
              <Slider
                defaultValue={[duration]}
                min={15}
                max={90}
                step={5}
                onValueChange={(value) => onUpdateDuration(value[0])}
              />
              
              <div className="mt-8 text-center">
                <div className="text-3xl font-bold text-white">
                  {duration} <span className="text-xl text-gray-400">min</span>
                </div>
                <div className="text-purple-400 mt-1 font-medium">
                  {getDurationLabel(duration)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ~{Math.round(duration * 2)} XP
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-3">Workout Tags</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={(e) => {
                      console.log('🏷️ Tag button clicked:', { tag, event: e.type });
                      e.preventDefault();
                      toggleTag(tag);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm transition-all cursor-pointer",
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
        </div>
      )}
    </div>
  );
}
