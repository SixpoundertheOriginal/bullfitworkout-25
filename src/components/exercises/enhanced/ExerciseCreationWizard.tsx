
import React, { useState, useEffect } from 'react';
import { useExercises } from '@/hooks/useExercises';
import { useAuth } from '@/hooks/useAuth';
import { Exercise, MuscleGroup } from '@/types/exercise';
import { MUSCLE_GROUP_CATEGORIES } from '@/constants/exerciseMetadata';
import { Dumbbell, ChevronLeft, ChevronRight, Check, Camera, ListPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VariationType, getVariationLabel, getDefaultValueForType } from '@/types/exerciseVariation';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Define the steps of our wizard
type WizardStep = 
  | 'muscle-selection'
  | 'basic-info'
  | 'equipment-selection'
  | 'variations'
  | 'instructions'
  | 'complete';

interface ExerciseCreationWizardProps {
  onComplete: (exercise: Exercise) => void;
  onCancel: () => void;
  baseExercise?: Exercise | null;
  className?: string;
}

export function ExerciseCreationWizard({ 
  onComplete, 
  onCancel, 
  baseExercise = null,
  className 
}: ExerciseCreationWizardProps) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(baseExercise ? 'basic-info' : 'muscle-selection');
  const [progress, setProgress] = useState(0);
  
  // Exercise data
  const [exerciseName, setExerciseName] = useState(baseExercise?.name || '');
  const [description, setDescription] = useState(baseExercise?.description || '');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleGroup[]>(
    baseExercise?.primary_muscle_groups as MuscleGroup[] || []
  );
  const [secondaryMuscleGroups, setSecondaryMuscleGroups] = useState<MuscleGroup[]>(
    baseExercise?.secondary_muscle_groups as MuscleGroup[] || []
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    baseExercise?.equipment_type || ['bodyweight']
  );
  const [movementPattern, setMovementPattern] = useState(baseExercise?.movement_pattern || 'push');
  const [difficulty, setDifficulty] = useState(baseExercise?.difficulty || 'intermediate');
  const [isCompound, setIsCompound] = useState(baseExercise?.is_compound || false);
  const [isBodyweight, setIsBodyweight] = useState(
    baseExercise?.metadata?.is_bodyweight || selectedEquipment.includes('bodyweight')
  );
  const [variations, setVariations] = useState<{type: VariationType, value: string}[]>(
    baseExercise?.metadata?.variations || []
  );
  const [instructionSteps, setInstructionSteps] = useState<string[]>(
    baseExercise?.instructions?.steps || ['', '']
  );
  
  const { user } = useAuth();
  const { createExercise, isPending } = useExercises();

  // Update progress based on current step
  useEffect(() => {
    const stepProgressMap: Record<WizardStep, number> = {
      'muscle-selection': 20,
      'basic-info': 40,
      'equipment-selection': 60,
      'variations': 80,
      'instructions': 90,
      'complete': 100
    };
    
    setProgress(stepProgressMap[currentStep] || 0);
  }, [currentStep]);

  // Equipment options
  const equipmentOptions = [
    'barbell',
    'dumbbell',
    'kettlebell',
    'machine',
    'cable',
    'resistance band',
    'bodyweight',
    'smith machine',
    'suspension trainer',
    'medicine ball',
    'stability ball',
    'foam roller',
    'battle ropes'
  ];
  
  // Movement pattern options
  const movementPatterns = [
    'push',
    'pull',
    'squat',
    'hinge',
    'lunge',
    'rotation',
    'carry',
    'isometric'
  ];
  
  // Difficulty options
  const difficultyOptions = [
    'beginner',
    'intermediate',
    'advanced'
  ];
  
  // Variation type options
  const variationTypes: VariationType[] = [
    'grip',
    'angle',
    'stance',
    'equipment',
    'tempo',
    'range',
    'resistance',
    'unilateral'
  ];
  
  // Add a new instruction step
  const addInstructionStep = () => {
    setInstructionSteps([...instructionSteps, '']);
  };
  
  // Update an instruction step
  const updateInstructionStep = (index: number, value: string) => {
    const newSteps = [...instructionSteps];
    newSteps[index] = value;
    setInstructionSteps(newSteps);
  };
  
  // Delete an instruction step
  const deleteInstructionStep = (index: number) => {
    if (instructionSteps.length <= 1) return;
    const newSteps = instructionSteps.filter((_, i) => i !== index);
    setInstructionSteps(newSteps);
  };
  
  // Add a new variation
  const addVariation = () => {
    setVariations([...variations, { type: 'grip', value: '' }]);
  };
  
  // Update a variation
  const updateVariation = (index: number, field: 'type' | 'value', value: string) => {
    const newVariations = [...variations];
    if (field === 'type') {
      newVariations[index].type = value as VariationType;
      newVariations[index].value = getDefaultValueForType(value as VariationType);
    } else {
      newVariations[index].value = value;
    }
    setVariations(newVariations);
  };
  
  // Delete a variation
  const deleteVariation = (index: number) => {
    const newVariations = variations.filter((_, i) => i !== index);
    setVariations(newVariations);
  };

  // Handle navigation between steps
  const goToNextStep = () => {
    // Validation for current step
    if (currentStep === 'muscle-selection' && selectedMuscleGroups.length === 0) {
      toast({
        title: "Muscle group required",
        description: "Please select at least one primary muscle group",
        variant: "destructive"
      });
      return;
    }

    if (currentStep === 'basic-info' && !exerciseName.trim()) {
      toast({
        title: "Exercise name required",
        description: "Please enter a name for this exercise",
        variant: "destructive"
      });
      return;
    }

    switch (currentStep) {
      case 'muscle-selection':
        setCurrentStep('basic-info');
        break;
      case 'basic-info':
        setCurrentStep('equipment-selection');
        break;
      case 'equipment-selection':
        setCurrentStep('variations');
        break;
      case 'variations':
        setCurrentStep('instructions');
        break;
      case 'instructions':
        handleSubmit();
        break;
      default:
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'basic-info':
        setCurrentStep(baseExercise ? 'basic-info' : 'muscle-selection');
        break;
      case 'equipment-selection':
        setCurrentStep('basic-info');
        break;
      case 'variations':
        setCurrentStep('equipment-selection');
        break;
      case 'instructions':
        setCurrentStep('variations');
        break;
      default:
        break;
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create exercises"
      });
      return;
    }

    // Filter out empty instruction steps
    const filteredInstructionSteps = instructionSteps.filter(step => step.trim() !== '');
    
    // Filter out incomplete variations
    const filteredVariations = variations.filter(v => v.value.trim() !== '');

    // Prepare the exercise data
    const exerciseData = {
      name: exerciseName.trim(),
      user_id: user.id,
      description: description.trim(),
      primary_muscle_groups: selectedMuscleGroups,
      secondary_muscle_groups: secondaryMuscleGroups,
      equipment_type: selectedEquipment,
      movement_pattern: movementPattern,
      difficulty: difficulty,
      is_compound: isCompound,
      instructions: {
        steps: filteredInstructionSteps.length > 0 ? filteredInstructionSteps : ['Perform the exercise with proper form.']
      },
      is_bodyweight: isBodyweight,
      energy_cost_factor: 1.0,
      base_exercise_id: baseExercise?.id,
      metadata: {
        is_bodyweight: isBodyweight,
        variations: filteredVariations
      },
      variationList: filteredVariations
    };

    // Create the exercise
    createExercise(exerciseData);
    
    // Set to complete step
    setCurrentStep('complete');
    
    // Notify the parent component
    onComplete(exerciseData as unknown as Exercise);
    
    // Show success message
    toast({
      title: "Exercise created successfully",
      description: `"${exerciseName}" has been added to your exercise library.`
    });
  };

  // Determine if the next button should be disabled
  const isNextDisabled = () => {
    switch (currentStep) {
      case 'muscle-selection':
        return selectedMuscleGroups.length === 0;
      case 'basic-info':
        return !exerciseName.trim();
      default:
        return false;
    }
  };

  // Render different step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'muscle-selection':
        return renderMuscleSelectionStep();
      case 'basic-info':
        return renderBasicInfoStep();
      case 'equipment-selection':
        return renderEquipmentStep();
      case 'variations':
        return renderVariationsStep();
      case 'instructions':
        return renderInstructionsStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return null;
    }
  };

  // Muscle Selection Step
  const renderMuscleSelectionStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Select Target Muscles</h2>
        <p className="text-gray-400">Choose the primary muscles this exercise targets</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Primary Muscle Groups</h3>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUP_CATEGORIES.flatMap(category => 
              category.muscles.map(muscle => (
                <Badge 
                  key={muscle}
                  variant={selectedMuscleGroups.includes(muscle as MuscleGroup) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer py-1 px-3",
                    selectedMuscleGroups.includes(muscle as MuscleGroup) 
                      ? "bg-purple-700 hover:bg-purple-600" 
                      : "bg-gray-800 hover:bg-gray-700"
                  )}
                  onClick={() => {
                    if (selectedMuscleGroups.includes(muscle as MuscleGroup)) {
                      setSelectedMuscleGroups(selectedMuscleGroups.filter(m => m !== muscle));
                    } else {
                      setSelectedMuscleGroups([...selectedMuscleGroups, muscle as MuscleGroup]);
                    }
                  }}
                >
                  {muscle}
                </Badge>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Secondary Muscle Groups (Optional)</h3>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUP_CATEGORIES.flatMap(category => 
              category.muscles.map(muscle => (
                <Badge 
                  key={muscle}
                  variant={secondaryMuscleGroups.includes(muscle as MuscleGroup) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer py-1 px-3",
                    secondaryMuscleGroups.includes(muscle as MuscleGroup) 
                      ? "bg-blue-700 hover:bg-blue-600" 
                      : "bg-gray-800 hover:bg-gray-700"
                  )}
                  onClick={() => {
                    if (secondaryMuscleGroups.includes(muscle as MuscleGroup)) {
                      setSecondaryMuscleGroups(secondaryMuscleGroups.filter(m => m !== muscle));
                    } else {
                      setSecondaryMuscleGroups([...secondaryMuscleGroups, muscle as MuscleGroup]);
                    }
                  }}
                >
                  {muscle}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Basic Info Step
  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Exercise Details</h2>
        <p className="text-gray-400">Enter basic information about this exercise</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Exercise Name*</label>
          <Input 
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="e.g., Bench Press, Squat, Push-up"
            className="bg-gray-800 border-gray-700"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Description</label>
          <Textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the exercise and its benefits"
            className="bg-gray-800 border-gray-700 min-h-[100px]"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Movement Pattern</label>
            <Select value={movementPattern} onValueChange={setMovementPattern}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {movementPatterns.map(pattern => (
                  <SelectItem key={pattern} value={pattern} className="capitalize">
                    {pattern}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Difficulty</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficultyOptions.map(option => (
                  <SelectItem key={option} value={option} className="capitalize">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="is-compound"
            checked={isCompound}
            onChange={(e) => setIsCompound(e.target.checked)}
            className="h-4 w-4 rounded border-gray-700 bg-gray-800"
          />
          <label htmlFor="is-compound" className="text-sm text-gray-300">
            This is a compound exercise (works multiple muscle groups)
          </label>
        </div>
      </div>
    </div>
  );

  // Equipment Step
  const renderEquipmentStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Equipment</h2>
        <p className="text-gray-400">Select the equipment needed for this exercise</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {equipmentOptions.map(equipment => (
            <Button
              key={equipment}
              variant={selectedEquipment.includes(equipment) ? "default" : "outline"}
              className={cn(
                "h-auto py-3 flex flex-col items-center justify-center gap-2 capitalize",
                selectedEquipment.includes(equipment) 
                  ? "bg-purple-700 hover:bg-purple-600 text-white"
                  : "bg-gray-800/50 hover:bg-gray-700/50 border-gray-700"
              )}
              onClick={() => {
                if (selectedEquipment.includes(equipment)) {
                  setSelectedEquipment(selectedEquipment.filter(e => e !== equipment));
                } else {
                  setSelectedEquipment([...selectedEquipment, equipment]);
                }
                
                // Update bodyweight status if bodyweight is toggled
                if (equipment === 'bodyweight') {
                  setIsBodyweight(!selectedEquipment.includes('bodyweight'));
                }
              }}
            >
              <Dumbbell className="h-5 w-5" />
              <span className="text-sm">{equipment.replace('-', ' ')}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="is-bodyweight"
            checked={isBodyweight}
            onChange={(e) => setIsBodyweight(e.target.checked)}
            className="h-4 w-4 rounded border-gray-700 bg-gray-800"
          />
          <label htmlFor="is-bodyweight" className="text-sm text-gray-300">
            This is a bodyweight exercise (no external weight required)
          </label>
        </div>
      </div>
    </div>
  );

  // Variations Step
  const renderVariationsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Exercise Variations</h2>
        <p className="text-gray-400">Add variations of this exercise (optional)</p>
      </div>
      
      <div className="space-y-4">
        {variations.map((variation, index) => (
          <Card key={index} className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-4 px-4 pb-4">
              <div className="grid grid-cols-5 gap-3 items-start">
                <div className="col-span-2">
                  <Select 
                    value={variation.type} 
                    onValueChange={(value) => updateVariation(index, 'type', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Variation Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {variationTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {getVariationLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Input 
                    value={variation.value}
                    onChange={(e) => updateVariation(index, 'value', e.target.value)}
                    placeholder="Value (e.g., Wide, 45°)"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => deleteVariation(index)}
                  className="bg-red-900/30 border-red-800/50 hover:bg-red-900/50"
                >
                  &times;
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button 
          variant="outline" 
          onClick={addVariation}
          className="w-full bg-gray-800/50 border-dashed border-gray-600 hover:bg-gray-700/50"
        >
          <ListPlus className="h-4 w-4 mr-2" /> Add Variation
        </Button>
      </div>
    </div>
  );

  // Instructions Step
  const renderInstructionsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Exercise Instructions</h2>
        <p className="text-gray-400">Add step-by-step instructions for proper form</p>
      </div>
      
      <div className="space-y-4">
        {instructionSteps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="pt-2 font-bold text-gray-400">
              {index + 1}.
            </div>
            <Textarea 
              value={step}
              onChange={(e) => updateInstructionStep(index, e.target.value)}
              placeholder={`Step ${index + 1} instructions...`}
              className="bg-gray-800 border-gray-700 flex-1"
            />
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => deleteInstructionStep(index)}
              disabled={instructionSteps.length <= 1}
              className="bg-red-900/30 border-red-800/50 hover:bg-red-900/50 mt-1"
            >
              &times;
            </Button>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          onClick={addInstructionStep}
          className="w-full bg-gray-800/50 border-dashed border-gray-600 hover:bg-gray-700/50"
        >
          <ListPlus className="h-4 w-4 mr-2" /> Add Step
        </Button>
        
        {/* Media section - placeholder for future implementation */}
        <div className="pt-4 border-t border-gray-700 mt-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Add Media (Coming Soon)</h3>
          <Button 
            variant="outline" 
            className="w-full bg-gray-800/50 border-dashed border-gray-600 hover:bg-gray-700/50"
            disabled
          >
            <Camera className="h-4 w-4 mr-2" /> Add Images/Videos
          </Button>
        </div>
      </div>
    </div>
  );

  // Complete Step
  const renderCompleteStep = () => (
    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
      <div className="rounded-full bg-green-600/20 p-3">
        <Check className="h-8 w-8 text-green-500" />
      </div>
      <h2 className="text-xl font-semibold">Exercise Created!</h2>
      <p className="text-gray-400 max-w-md">
        "{exerciseName}" has been successfully added to your exercise library.
      </p>
      <div className="pt-4 flex gap-4">
        <Button 
          variant="default"
          onClick={() => onComplete(null as unknown as Exercise)} // Close the wizard
          className="min-w-[120px]"
        >
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-8", className)}>
      {/* Progress indicator */}
      {currentStep !== 'complete' && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Step {
              currentStep === 'muscle-selection' ? '1' : 
              currentStep === 'basic-info' ? '2' : 
              currentStep === 'equipment-selection' ? '3' : 
              currentStep === 'variations' ? '4' : '5'
            } of 5</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}
      
      {/* Step content */}
      <div>
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
      {currentStep !== 'complete' && (
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="bg-gray-800 border-gray-700"
          >
            Cancel
          </Button>
          
          <div className="flex gap-3">
            {currentStep !== 'muscle-selection' && !baseExercise && (
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                className="px-4 bg-gray-800 border-gray-700"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            
            <Button
              onClick={goToNextStep}
              disabled={isNextDisabled() || isPending}
              className={currentStep === 'instructions' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Saving...
                </span>
              ) : currentStep === 'instructions' ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Create Exercise
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Next <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
