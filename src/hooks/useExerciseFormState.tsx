
import { useState, useEffect, useCallback } from 'react';
import { Exercise, MovementPattern, Difficulty, MuscleGroup } from '@/types/exercise';
import { Variation } from '@/types/exerciseVariation';

const emptyExercise = {
  name: '',
  description: '',
  primary_muscle_groups: [],
  secondary_muscle_groups: [],
  equipment_type: [],
  instructions: {
    steps: [],
    video_url: '',
  },
  is_compound: false,
  is_bodyweight: false,
  difficulty: '',
  movement_pattern: '',
  variationList: [],
};

export function useExerciseFormState(initialExercise: Exercise | undefined, isOpen: boolean) {
  const [exercise, setExercise] = useState<any>(emptyExercise);

  // Reset form when dialog opens/closes or initialExercise changes
  useEffect(() => {
    if (isOpen) {
      if (initialExercise) {
        // Initialize variationList from metadata if it exists
        const variationList = initialExercise.metadata?.variations || [];
        
        // Transform instructions if needed
        let instructions = initialExercise.instructions || { steps: [], video_url: '' };
        if (typeof instructions === 'object' && !Array.isArray(instructions.steps)) {
          // If instructions is an object but doesn't have steps array, create it
          const steps = Object.entries(instructions)
            .filter(([key]) => !isNaN(Number(key)))
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([, value]) => value as string);
            
          instructions = { ...instructions, steps, video_url: instructions.video_url || '' };
        }
        
        setExercise({
          ...initialExercise,
          instructions,
          variationList,
        });
      } else {
        setExercise(emptyExercise);
      }
    }
  }, [initialExercise, isOpen]);

  // Basic field handlers
  const setName = (name: string) => setExercise({ ...exercise, name });
  const setDescription = (description: string) => setExercise({ ...exercise, description });
  const setDifficulty = (difficulty: string) => setExercise({ ...exercise, difficulty });
  const setMovementPattern = (movement_pattern: string) => setExercise({ ...exercise, movement_pattern });
  const setIsCompound = (is_compound: boolean) => setExercise({ ...exercise, is_compound });
  const setIsBodyweight = (is_bodyweight: boolean) => setExercise({ ...exercise, is_bodyweight });

  // Muscle group handlers
  const addPrimaryMuscle = (muscle: string) => {
    const primary_muscle_groups = [...(exercise.primary_muscle_groups || [])];
    if (!primary_muscle_groups.includes(muscle)) {
      primary_muscle_groups.push(muscle);
      setExercise({ ...exercise, primary_muscle_groups });
    }
  };

  const removePrimaryMuscle = (muscle: string) => {
    const primary_muscle_groups = (exercise.primary_muscle_groups || []).filter(
      (m: string) => m !== muscle
    );
    setExercise({ ...exercise, primary_muscle_groups });
  };

  const addSecondaryMuscle = (muscle: string) => {
    const secondary_muscle_groups = [...(exercise.secondary_muscle_groups || [])];
    if (!secondary_muscle_groups.includes(muscle)) {
      secondary_muscle_groups.push(muscle);
      setExercise({ ...exercise, secondary_muscle_groups });
    }
  };

  const removeSecondaryMuscle = (muscle: string) => {
    const secondary_muscle_groups = (exercise.secondary_muscle_groups || []).filter(
      (m: string) => m !== muscle
    );
    setExercise({ ...exercise, secondary_muscle_groups });
  };

  // Equipment handlers
  const addEquipment = (equipment: string) => {
    const equipment_type = [...(exercise.equipment_type || [])];
    if (!equipment_type.includes(equipment)) {
      equipment_type.push(equipment);
      setExercise({ ...exercise, equipment_type });
    }
  };

  const removeEquipment = (equipment: string) => {
    const equipment_type = (exercise.equipment_type || []).filter(
      (e: string) => e !== equipment
    );
    setExercise({ ...exercise, equipment_type });
  };

  // Instruction handlers
  const addInstructionStep = (step: string) => {
    const instructions = {
      ...(exercise.instructions || {}),
      steps: [...(exercise.instructions?.steps || []), step],
    };
    setExercise({ ...exercise, instructions });
  };

  const updateInstructionStep = (index: number, value: string) => {
    const steps = [...(exercise.instructions?.steps || [])];
    steps[index] = value;
    const instructions = { ...(exercise.instructions || {}), steps };
    setExercise({ ...exercise, instructions });
  };

  const removeInstructionStep = (index: number) => {
    const steps = (exercise.instructions?.steps || []).filter(
      (_: string, i: number) => i !== index
    );
    const instructions = { ...(exercise.instructions || {}), steps };
    setExercise({ ...exercise, instructions });
  };

  const setInstructionVideoUrl = (video_url: string) => {
    const instructions = { ...(exercise.instructions || {}), video_url };
    setExercise({ ...exercise, instructions });
  };

  // Variation handlers
  const addVariation = (variation: Variation) => {
    const variationList = [...(exercise.variationList || []), variation];
    setExercise({ ...exercise, variationList });
  };

  const removeVariation = (index: number) => {
    const variationList = (exercise.variationList || []).filter(
      (_: Variation, i: number) => i !== index
    );
    setExercise({ ...exercise, variationList });
  };

  return [
    exercise,
    {
      setName,
      setDescription,
      setDifficulty,
      setMovementPattern,
      setIsCompound,
      setIsBodyweight,
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
      addVariation,
      removeVariation,
    },
  ] as const;
}
