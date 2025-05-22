
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Flame, PieChart, Zap } from 'lucide-react';
import { VisualWorkoutCard } from '@/components/workouts/VisualWorkoutCard';
import { useWorkoutRecommendations } from '@/hooks/useWorkoutRecommendations';
import { useQuickSetupTemplates } from '@/hooks/useQuickSetupTemplates';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EnhancedRecommendationsProps {
  onStartWorkout: () => void;
}

export const EnhancedRecommendations: React.FC<EnhancedRecommendationsProps> = ({
  onStartWorkout
}) => {
  const { data: recommendations, isLoading } = useWorkoutRecommendations();
  const { generateDynamicTemplate } = useQuickSetupTemplates();
  
  // Generate quick workout options based on duration
  const quickWorkoutOptions = React.useMemo(() => {
    if (!recommendations) return [];
    
    return [
      {
        title: "Quick Boost",
        duration: 15,
        intensity: 7,
        muscleGroups: ["Full Body"],
        trainingType: recommendations.trainingType || "Strength",
      },
      {
        title: "Standard Session",
        duration: 30,
        intensity: 6,
        muscleGroups: recommendations.tags || ["Upper Body", "Core"],
        trainingType: recommendations.trainingType || "Strength",
      },
      {
        title: "Complete Workout",
        duration: 45,
        intensity: 8,
        muscleGroups: recommendations.tags || ["Upper Body", "Lower Body", "Core"],
        trainingType: recommendations.trainingType || "Strength",
      }
    ];
  }, [recommendations]);
  
  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 h-48 rounded-lg" />;
  }
  
  if (!recommendations) {
    return null;
  }
  
  // Generate visual muscle focus data
  const muscleGroups = recommendations.tags || ["Chest", "Back", "Legs"];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-br from-gray-900/80 via-gray-900 to-gray-900/80 border border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-purple-400" />
            Personalized Workouts
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Personal Recommendation */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-white/70">Today's Recommendation</h4>
              <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-0.5 rounded-full">
                <Flame className="h-3 w-3 text-purple-400" />
                <span className="text-xs text-purple-300">{Math.round(recommendations.confidence * 100)}% match</span>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg border border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-gray-900 p-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-bl-full" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-white">
                    {recommendations.trainingType} Focus
                  </h3>
                  <p className="text-sm text-white/70 mb-4">
                    {recommendations.suggestedDuration} min • Optimal time: {recommendations.bestTimeOfDay}
                  </p>
                  
                  <div className="space-y-2">
                    {recommendations.reasoning?.slice(0, 2).map((reason, i) => (
                      <div key={i} className="flex items-start">
                        <div className="h-1.5 w-1.5 mt-1.5 bg-purple-400 rounded-full mr-2"></div>
                        <span className="text-xs text-white/80">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-center md:justify-end">
                  <Button 
                    onClick={onStartWorkout}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white px-6 py-3"
                  >
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Start Workout
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Workout Options */}
          <div>
            <h4 className="text-sm text-white/70 mb-3">Quick Workout Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {quickWorkoutOptions.map((option, index) => (
                <VisualWorkoutCard
                  key={index}
                  title={option.title}
                  duration={option.duration}
                  intensity={option.intensity}
                  muscleGroups={option.muscleGroups}
                  onClick={onStartWorkout}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
