import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Dumbbell, Activity, Zap, Clock, Target, ChevronRight } from 'lucide-react';
import { useExerciseSuggestions } from '@/hooks/useExerciseSuggestions';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';
import { processExerciseRanking } from '@/utils/processExerciseRanking';
import { MuscleSelector } from '@/components/exercises/MuscleSelector';
import { MUSCLE_GROUP_CATEGORIES } from '@/constants/exerciseMetadata';

// Function to render the Yoga icon since it's not available in lucide-react
const Yoga = () => (
  <span className="text-lg">🧘</span>
);

interface ConfigureTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTraining: (config: any) => void;
}

export function ConfigureTrainingDialog({
  open,
  onOpenChange,
  onStartTraining
}: ConfigureTrainingDialogProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [trainingType, setTrainingType] = useState('strength');
  const [duration, setDuration] = useState(45);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { suggestedExercises } = useExerciseSuggestions(trainingType);
  const { stats } = useWorkoutStats();
  
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setTrainingType('strength');
      setDuration(45);
      setSelectedMuscleGroups([]);
      setSelectedTags([]);
    }
  }, [open]);
  
  // Get recommended training type from stats
  useEffect(() => {
    if (stats?.recommendedType) {
      setTrainingType(stats.recommendedType.toLowerCase());
    }
  }, [stats]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleStartTraining();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStartTraining = () => {
    // Rank exercises based on selected criteria
    const rankedExercises = processExerciseRanking(
      suggestedExercises,
      {
        trainingType,
        bodyFocus: selectedMuscleGroups as any[],
        timeOfDay: getCurrentTimeOfDay()
      }
    );
    
    onStartTraining({
      trainingType,
      tags: selectedTags,
      duration,
      rankedExercises
    });
    
    onOpenChange(false);
  };
  
  const getCurrentTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };
  
  const toggleMuscleGroup = (muscleGroup: string) => {
    if (selectedMuscleGroups.includes(muscleGroup)) {
      setSelectedMuscleGroups(selectedMuscleGroups.filter(mg => mg !== muscleGroup));
    } else {
      setSelectedMuscleGroups([...selectedMuscleGroups, muscleGroup]);
    }
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Get predefined tags based on training type
  const suggestedTags = React.useMemo(() => {
    switch (trainingType) {
      case 'strength':
        return ['hypertrophy', 'power', 'endurance', 'max-strength'];
      case 'cardio': 
        return ['steady-state', 'intervals', 'endurance', 'recovery'];
      case 'hiit':
        return ['tabata', 'amrap', 'emom', 'circuit'];
      case 'yoga':
        return ['flexibility', 'balance', 'recovery', 'core'];
      default:
        return ['general', 'custom', 'full-body'];
    }
  }, [trainingType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold">Configure Your Workout</DialogTitle>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="px-6 pb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Step {step} of 3</span>
            <span>
              {step === 1 ? 'Training Type' : 
               step === 2 ? 'Focus Areas' : 'Duration & Tags'}
            </span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full">
            <div 
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="p-6 pt-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Choose Training Type</h3>
              <p className="text-sm text-gray-400">What type of workout do you want to do?</p>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <TrainingTypeButton
                  icon={Dumbbell}
                  label="Strength"
                  description="Build muscle & strength"
                  selected={trainingType === 'strength'}
                  onClick={() => setTrainingType('strength')}
                  color="from-blue-600 to-blue-400"
                  recommended={stats?.recommendedType?.toLowerCase() === 'strength'}
                />
                
                <TrainingTypeButton
                  icon={Activity}
                  label="Cardio"
                  description="Improve endurance"
                  selected={trainingType === 'cardio'}
                  onClick={() => setTrainingType('cardio')}
                  color="from-red-600 to-orange-400"
                  recommended={stats?.recommendedType?.toLowerCase() === 'cardio'}
                />
                
                <TrainingTypeButton
                  icon={Zap}
                  label="HIIT"
                  description="High intensity intervals"
                  selected={trainingType === 'hiit'}
                  onClick={() => setTrainingType('hiit')}
                  color="from-yellow-600 to-yellow-400"
                  recommended={stats?.recommendedType?.toLowerCase() === 'hiit'}
                />
                
                <TrainingTypeButton
                  icon={Yoga}
                  label="Yoga"
                  description="Flexibility & mobility"
                  selected={trainingType === 'yoga'}
                  onClick={() => setTrainingType('yoga')}
                  color="from-green-600 to-green-400"
                  recommended={stats?.recommendedType?.toLowerCase() === 'yoga'}
                />
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Focus Areas</h3>
              <p className="text-sm text-gray-400">Choose muscle groups to target</p>
              
              <MuscleSelector 
                selectedMuscles={selectedMuscleGroups} 
                onSelectMuscle={toggleMuscleGroup} 
              />
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                {MUSCLE_GROUP_CATEGORIES.flatMap(category => 
                  category.muscles.map(muscle => (
                    <button
                      key={muscle}
                      onClick={() => toggleMuscleGroup(muscle)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        "flex items-center justify-between",
                        selectedMuscleGroups.includes(muscle)
                          ? "bg-purple-900/50 border-purple-500/50 border text-white"
                          : "bg-gray-800/50 border-gray-700 border text-gray-400 hover:bg-gray-800"
                      )}
                    >
                      <span className="truncate">{muscle}</span>
                      {selectedMuscleGroups.includes(muscle) && (
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Duration & Tags</h3>
              <p className="text-sm text-gray-400">How long do you want to work out?</p>
              
              <div className="mt-6 px-4">
                <div className="flex justify-between mb-2 text-sm text-gray-400">
                  <span>15m</span>
                  <span>30m</span>
                  <span>45m</span>
                  <span>60m</span>
                  <span>90m+</span>
                </div>
                
                <Slider
                  defaultValue={[duration]}
                  min={15}
                  max={90}
                  step={5}
                  onValueChange={(value) => setDuration(value[0])}
                />
                
                <div className="mt-6 text-center">
                  <div className="text-3xl font-bold text-white">
                    {duration} <span className="text-xl text-gray-400">min</span>
                  </div>
                  <div className="text-purple-400 mt-1 font-medium">
                    {duration < 30 ? 'Quick' : duration < 45 ? 'Short' : duration < 60 ? 'Standard' : 'Extended'}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Workout Tags (Optional)</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm transition-all",
                        selectedTags.includes(tag)
                          ? "bg-gray-700 text-white border border-gray-600"
                          : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-800"
                      )}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="text-sm font-medium mb-2">Workout Summary</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Dumbbell className="h-4 w-4 text-purple-400 mr-2" />
                      <span className="text-sm text-gray-300">Type</span>
                    </div>
                    <div className="text-sm font-medium capitalize">
                      {trainingType}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 text-purple-400 mr-2" />
                      <span className="text-sm text-gray-300">Focus</span>
                    </div>
                    <div className="text-sm font-medium">
                      {selectedMuscleGroups.length > 0 
                        ? selectedMuscleGroups.join(', ') 
                        : 'Full Body'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-purple-400 mr-2" />
                      <span className="text-sm text-gray-300">Duration</span>
                    </div>
                    <div className="text-sm font-medium">
                      {duration} minutes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={step === 1 ? () => onOpenChange(false) : handleBack}
              className="border-gray-700"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={step === 2 && selectedMuscleGroups.length === 0}
              className="bg-purple-700 hover:bg-purple-600"
            >
              {step === 3 ? 'Start Workout' : 'Continue'}
              {step !== 3 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <button
              onClick={() => {
                onOpenChange(false);
                navigate("/setup-workout");
              }}
              className="text-sm text-purple-400 hover:text-purple-300 underline"
            >
              Try the new workout wizard
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TrainingTypeButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  color: string;
  recommended?: boolean;
}

// Updated the TrainingTypeButton component to accept a custom icon component
function TrainingTypeButton({
  icon: Icon,
  label,
  description,
  selected,
  onClick,
  color,
  recommended = false
}: TrainingTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center p-4 rounded-xl border transition-all",
        selected 
          ? "bg-gray-800 border-purple-500 shadow-lg shadow-purple-900/20" 
          : "bg-gray-900/50 border-gray-800 hover:bg-gray-800/70",
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center mb-2",
        `bg-gradient-to-br ${color}`,
      )}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      
      <h4 className="font-medium">{label}</h4>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
      
      {recommended && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/40 text-green-300 border border-green-500/30 mt-2">
          Recommended
        </span>
      )}
    </button>
  );
}
