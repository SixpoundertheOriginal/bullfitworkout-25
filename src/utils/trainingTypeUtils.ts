
import { trainingTypes as uiTrainingTypes } from '@/components/TrainingTypeTag';
import { trainingTypes as dataTrainingTypes } from '@/constants/trainingTypes';

/**
 * Maps a training type from any format to the standardized format
 * This helps ensure consistency across the application
 */
export function standardizeTrainingType(type: string | undefined | null): string | null {
  if (!type) return null;
  
  // Normalize to lowercase for case-insensitive comparison
  const normalizedType = type.toLowerCase().trim();
  
  // Check in UI training types (from TrainingTypeTag)
  const uiMatch = uiTrainingTypes.find(t => t.toLowerCase() === normalizedType);
  if (uiMatch) return uiMatch;
  
  // Check in data training types (from constants)
  const dataMatch = dataTrainingTypes.find(t => t.name.toLowerCase() === normalizedType);
  if (dataMatch) return dataMatch.name;
  
  // If no match found but it's a valid string, use properly capitalized version
  if (type.trim()) {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }
  
  return null;
}

/**
 * Returns all valid training types from both UI and data sources
 */
export function getAllTrainingTypes(): string[] {
  const uiTypes = uiTrainingTypes;
  const dataTypes = dataTrainingTypes.map(t => t.name);
  
  // Combine both arrays and remove duplicates
  return Array.from(new Set([...uiTypes, ...dataTypes]));
}

/**
 * Validates if a training type exists in our system
 */
export function isValidTrainingType(type: string | undefined | null): boolean {
  if (!type) return false;
  
  const allTypes = getAllTrainingTypes();
  return allTypes.some(t => t.toLowerCase() === type.toLowerCase());
}

/**
 * Gets the base experience multiplier for a given training type
 */
export function getTrainingTypeXpMultiplier(type: string | null): number {
  if (!type) return 1.0;
  
  const standardType = standardizeTrainingType(type);
  
  // Define base XP multipliers for each training type
  const multipliers: Record<string, number> = {
    'Strength': 1.0,
    'Hypertrophy': 1.0,
    'Cardio': 0.9,
    'Calisthenics': 1.1,
    'Stretching': 0.8,
    'Yoga': 0.85
  };
  
  return multipliers[standardType as string] || 1.0;
}
