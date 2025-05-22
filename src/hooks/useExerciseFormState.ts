import { useState, useEffect, useCallback } from 'react';
import { MovementPattern, Difficulty, MuscleGroup } from '@/types/exercise';
import { Variation } from '@/types/exerciseVariation';

// Define the exercise state type
export interface ExerciseFormState {
  name: string;
  description: string;
  movement_pattern: MovementPattern;
  difficulty: Difficulty;
  instructions: { 
    steps: string[];  // Changed from string to string[]
    form: string;
    video_url?: string; // Added video_url property
  };
  is_compound: boolean;
  tips: string[];
  variations: string[];
  loading_type: string | undefined;
  estimated_load_percent: number | undefined;
  variant_category: string | undefined;
  is_bodyweight: boolean;
  energy_cost_factor: number;
  primary_muscle_groups: MuscleGroup[];
  secondary_muscle_groups: MuscleGroup[];
  equipment_type: string[];
  metadata: Record<string, any>;
  // Add variation fields
  base_exercise_id?: string;
  variation_type?: string;
  variation_value?: string;
  // New field for array-based variations
  variationList: Variation[];
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
  setPrimaryMuscleGroups: (groups: MuscleGroup[]) => void;
  setSecondaryMuscleGroups: (groups: MuscleGroup[]) => void;
  setEquipmentType: (types: string[]) => void;
  // Add variation handlers
  setBaseExerciseId?: (id: string) => void;
  setVariationType?: (type: string) => void;
  setVariationValue?: (value: string) => void;
  // New handlers for variation list
  addVariationToList: (variation: Variation) => void;
  removeVariationFromList: (index: number) => void;
  // Add the missing handlers
  addPrimaryMuscle: (muscle: string) => void;
  removePrimaryMuscle: (muscle: string) => void;
  addSecondaryMuscle: (muscle: string) => void;
  removeSecondaryMuscle: (muscle: string) => void;
  addEquipment: (equipment: string) => void;
  removeEquipment: (equipment: string) => void;
  addInstructionStep: (step: string) => void;
  updateInstructionStep: (index: number, value: string) => void;
  removeInstructionStep: (index: number) => void;
  setInstructionVideoUrl: (url: string) => void;
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
    instructions: { steps: [], form: '', video_url: '' }, // Initialize steps as array, add video_url
    is_compound: false,
    tips: [],
    variations: [],
    loading_type: undefined,
    estimated_load_percent: undefined,
    variant_category: undefined,
    is_bodyweight: false,
    energy_cost_factor: 1,
    primary_muscle_groups: [],
    secondary_muscle_groups: [],
    equipment_type: [],
    metadata: {},
    // Default values for variation fields
    base_exercise_id: undefined,
    variation_type: undefined,
    variation_value: undefined,
    // New field for variation list
    variationList: []
  });

  // Reset or seed form when initialExercise changes or dialog opens/closes
  useEffect(() => {
    if (initialExercise) {
      // Convert single variation_type/value to variationList if needed
      let variationList: Variation[] = initialExercise.variationList || [];
      
      // If we have legacy variation fields but no list, create a variation item
      if (initialExercise.variation_type && initialExercise.variation_value && !initialExercise.variationList) {
        variationList = [{
          type: initialExercise.variation_type as any,
          value: initialExercise.variation_value
        }];
      }

      // Ensure instructions.steps is always an array
      const instructionSteps = Array.isArray(initialExercise.instructions?.steps) 
        ? initialExercise.instructions?.steps 
        : [];

      setExercise({
        ...exercise,
        ...initialExercise,
        instructions: {
          steps: instructionSteps,
          form: initialExercise.instructions?.form ?? '',
          video_url: initialExercise.instructions?.video_url ?? '',
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
        variation_value: initialExercise.variation_value,
        // Set variation list
        variationList: variationList
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
      instructions: { ...ex.instructions, steps: [steps] } 
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

  // Add the missing muscle group handlers
  const addPrimaryMuscle = useCallback((muscle: string) => {
    setExercise(ex => {
      const primary_muscle_groups = [...ex.primary_muscle_groups];
      if (!primary_muscle_groups.includes(muscle as MuscleGroup)) {
        primary_muscle_groups.push(muscle as MuscleGroup);
      }
      return { ...ex, primary_muscle_groups };
    });
  }, []);

  const removePrimaryMuscle = useCallback((muscle: string) => {
    setExercise(ex => {
      const primary_muscle_groups = ex.primary_muscle_groups.filter(
        m => m !== muscle
      );
      return { ...ex, primary_muscle_groups };
    });
  }, []);

  const addSecondaryMuscle = useCallback((muscle: string) => {
    setExercise(ex => {
      const secondary_muscle_groups = [...ex.secondary_muscle_groups];
      if (!secondary_muscle_groups.includes(muscle as MuscleGroup)) {
        secondary_muscle_groups.push(muscle as MuscleGroup);
      }
      return { ...ex, secondary_muscle_groups };
    });
  }, []);

  const removeSecondaryMuscle = useCallback((muscle: string) => {
    setExercise(ex => {
      const secondary_muscle_groups = ex.secondary_muscle_groups.filter(
        m => m !== muscle
      );
      return { ...ex, secondary_muscle_groups };
    });
  }, []);

  // Add equipment handlers
  const addEquipment = useCallback((equipment: string) => {
    setExercise(ex => {
      const equipment_type = [...ex.equipment_type];
      if (!equipment_type.includes(equipment)) {
        equipment_type.push(equipment);
      }
      return { ...ex, equipment_type };
    });
  }, []);

  const removeEquipment = useCallback((equipment: string) => {
    setExercise(ex => {
      const equipment_type = ex.equipment_type.filter(e => e !== equipment);
      return { ...ex, equipment_type };
    });
  }, []);

  // Add instruction handlers
  const addInstructionStep = useCallback((step: string) => {
    setExercise(ex => {
      const steps = [...(ex.instructions?.steps || [])];
      steps.push(step);
      return {
        ...ex,
        instructions: {
          ...ex.instructions,
          steps
        }
      };
    });
  }, []);

  const updateInstructionStep = useCallback((index: number, value: string) => {
    setExercise(ex => {
      const steps = [...(ex.instructions?.steps || [])];
      steps[index] = value;
      return {
        ...ex,
        instructions: {
          ...ex.instructions,
          steps
        }
      };
    });
  }, []);

  const removeInstructionStep = useCallback((index: number) => {
    setExercise(ex => {
      const steps = [...(ex.instructions?.steps || [])].filter((_, i) => i !== index);
      return {
        ...ex,
        instructions: {
          ...ex.instructions,
          steps
        }
      };
    });
  }, []);

  const setInstructionVideoUrl = useCallback((video_url: string) => {
    setExercise(ex => ({
      ...ex,
      instructions: {
        ...ex.instructions,
        video_url
      }
    }));
  }, []);

  // Keep muscle group handlers with correct types
  const setPrimaryMuscleGroups = useCallback((groups: MuscleGroup[]) => {
    setExercise(ex => ({ ...ex, primary_muscle_groups: Array.isArray(groups) ? groups : [] }));
  }, []);

  const setSecondaryMuscleGroups = useCallback((groups: MuscleGroup[]) => {
    setExercise(ex => ({ ...ex, secondary_muscle_groups: Array.isArray(groups) ? groups : [] }));
  }, []);

  const setEquipmentType = useCallback((types: string[]) => {
    setExercise(ex => ({ ...ex, equipment_type: Array.isArray(types) ? types : [] }));
  }, []);

  // Add handlers for variation list
  const addVariationToList = useCallback((variation: Variation) => {
    setExercise(ex => {
      // Ensure we have a valid list
      const currentList = Array.isArray(ex.variationList) ? ex.variationList : [];
      
      // Add the new variation
      return { 
        ...ex, 
        variationList: [...currentList, variation],
        // Also update legacy fields to the last added variation for backward compatibility
        variation_type: variation.type,
        variation_value: variation.value
      };
    });
  }, []);

  const removeVariationFromList = useCallback((index: number) => {
    setExercise(ex => {
      // Filter out the variation at the given index
      const updatedList = Array.isArray(ex.variationList) 
        ? ex.variationList.filter((_, i) => i !== index) 
        : [];
      
      // Update the legacy fields based on the most recent variation
      const lastVariation = updatedList.length > 0 ? updatedList[updatedList.length - 1] : null;
      
      return { 
        ...ex, 
        variationList: updatedList,
        // Update legacy fields if there are still variations, otherwise clear them
        variation_type: lastVariation ? lastVariation.type : undefined,
        variation_value: lastVariation ? lastVariation.value : undefined
      };
    });
  }, []);

  const reset = useCallback(() => {
    setExercise({
      name: '',
      description: '',
      movement_pattern: 'push',
      difficulty: 'beginner',
      instructions: { steps: [], form: '', video_url: '' },  // Initialize steps as array, add video_url
      is_compound: false,
      tips: [],
      variations: [],
      loading_type: undefined,
      estimated_load_percent: undefined,
      variant_category: undefined,
      is_bodyweight: false,
      energy_cost_factor: 1,
      primary_muscle_groups: [],
      secondary_muscle_groups: [],
      equipment_type: [],
      metadata: {},
      // Reset variation fields
      base_exercise_id: undefined,
      variation_type: undefined,
      variation_value: undefined,
      // Reset variation list
      variationList: []
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
    // New variation list handlers
    addVariationToList,
    removeVariationFromList,
    // Add the newly implemented handlers
    addPrimaryMuscle,
    removePrimaryMuscle,
    addSecondaryMuscle,
    removeSecondaryMuscle,
    addEquipment,
    removeEquipment,
    addInstructionStep,
    updateInstructionStep,
    removeInstructionStep,
    setInstructionVideoUrl,
    reset
  };

  return [exercise, handlers];
};
