
import React, { useState } from 'react';
import { Exercise } from '@/types/exercise';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Edit, 
  Dumbbell, 
  Clock, 
  BarChart3, 
  Info, 
  Clipboard, 
  ListOrdered
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useHaptics } from '@/hooks/use-haptics';
import { IOSButton } from '@/components/ui/ios-button';

interface EnhancedExerciseDetailViewProps {
  exercise: Exercise;
  onClose: () => void;
  onEditExercise?: (exercise: Exercise) => void;
}

export const EnhancedExerciseDetailView: React.FC<EnhancedExerciseDetailViewProps> = ({
  exercise,
  onClose,
  onEditExercise
}) => {
  const { triggerHaptic } = useHaptics();
  const [activeTab, setActiveTab] = useState('details');
  
  const handleChangeTab = (value: string) => {
    triggerHaptic('selection');
    setActiveTab(value);
  };
  
  // Get difficulty and map to color
  const difficultyColor = {
    'beginner': 'bg-green-900/20 text-green-500 border-green-700/20',
    'intermediate': 'bg-blue-900/20 text-blue-500 border-blue-700/20',
    'advanced': 'bg-orange-900/20 text-orange-500 border-orange-700/20',
    'expert': 'bg-red-900/20 text-red-500 border-red-700/20',
  }[exercise?.difficulty as string] || 'bg-gray-800/50 border-gray-700';
  
  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="flex flex-col h-full border-gray-800 bg-gray-900/40">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-purple-400" />
              {exercise.name}
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => {
              triggerHaptic('selection');
              onClose();
            }}
            haptic
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <div className="px-6">
          {/* Badges for metadata */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {exercise.difficulty && (
              <Badge variant="outline" className={difficultyColor}>
                {exercise.difficulty}
              </Badge>
            )}
            {exercise.movement_pattern && (
              <Badge variant="outline" className="bg-gray-800/50 border-gray-700">
                {exercise.movement_pattern}
              </Badge>
            )}
            {exercise.is_compound && (
              <Badge variant="outline" className="bg-purple-900/30 text-purple-400 border-purple-700/30">
                Compound
              </Badge>
            )}
            {exercise.is_bodyweight && (
              <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-700/30">
                Bodyweight
              </Badge>
            )}
          </div>

          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={handleChangeTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="instructions">How To</TabsTrigger>
              <TabsTrigger value="data">Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="h-[calc(100%-40px)]">
              <ScrollArea className="h-full pr-4">
                {exercise.description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
                    <p className="text-sm text-gray-300">{exercise.description}</p>
                  </div>
                )}
                
                {exercise.primary_muscle_groups && exercise.primary_muscle_groups.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Primary Muscles</h3>
                    <div className="flex flex-wrap gap-1">
                      {exercise.primary_muscle_groups.map((muscle, i) => (
                        <Badge key={i} variant="outline" className="bg-gray-800/70 border-gray-700 capitalize">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {exercise.secondary_muscle_groups && exercise.secondary_muscle_groups.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Secondary Muscles</h3>
                    <div className="flex flex-wrap gap-1">
                      {exercise.secondary_muscle_groups.map((muscle, i) => (
                        <Badge key={i} variant="outline" className="bg-gray-900/70 border-gray-800 text-gray-400 capitalize">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {exercise.equipment_type && exercise.equipment_type.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Equipment</h3>
                    <div className="flex flex-wrap gap-1">
                      {exercise.equipment_type.map((equipment, i) => (
                        <Badge key={i} variant="outline" className="bg-gray-800/50 border-gray-700 capitalize">
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {exercise.tips && exercise.tips.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Tips</h3>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      {exercise.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="instructions" className="h-[calc(100%-40px)]">
              <ScrollArea className="h-full pr-4">
                {exercise.instructions && exercise.instructions.steps && exercise.instructions.steps.length > 0 ? (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Instructions</h3>
                    <ol className="text-sm text-gray-300 space-y-3 list-decimal list-outside ml-5">
                      {exercise.instructions.steps.map((step, i) => (
                        <li key={i} className="pl-1">{step}</li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ListOrdered className="h-10 w-10 text-gray-500 mb-2" />
                    <p className="text-gray-500">No instructions available for this exercise</p>
                  </div>
                )}
                
                {/* Display media if available */}
                {exercise.instructions.video_url && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Demonstration</h3>
                    <div className="aspect-video bg-gray-800 rounded-md overflow-hidden">
                      <iframe 
                        src={exercise.instructions.video_url} 
                        className="w-full h-full" 
                        title={`${exercise.name} demonstration`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
                
                {exercise.instructions.image_url && !exercise.instructions.video_url && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Demonstration</h3>
                    <div className="aspect-video bg-gray-800 rounded-md overflow-hidden flex items-center justify-center">
                      <img 
                        src={exercise.instructions.image_url} 
                        alt={`${exercise.name} demonstration`}
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="data" className="h-[calc(100%-40px)]">
              <ScrollArea className="h-full pr-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Movement Type</div>
                      <div className="text-lg font-medium capitalize">
                        {exercise.movement_pattern || 'Unknown'}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">Exercise Type</div>
                      <div className="text-lg font-medium">
                        {exercise.is_compound ? 'Compound' : 'Isolation'}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {exercise.is_bodyweight && exercise.load_factor && (
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-3 text-center">
                        <div className="text-xs text-gray-400 mb-1">Load Factor</div>
                        <div className="text-lg font-medium">
                          {exercise.load_factor * 100}%
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                {/* Placeholder for exercise analytics */}
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BarChart3 className="h-10 w-10 text-gray-500 mb-2" />
                  <p className="text-gray-500">Exercise stats will appear here after you complete workouts with this exercise</p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        <CardFooter className="mt-auto pt-4">
          {onEditExercise && (
            <IOSButton
              fullWidth
              variant="tinted"
              iconLeft={<Edit className="h-4 w-4" />}
              onClick={() => {
                triggerHaptic('selection');
                onEditExercise(exercise);
              }}
              haptic
            >
              Edit Exercise
            </IOSButton>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default EnhancedExerciseDetailView;
