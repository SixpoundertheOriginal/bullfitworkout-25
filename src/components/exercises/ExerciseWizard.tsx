import React, { useState, useEffect } from 'react';
import { useExercises } from '@/hooks/useExercises';
import { useAuth } from '@/hooks/useAuth';
import { Exercise, MuscleGroup, EquipmentType } from '@/types/exercise';
import { MUSCLE_GROUP_CATEGORIES } from '@/constants/exerciseMetadata';
import { Dumbbell, ChevronLeft, ChevronRight, Check, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

// Define the steps of our wizard
type WizardStep = 
  | 'muscle-selection'
  | 'exercise-selection'
  | 'equipment-selection'
  | 'variation-selection'
  | 'details'
  | 'complete';

// Define a type for exercise input that matches what the hook expects
interface ExerciseInput {
  name: string;
  user_id: string;
  primary_muscle_groups: MuscleGroup[];
  secondary_muscle_groups: MuscleGroup[];
  equipment_type: EquipmentType[];
  movement_pattern: string;
  difficulty: string;
  description?: string;
  instructions?: Record<string, any>;
  is_compound?: boolean;
  tips?: string[];
  variations?: string[];
  [key: string]: any; // Allow additional properties
}

interface ExerciseWizardProps {
  onComplete: (exercise: Exercise) => void;
  onCancel: () => void;
  className?: string;
}

export function ExerciseWizard({ onComplete, onCancel, className }: ExerciseWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('muscle-selection');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | ''>('');
  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseDescription, setExerciseDescription] = useState('');
  
  const { user } = useAuth();
  const { exercises, createExercise, isPending } = useExercises();

  // Filter exercises based on selected muscle group and search query
  const filteredExercises = exercises.filter(exercise => {
    const matchesMuscle = !selectedMuscleGroup || 
      exercise.primary_muscle_groups.includes(selectedMuscleGroup as MuscleGroup);
      
    const matchesSearch = !searchQuery || 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesMuscle && matchesSearch;
  });

  // Reset selected exercise when muscle group changes
  useEffect(() => {
    setSelectedExercise(null);
  }, [selectedMuscleGroup]);

  // Reset selected equipment when exercise changes
  useEffect(() => {
    setSelectedEquipment('');
    setSelectedVariation('');
    
    // If an exercise is selected, update the name and description fields
    if (selectedExercise) {
      setExerciseName(selectedExercise.name);
      setExerciseDescription(selectedExercise.description || '');
    }
  }, [selectedExercise]);

  // Equipment options for selected exercise
  const equipmentOptions: EquipmentType[] = [
    'barbell',
    'dumbbell',
    'kettlebell',
    'bodyweight',
    'machine',
    'cable',
    'resistance band',
    'smith machine',
  ];

  // Variation options based on selected equipment
  const getVariationOptions = () => {
    if (selectedEquipment === 'barbell') {
      return ['Standard', 'Wide Grip', 'Narrow Grip', 'Sumo', 'Reverse Grip'];
    } else if (selectedEquipment === 'dumbbell') {
      return ['Standard', 'Incline', 'Decline', 'Hammer', 'Alternating'];
    } else if (selectedEquipment === 'bodyweight') {
      return ['Standard', 'Assisted', 'Weighted', 'Decline', 'Incline'];
    } else if (selectedEquipment === 'kettlebell') {
      return ['Standard', 'Single-arm', 'Double-arm', 'Bottom-up', 'Alternating'];
    } else {
      return ['Standard', 'Wide', 'Narrow', 'Seated', 'Standing'];
    }
  };

  // Handle navigation between steps
  const goToNextStep = () => {
    switch (currentStep) {
      case 'muscle-selection':
        setCurrentStep('exercise-selection');
        break;
      case 'exercise-selection':
        setCurrentStep('equipment-selection');
        break;
      case 'equipment-selection':
        setCurrentStep('variation-selection');
        break;
      case 'variation-selection':
        setCurrentStep('details');
        break;
      case 'details':
        handleCreateExercise();
        break;
      default:
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'exercise-selection':
        setCurrentStep('muscle-selection');
        break;
      case 'equipment-selection':
        setCurrentStep('exercise-selection');
        break;
      case 'variation-selection':
        setCurrentStep('equipment-selection');
        break;
      case 'details':
        setCurrentStep('variation-selection');
        break;
      default:
        break;
    }
  };

  // Create the exercise
  const handleCreateExercise = () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create exercises"
      });
      return;
    }

    // Generate a variation name if one is selected
    const fullExerciseName = selectedVariation && selectedVariation !== 'Standard' 
      ? `${selectedVariation} ${exerciseName}`
      : exerciseName;

    // Prepare the exercise data that conforms to the ExerciseInput interface
    const exerciseData: ExerciseInput = {
      name: fullExerciseName,
      user_id: user.id,
      description: exerciseDescription,
      primary_muscle_groups: selectedExercise?.primary_muscle_groups || [selectedMuscleGroup as MuscleGroup],
      secondary_muscle_groups: selectedExercise?.secondary_muscle_groups || [],
      equipment_type: selectedEquipment ? [selectedEquipment] : ['bodyweight'],
      movement_pattern: selectedExercise?.movement_pattern || 'push',
      difficulty: selectedExercise?.difficulty || 'intermediate',
      is_compound: selectedExercise?.is_compound || false,
      instructions: selectedExercise?.instructions || {},
      tips: selectedExercise?.tips || [],
      variations: selectedExercise?.variations || [],
      
      // Additional properties
      is_bodyweight: selectedEquipment === 'bodyweight',
      base_exercise_id: selectedExercise?.id,
      variation_type: selectedVariation !== 'Standard' ? 'grip' : undefined,
      variation_value: selectedVariation !== 'Standard' ? selectedVariation : undefined,
    };

    // Create the exercise using the hook
    createExercise(exerciseData);
    
    // Set state to complete step
    setCurrentStep('complete');
    
    // Notify the parent component
    onComplete(exerciseData as unknown as Exercise);
  };

  // Get the button label based on current step
  const getNextButtonLabel = () => {
    switch (currentStep) {
      case 'details':
        return 'Create Exercise';
      default:
        return 'Next';
    }
  };

  // Check if the next button should be disabled
  const isNextDisabled = () => {
    switch (currentStep) {
      case 'muscle-selection':
        return !selectedMuscleGroup;
      case 'exercise-selection':
        return !selectedExercise && !searchQuery;
      case 'equipment-selection':
        return !selectedEquipment;
      case 'details':
        return !exerciseName;
      default:
        return false;
    }
  };

  // Render the muscle selection step
  const renderMuscleSelectionStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select Muscle Group</h2>
      <p className="text-gray-400">Choose the primary muscle group this exercise targets:</p>
      
      <div className="space-y-6">
        {MUSCLE_GROUP_CATEGORIES.map((category) => (
          <div key={category.category} className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">{category.category}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {category.muscles.map((muscle) => (
                <Button
                  key={muscle}
                  variant={selectedMuscleGroup === muscle ? "default" : "outline"}
                  className={cn(
                    "h-auto py-3 flex flex-col items-center justify-center gap-2",
                    selectedMuscleGroup === muscle 
                      ? "bg-purple-700 hover:bg-purple-600 text-white"
                      : "bg-gray-800/50 hover:bg-gray-700/50 border-gray-700"
                  )}
                  onClick={() => setSelectedMuscleGroup(muscle as MuscleGroup)}
                >
                  <Dumbbell className="h-5 w-5" />
                  <span className="text-sm">{muscle}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render the exercise selection step
  const renderExerciseSelectionStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select or Create Exercise</h2>
      
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search exercises or type new exercise name..."
          className="pl-9 bg-gray-800 border-gray-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="existing">Existing Exercises</TabsTrigger>
          <TabsTrigger value="new">Create New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing" className="mt-0">
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {filteredExercises.length > 0 ? (
              filteredExercises.map(exercise => (
                <div
                  key={exercise.id}
                  className={cn(
                    "flex items-center p-3 rounded-lg cursor-pointer transition-colors",
                    selectedExercise?.id === exercise.id 
                      ? "bg-purple-900/30 border border-purple-500/50"
                      : "bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50"
                  )}
                  onClick={() => setSelectedExercise(exercise)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-xs text-gray-400">
                      {exercise.primary_muscle_groups.join(', ')}
                    </div>
                  </div>
                  {selectedExercise?.id === exercise.id && (
                    <Check className="h-5 w-5 text-purple-500" />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                No exercises found matching your criteria
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="new" className="mt-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Exercise Name</label>
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter new exercise name"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            
            <div className="flex items-center p-3 rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div className="flex-1">
                <div className="font-medium">{searchQuery || "New Exercise"}</div>
                <div className="text-xs text-gray-400">
                  {selectedMuscleGroup || "No muscle group selected"}
                </div>
              </div>
              <Plus className="h-5 w-5 text-purple-500" />
            </div>
            
            <p className="text-sm text-gray-400">
              Creating a new exercise will allow you to customize all details in the coming steps
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Render the equipment selection step
  const renderEquipmentSelectionStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select Equipment Type</h2>
      <p className="text-gray-400">What equipment is used for this exercise?</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {equipmentOptions.map(equipment => (
          <Button
            key={equipment}
            variant={selectedEquipment === equipment ? "default" : "outline"}
            className={cn(
              "h-auto py-3 flex flex-col items-center justify-center gap-2",
              selectedEquipment === equipment 
                ? "bg-purple-700 hover:bg-purple-600 text-white"
                : "bg-gray-800/50 hover:bg-gray-700/50 border-gray-700"
            )}
            onClick={() => setSelectedEquipment(equipment)}
          >
            <Dumbbell className="h-5 w-5" />
            <span className="text-sm capitalize">{equipment.replace('-', ' ')}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  // Render the variation selection step
  const renderVariationSelectionStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select Variation</h2>
      <p className="text-gray-400">Choose how this exercise is performed:</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {getVariationOptions().map(variation => (
          <Button
            key={variation}
            variant={selectedVariation === variation ? "default" : "outline"}
            className={cn(
              "h-auto py-3 flex flex-col items-center justify-center gap-2",
              selectedVariation === variation 
                ? "bg-purple-700 hover:bg-purple-600 text-white"
                : "bg-gray-800/50 hover:bg-gray-700/50 border-gray-700"
            )}
            onClick={() => setSelectedVariation(variation)}
          >
            <span className="text-sm">{variation}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  // Render the details step
  const renderDetailsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Exercise Details</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Exercise Name</label>
          <Input 
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="Enter exercise name"
            className="bg-gray-800 border-gray-700"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Description (Optional)</label>
          <Input 
            value={exerciseDescription}
            onChange={(e) => setExerciseDescription(e.target.value)}
            placeholder="Brief description of the exercise"
            className="bg-gray-800 border-gray-700"
          />
        </div>
        
        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <h3 className="text-sm font-medium mb-2">Exercise Summary</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Target Muscle:</span>
              <span className="font-medium">{selectedMuscleGroup}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Equipment:</span>
              <span className="font-medium capitalize">{selectedEquipment.replace('-', ' ')}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Variation:</span>
              <span className="font-medium">{selectedVariation}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Full Name:</span>
              <span className="font-medium">
                {selectedVariation && selectedVariation !== 'Standard' 
                  ? `${selectedVariation} ${exerciseName}`
                  : exerciseName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render complete step
  const renderCompleteStep = () => (
    <div className="text-center space-y-6 py-10">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-800/30 border-2 border-green-500 mb-4">
        <Check className="h-10 w-10 text-green-500" />
      </div>
      
      <h2 className="text-2xl font-bold">Exercise Created!</h2>
      
      <p className="text-gray-400 max-w-md mx-auto">
        Your exercise has been successfully created and added to your exercise library.
      </p>
      
      <Button onClick={onCancel} className="mt-6">
        Close
      </Button>
    </div>
  );

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'muscle-selection':
        return renderMuscleSelectionStep();
      case 'exercise-selection':
        return renderExerciseSelectionStep();
      case 'equipment-selection':
        return renderEquipmentSelectionStep();
      case 'variation-selection':
        return renderVariationSelectionStep();
      case 'details':
        return renderDetailsStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Progress indicator */}
      {currentStep !== 'complete' && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Step {
              currentStep === 'muscle-selection' ? '1' : 
              currentStep === 'exercise-selection' ? '2' :
              currentStep === 'equipment-selection' ? '3' :
              currentStep === 'variation-selection' ? '4' : '5'
            } of 5</span>
            <span>
              {currentStep === 'muscle-selection' ? 'Muscle Group' :
               currentStep === 'exercise-selection' ? 'Exercise' :
               currentStep === 'equipment-selection' ? 'Equipment' :
               currentStep === 'variation-selection' ? 'Variation' : 'Details'}
            </span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: 
                  currentStep === 'muscle-selection' ? '20%' : 
                  currentStep === 'exercise-selection' ? '40%' :
                  currentStep === 'equipment-selection' ? '60%' :
                  currentStep === 'variation-selection' ? '80%' : '100%' 
              }}
            />
          </div>
        </div>
      )}
      
      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
      {currentStep !== 'complete' && (
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 'muscle-selection' ? onCancel : goToPreviousStep}
            className="border-gray-700"
          >
            {currentStep === 'muscle-selection' ? 'Cancel' : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </>
            )}
          </Button>
          
          <Button 
            onClick={goToNextStep}
            disabled={isNextDisabled() || isPending}
            className="bg-purple-700 hover:bg-purple-600"
          >
            {isPending ? 'Creating...' : getNextButtonLabel()}
            {!isPending && currentStep !== 'details' && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      )}
    </div>
  );
}
