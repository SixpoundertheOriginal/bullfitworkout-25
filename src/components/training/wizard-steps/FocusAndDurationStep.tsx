
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MUSCLE_GROUP_CATEGORIES } from '@/constants/exerciseMetadata';
import { User, Users, Target, Zap, Clock, Award, ChevronDown, ChevronUp } from 'lucide-react';

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

const muscleGroupCategories: MuscleGroupCategory[] = [
  {
    name: 'Upper Body',
    muscles: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms'],
    icon: User,
    color: 'from-blue-600 to-blue-400',
    description: 'Build upper body strength and definition'
  },
  {
    name: 'Lower Body', 
    muscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
    icon: Users,
    color: 'from-green-600 to-green-400',
    description: 'Develop powerful legs and glutes'
  },
  {
    name: 'Core & Stability',
    muscles: ['Abs', 'Lower Back', 'Obliques'],
    icon: Target,
    color: 'from-purple-600 to-purple-400',
    description: 'Strengthen your core foundation'
  }
];

const MuscleGroupCard = ({ 
  category, 
  selectedMuscles, 
  onToggleMuscle,
  isExpanded,
  onToggleExpand 
}: {
  category: MuscleGroupCategory;
  selectedMuscles: string[];
  onToggleMuscle: (muscle: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const selectedCount = category.muscles.filter(m => selectedMuscles.includes(m)).length;
  const allSelected = selectedCount === category.muscles.length;
  
  const handleSelectAll = () => {
    if (allSelected) {
      // Remove all muscles from this category
      category.muscles.forEach(muscle => {
        if (selectedMuscles.includes(muscle)) {
          onToggleMuscle(muscle);
        }
      });
    } else {
      // Add all muscles from this category
      category.muscles.forEach(muscle => {
        if (!selectedMuscles.includes(muscle)) {
          onToggleMuscle(muscle);
        }
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border cursor-pointer transform transition-all duration-200",
        "bg-gray-900/50 border-gray-800 hover:bg-gray-800/70 hover:border-gray-700",
        selectedCount > 0 && "bg-purple-900/30 border-purple-500/50 shadow-lg shadow-purple-900/20"
      )}
    >
      <div 
        className="p-4 flex items-center justify-between"
        onClick={onToggleExpand}
      >
        <div className="flex items-center">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mr-4",
            `bg-gradient-to-br ${category.color}`,
          )}>
            <category.icon className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">{category.name}</h3>
              {selectedCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-500/30">
                  {selectedCount}/{category.muscles.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">{category.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAll();
              }}
              className="text-xs px-2 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              {allSelected ? 'Clear' : 'All'}
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-800 p-4"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {category.muscles.map(muscle => {
              const isSelected = selectedMuscles.includes(muscle);
              return (
                <motion.button
                  key={muscle}
                  whileTap={{ scale: 0.96 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMuscle(muscle);
                  }}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all",
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
                      className="w-2 h-2 rounded-full bg-purple-400 ml-2"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const WorkoutStyleCard = ({ 
  style, 
  isSelected, 
  onToggle 
}: {
  style: WorkoutStyleOption;
  isSelected: boolean;
  onToggle: () => void;
}) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    onClick={onToggle}
    className={cn(
      "p-4 rounded-xl border cursor-pointer transform transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-purple-500",
      isSelected 
        ? "bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-900/20" 
        : "bg-gray-900/50 border-gray-800 hover:bg-gray-800/70 hover:border-gray-700"
    )}
  >
    <div className="flex items-center">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center mr-3",
        `bg-gradient-to-br ${style.color}`,
      )}>
        <style.icon className="w-5 h-5 text-white" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{style.name}</h4>
          {style.difficulty && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              style.difficulty === 'Beginner' && "bg-green-900/40 text-green-300 border border-green-500/30",
              style.difficulty === 'Intermediate' && "bg-yellow-900/40 text-yellow-300 border border-yellow-500/30",
              style.difficulty === 'Advanced' && "bg-red-900/40 text-red-300 border border-red-500/30"
            )}>
              {style.difficulty}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">{style.description}</p>
      </div>
      
      <div className={cn(
        "w-5 h-5 rounded-full border-2 ml-2 flex-shrink-0",
        "transition-all duration-200 ease-in-out",
        "flex items-center justify-center",
        isSelected 
          ? "border-purple-500 bg-purple-500" 
          : "border-gray-600 bg-transparent"
      )}>
        {isSelected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-white rounded-full"
          />
        )}
      </div>
    </div>
  </motion.div>
);

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
        difficulty: 'Intermediate'
      },
      {
        id: 'strength',
        name: 'Strength',
        description: 'Build maximum power and strength',
        icon: Zap,
        color: 'from-red-600 to-red-400',
        difficulty: 'Advanced'
      },
      {
        id: 'endurance',
        name: 'Endurance',
        description: 'Improve muscular endurance',
        icon: Clock,
        color: 'from-green-600 to-green-400',
        difficulty: 'Beginner'
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
            difficulty: 'Advanced'
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
            difficulty: 'Beginner'
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
          {muscleGroupCategories.map(category => (
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
