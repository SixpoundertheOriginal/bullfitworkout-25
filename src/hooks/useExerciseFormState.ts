import { useState, useEffect, useCallback } from 'react';
import { MovementPattern, Difficulty, MuscleGroup } from '@/types/exercise';

// Define the exercise state type
export interface ExerciseFormState {
  name: string;
  description: string;
  movement_pattern: MovementPattern;
  difficulty: Difficulty;
  instructions: { steps: string; form: string };
  is_compound: boolean;
  tips: string[];
  variations: string[];
  loading_type: string | undefined;
  estimated_load_percent: number | undefined;
  variant_category: string | undefined;
  is_bodyweight: boolean;
  energy_cost_factor: number;
  primary_muscle_groups: string[];  // Ensure this is always initialized as an array
  secondary_muscle_groups: string[];
  equipment_type: string[];
  metadata: Record<string, any>;
  // Add variation fields
  base_exercise_id?: string;
  variation_type?: string;
  variation_value?: string;
}

export interface ExerciseFormHandlers {
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setMovementPattern: (pattern: MovementPattern) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setInstructionsSteps: (steps: string) => void;
  setInstructionsForm: (form: string) => void;
  setIsCompound: (isCompound: boolean) => void;
  setTips: (tips: string[]) => void;
  addTip: (tip: string) => void;
  removeTip: (index: number) => void;
  setVariations: (variations: string[]) => void;
  addVariation: (variation: string) => void;
  removeVariation: (index: number) => void;
  setIsBodyweight: (isBodyweight: boolean) => void;
  setEstimatedLoadPercent: (percent: number) => void;
  setPrimaryMuscleGroups: (groups: string[]) => void;  // Always ensure this accepts an array
  setSecondaryMuscleGroups: (groups: string[]) => void;
  setEquipmentType: (types: string[]) => void;
  // Add variation handlers
  setBaseExerciseId?: (id: string) => void;
  setVariationType?: (type: string) => void;
  setVariationValue?: (value: string) => void;
  reset: () => void;
}

export const useExerciseFormState = (
  initialExercise?: Partial<ExerciseFormState>,
  open = false
): [ExerciseFormState, ExerciseFormHandlers] => {
  const [exercise, setExercise] = useState<ExerciseFormState>({
    name: '',
    description: '',
    movement_pattern: 'push',
    difficulty: 'beginner',
    instructions: { steps: '', form: '' },
    is_compound: false,
    tips: [],
    variations: [],
    loading_type: undefined,
    estimated_load_percent: undefined,
    variant_category: undefined,
    is_bodyweight: false,
    energy_cost_factor: 1,
    primary_muscle_groups: [],  // Initialize as empty array
    secondary_muscle_groups: [],
    equipment_type: [],
    metadata: {},
    // Default values for variation fields
    base_exercise_id: undefined,
    variation_type: undefined,
    variation_value: undefined
  });

  // Reset or seed form when initialExercise changes or dialog opens/closes
  useEffect(() => {
    if (initialExercise) {
      setExercise({
        ...exercise,
        ...initialExercise,
        instructions: {
          steps: initialExercise.instructions?.steps ?? '',
          form: initialExercise.instructions?.form ?? '',
        },
        // Ensure these properties exist as arrays even if not in initialExercise
        primary_muscle_groups: Array.isArray(initialExercise.primary_muscle_groups) 
          ? initialExercise.primary_muscle_groups 
          : [],
        secondary_muscle_groups: Array.isArray(initialExercise.secondary_muscle_groups) 
          ? initialExercise.secondary_muscle_groups 
          : [],
        equipment_type: Array.isArray(initialExercise.equipment_type) 
          ? initialExercise.equipment_type 
          : [],
        metadata: initialExercise.metadata || {},
        // Include variation fields
        base_exercise_id: initialExercise.base_exercise_id,
        variation_type: initialExercise.variation_type,
        variation_value: initialExercise.variation_value
      });
    } else {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExercise, open]);

  // keep bodyweight flag in sync
  useEffect(() => {
    if (exercise.is_bodyweight) {
      setExercise((ex) => ({ ...ex, is_bodyweight: true }));
    }
  }, [exercise.is_bodyweight]);

  // Define handlers with useCallback to avoid recreating them on each render
  const setName = useCallback((name: string) => {
    setExercise(ex => ({ ...ex, name }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setExercise(ex => ({ ...ex, description }));
  }, []);

  const setMovementPattern = useCallback((movement_pattern: MovementPattern) => {
    setExercise(ex => ({ ...ex, movement_pattern }));
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setExercise(ex => ({ ...ex, difficulty }));
  }, []);

  const setInstructionsSteps = useCallback((steps: string) => {
    setExercise(ex => ({ 
      ...ex, 
      instructions: { ...ex.instructions, steps } 
    }));
  }, []);

  const setInstructionsForm = useCallback((form: string) => {
    setExercise(ex => ({ 
      ...ex, 
      instructions: { ...ex.instructions, form } 
    }));
  }, []);

  const setIsCompound = useCallback((is_compound: boolean) => {
    setExercise(ex => ({ ...ex, is_compound }));
  }, []);

  const setTips = useCallback((tips: string[]) => {
    setExercise(ex => ({ ...ex, tips: Array.isArray(tips) ? tips : [] }));
  }, []);

  const addTip = useCallback((tip: string) => {
    if (tip.trim()) {
      setExercise(ex => ({ ...ex, tips: [...(Array.isArray(ex.tips) ? ex.tips : []), tip.trim()] }));
    }
  }, []);

  const removeTip = useCallback((index: number) => {
    setExercise(ex => ({ 
      ...ex, 
      tips: Array.isArray(ex.tips) ? ex.tips.filter((_, i) => i !== index) : [] 
    }));
  }, []);

  const setVariations = useCallback((variations: string[]) => {
    setExercise(ex => ({ ...ex, variations: Array.isArray(variations) ? variations : [] }));
  }, []);

  const addVariation = useCallback((variation: string) => {
    if (variation.trim()) {
      setExercise(ex => ({ 
        ...ex, 
        variations: [...(Array.isArray(ex.variations) ? ex.variations : []), variation.trim()] 
      }));
    }
  }, []);

  const removeVariation = useCallback((index: number) => {
    setExercise(ex => ({ 
      ...ex, 
      variations: Array.isArray(ex.variations) ? ex.variations.filter((_, i) => i !== index) : [] 
    }));
  }, []);

  const setIsBodyweight = useCallback((is_bodyweight: boolean) => {
    setExercise(ex => ({ ...ex, is_bodyweight }));
  }, []);

  const setEstimatedLoadPercent = useCallback((percent: number) => {
    setExercise(ex => ({ ...ex, estimated_load_percent: percent }));
  }, []);

  // Make sure muscle group handlers properly handle undefined values
  const setPrimaryMuscleGroups = useCallback((groups: string[]) => {
    setExercise(ex => ({ ...ex, primary_muscle_groups: Array.isArray(groups) ? groups : [] }));
  }, []);

  const setSecondaryMuscleGroups = useCallback((groups: string[]) => {
    setExercise(ex => ({ ...ex, secondary_muscle_groups: Array.isArray(groups) ? groups : [] }));
  }, []);

  const setEquipmentType = useCallback((types: string[]) => {
    setExercise(ex => ({ ...ex, equipment_type: Array.isArray(types) ? types : [] }));
  }, []);

  const reset = useCallback(() => {
    setExercise({
      name: '',
      description: '',
      movement_pattern: 'push',
      difficulty: 'beginner',
      instructions: { steps: '', form: '' },
      is_compound: false,
      tips: [],
      variations: [],
      loading_type: undefined,
      estimated_load_percent: undefined,
      variant_category: undefined,
      is_bodyweight: false,
      energy_cost_factor: 1,
      primary_muscle_groups: [],  // Ensure this is always an empty array
      secondary_muscle_groups: [],
      equipment_type: [],
      metadata: {},
      // Reset variation fields
      base_exercise_id: undefined,
      variation_type: undefined,
      variation_value: undefined
    });
  }, []);

  // Add variation field handlers
  const setBaseExerciseId = useCallback((id: string) => {
    setExercise(ex => ({ ...ex, base_exercise_id: id }));
  }, []);

  const setVariationType = useCallback((type: string) => {
    setExercise(ex => ({ ...ex, variation_type: type }));
  }, []);

  const setVariationValue = useCallback((value: string) => {
    setExercise(ex => ({ ...ex, variation_value: value }));
  }, []);

  const handlers: ExerciseFormHandlers = {
    setName,
    setDescription,
    setMovementPattern,
    setDifficulty,
    setInstructionsSteps,
    setInstructionsForm,
    setIsCompound,
    setTips,
    addTip,
    removeTip,
    setVariations,
    addVariation,
    removeVariation,
    setIsBodyweight,
    setEstimatedLoadPercent,
    setPrimaryMuscleGroups,
    setSecondaryMuscleGroups,
    setEquipmentType,
    // Add variation handlers
    setBaseExerciseId,
    setVariationType,
    setVariationValue,
    reset
  };

  return [exercise, handlers];
};
