import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MUSCLE_GROUP_CATEGORIES } from '@/constants/exerciseMetadata';
import { User, Users, Target, Zap, Clock, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { MuscleGroupCard } from './MuscleGroupCard';
import { WorkoutStyleCard } from './WorkoutStyleCard';

interface FocusAndDurationStepProps {
  selectedFocus: string[];
  duration: number;
  trainingType: string;
  onUpdateFocus: (focus: string[]) => void;
  onUpdateDuration: (duration: number) => void;
  onUpdateTags: (tags: string[]) => void;
}

interface MuscleGroupCategory {
  name: string;
  muscles: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface WorkoutStyleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export function FocusAndDurationStep({ 
  selectedFocus, 
  duration, 
  trainingType,
  onUpdateFocus,
  onUpdateTags
}: FocusAndDurationStepProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Upper Body']));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get workout style options based on training type
  const workoutStyles = useMemo(() => {
    const baseStyles: WorkoutStyleOption[] = [
      {
        id: 'hypertrophy',
        name: 'Hypertrophy',
        description: 'Focus on muscle growth and size',
        icon: User,
        color: 'from-blue-600 to-blue-400',
        difficulty: 'Intermediate' as const
      },
      {
        id: 'strength',
        name: 'Strength',
        description: 'Build maximum power and strength',
        icon: Zap,
        color: 'from-red-600 to-red-400',
        difficulty: 'Advanced' as const
      },
      {
        id: 'endurance',
        name: 'Endurance',
        description: 'Improve muscular endurance',
        icon: Clock,
        color: 'from-green-600 to-green-400',
        difficulty: 'Beginner' as const
      }
    ];

    // Add training-type specific styles
    switch (trainingType) {
      case 'hiit':
        return [
          ...baseStyles,
          {
            id: 'tabata',
            name: 'Tabata',
            description: '20 seconds on, 10 seconds off',
            icon: Target,
            color: 'from-yellow-600 to-yellow-400',
            difficulty: 'Advanced' as const
          }
        ];
      case 'cardio':
        return [
          ...baseStyles,
          {
            id: 'steady-state',
            name: 'Steady State',
            description: 'Consistent moderate intensity',
            icon: Target,
            color: 'from-purple-600 to-purple-400',
            difficulty: 'Beginner' as const
          }
        ];
      default:
        return baseStyles;
    }
  }, [trainingType]);

  // Get recommended muscle groups based on training type
  const recommendedMuscles = useMemo(() => {
    switch (trainingType) {
      case 'strength':
        return ['Chest', 'Back', 'Quadriceps', 'Shoulders'];
      case 'cardio':
        return ['Quadriceps', 'Hamstrings', 'Calves', 'Abs'];
      case 'hiit':
        return ['Quadriceps', 'Glutes', 'Abs', 'Shoulders'];
      default:
        return ['Chest', 'Back', 'Quadriceps', 'Shoulders'];
    }
  }, [trainingType]);

  const toggleMuscleGroup = (muscleGroup: string) => {
    if (selectedFocus.includes(muscleGroup)) {
      onUpdateFocus(selectedFocus.filter(m => m !== muscleGroup));
    } else {
      onUpdateFocus([...selectedFocus, muscleGroup]);
    }
  };

  const toggleWorkoutStyle = (styleId: string) => {
    const newTags = selectedTags.includes(styleId)
      ? selectedTags.filter(t => t !== styleId)
      : [...selectedTags, styleId];
    
    setSelectedTags(newTags);
    onUpdateTags(newTags);
  };

  const toggleCategoryExpanded = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const handleQuickSelect = (preset: string) => {
    switch (preset) {
      case 'recommended':
        onUpdateFocus(recommendedMuscles);
        break;
      case 'full-body':
        onUpdateFocus(['Chest', 'Back', 'Quadriceps', 'Shoulders', 'Abs']);
        break;
      case 'upper':
        onUpdateFocus(['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps']);
        break;
      case 'lower':
        onUpdateFocus(['Quadriceps', 'Hamstrings', 'Glutes', 'Calves']);
        break;
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Customize Your Workout</h2>
        <p className="text-gray-400 text-sm">
          Fine-tune your {trainingType} workout to match your goals
        </p>
      </div>

      {/* Enhanced Duration Display */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30"
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-6 h-6 text-purple-400" />
            <div className="text-3xl font-bold text-white">
              ~{duration} <span className="text-lg text-gray-400">min</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-yellow-400" />
              <span>~{Math.round(duration * 2)} XP</span>
            </div>
            <div>•</div>
            <div>{trainingType.charAt(0).toUpperCase() + trainingType.slice(1)} Focus</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Select Presets */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Quick Select
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'recommended', label: `Recommended for ${trainingType}`, highlight: true },
            { id: 'full-body', label: 'Full Body' },
            { id: 'upper', label: 'Upper Body' },
            { id: 'lower', label: 'Lower Body' }
          ].map(preset => (
            <button
              key={preset.id}
              onClick={() => handleQuickSelect(preset.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                "border focus:outline-none focus:ring-2 focus:ring-purple-500",
                preset.highlight 
                  ? "bg-purple-600 text-white border-purple-500 hover:bg-purple-700"
                  : "bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-800"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
        
      {/* Enhanced Muscle Groups Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          Target Muscle Groups
        </h3>
        
        <div className="space-y-3">
          {MUSCLE_GROUP_CATEGORIES.map(category => (
            <MuscleGroupCard
              key={category.name}
              category={category}
              selectedMuscles={selectedFocus}
              onToggleMuscle={toggleMuscleGroup}
              isExpanded={expandedCategories.has(category.name)}
              onToggleExpand={() => toggleCategoryExpanded(category.name)}
            />
          ))}
        </div>
        
        {selectedFocus.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-500 bg-gray-800/30 rounded-lg p-3"
          >
            <strong>Selected:</strong> {selectedFocus.join(', ')}
          </motion.div>
        )}
      </div>
      
      {/* Enhanced Workout Style */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Workout Style
        </h3>
        <div className="space-y-3">
          {workoutStyles.map(style => (
            <WorkoutStyleCard
              key={style.id}
              style={style}
              isSelected={selectedTags.includes(style.id)}
              onToggle={() => toggleWorkoutStyle(style.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
