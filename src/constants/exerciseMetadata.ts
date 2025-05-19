
import { MuscleGroup, MovementPattern, Difficulty, MUSCLE_GROUPS, MOVEMENT_PATTERNS, DIFFICULTY_LEVELS } from '@/types/exercise';

// Muscle group categories for organization
export interface MuscleGroupCategory {
  category: string;
  muscles: MuscleGroup[];
}

export const MUSCLE_GROUP_CATEGORIES: MuscleGroupCategory[] = [
  {
    category: 'Upper Body',
    muscles: ['chest', 'back', 'shoulders', 'arms', 'biceps', 'triceps', 'forearms', 'traps', 'lats']
  },
  {
    category: 'Lower Body',
    muscles: ['legs', 'glutes', 'hamstrings', 'quads', 'calves']
  },
  {
    category: 'Core',
    muscles: ['core', 'abs', 'obliques', 'lower back']
  },
  {
    category: 'Full Body',
    muscles: ['full body', 'cardio']
  }
];

// Helper functions for muscle groups
export const getMuscleGroupLabel = (group: MuscleGroup): string => {
  const labels: Record<MuscleGroup, string> = {
    'chest': 'Chest',
    'back': 'Back',
    'shoulders': 'Shoulders',
    'arms': 'Arms',
    'legs': 'Legs',
    'core': 'Core',
    'cardio': 'Cardio',
    'full body': 'Full Body',
    'biceps': 'Biceps',
    'triceps': 'Triceps',
    'forearms': 'Forearms',
    'traps': 'Trapezius',
    'lats': 'Latissimus Dorsi',
    'glutes': 'Glutes',
    'hamstrings': 'Hamstrings',
    'quads': 'Quadriceps',
    'calves': 'Calves',
    'abs': 'Abdominals',
    'obliques': 'Obliques',
    'lower back': 'Lower Back'
  };
  
  return labels[group] || group;
};

// Helper functions for movement patterns
export const getMovementPatternLabel = (pattern: MovementPattern): string => {
  const labels: Record<MovementPattern, string> = {
    'push': 'Push',
    'pull': 'Pull',
    'squat': 'Squat',
    'hinge': 'Hinge',
    'lunge': 'Lunge',
    'rotation': 'Rotation',
    'carry': 'Carry',
    'isometric': 'Isometric',
    'locomotion': 'Locomotion'
  };
  
  return labels[pattern] || pattern;
};

// Helper functions for difficulty levels
export const getDifficultyLabel = (difficulty: Difficulty): string => {
  const labels: Record<Difficulty, string> = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
    'expert': 'Expert'
  };
  
  return labels[difficulty] || difficulty;
};
