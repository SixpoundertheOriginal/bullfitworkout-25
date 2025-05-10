
// Exercise metadata constants
export type MovementPattern = 'push' | 'pull' | 'hinge' | 'squat' | 'carry' | 'rotation' | 'lunge' | 'isometric' | 'locomotion';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export const MOVEMENT_PATTERNS: MovementPattern[] = [
  'push', 
  'pull', 
  'hinge', 
  'squat', 
  'carry', 
  'rotation', 
  'lunge',
  'isometric',
  'locomotion'
];

export const DIFFICULTY_LEVELS: Difficulty[] = [
  'beginner',
  'intermediate',
  'advanced',
  'expert'
];
