
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty } from "./exercise";

export type VariationType = 
  | 'grip' 
  | 'angle' 
  | 'stance' 
  | 'equipment' 
  | 'tempo' 
  | 'range' 
  | 'resistance'
  | 'unilateral';

export interface Variation {
  id?: string;
  type: VariationType;
  value: string;
  description?: string;
}

export const VARIATION_TYPES: VariationType[] = [
  'grip', 
  'angle', 
  'stance', 
  'equipment', 
  'tempo', 
  'range', 
  'resistance',
  'unilateral'
];

// Helper functions for variations
export function getVariationLabel(type: VariationType): string {
  const labels: Record<VariationType, string> = {
    'grip': 'Grip Width/Type',
    'angle': 'Angle/Incline',
    'stance': 'Stance/Position',
    'equipment': 'Equipment Variation',
    'tempo': 'Tempo/Timing',
    'range': 'Range of Motion',
    'resistance': 'Resistance Type',
    'unilateral': 'Unilateral/Single-side'
  };
  
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

export function getDefaultValueForType(type: VariationType): string {
  switch (type) {
    case 'grip': return 'wide';
    case 'angle': return '30°';
    case 'stance': return 'narrow';
    case 'equipment': return 'band';
    case 'tempo': return '3-1-3';
    case 'range': return 'partial';
    case 'resistance': return 'accommodating';
    case 'unilateral': return 'single arm';
    default: return '';
  }
}

export function getVariationTypeDescriptions(): Record<VariationType, string> {
  return {
    'grip': 'Modification to hand position or width',
    'angle': 'Changes to the angle of movement or body position',
    'stance': 'Different foot positions or body stances',
    'equipment': 'Alternative equipment for the same movement pattern',
    'tempo': 'Modified timing of eccentric/concentric phases',
    'range': 'Partial or extended range of motion',
    'resistance': 'Different types of resistance applied',
    'unilateral': 'Single-limb versions of bilateral exercises'
  };
}

export function getVariationValueSuggestions(type: VariationType): string[] {
  const suggestions: Record<VariationType, string[]> = {
    'grip': ['wide', 'narrow', 'neutral', 'supinated', 'pronated', 'mixed'],
    'angle': ['incline', 'decline', '30°', '45°', 'flat'],
    'stance': ['wide', 'narrow', 'staggered', 'sumo', 'conventional'],
    'equipment': ['barbell', 'dumbbell', 'kettlebell', 'band', 'cable', 'machine'],
    'tempo': ['slow', 'explosive', '3-1-3', '2-0-1', 'pause'],
    'range': ['full', 'partial', 'extended', '1.5 reps', 'limited'],
    'resistance': ['band', 'chains', 'accommodating', 'variable'],
    'unilateral': ['single arm', 'single leg', 'alternating', 'asymmetric']
  };
  
  return suggestions[type] || [];
}
