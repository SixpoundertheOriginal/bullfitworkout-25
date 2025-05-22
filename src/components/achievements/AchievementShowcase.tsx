
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Medal, Star, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useExperiencePoints } from '@/hooks/useExperiencePoints';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
}

export const AchievementShowcase: React.FC = () => {
  const { experienceData, isLoading } = useExperiencePoints();
  
  // Generate achievements based on user's experience data
  const achievements = React.useMemo(() => {
    if (!experienceData) return [];
    
    const level = experienceData.level || 1;
    const totalXp = experienceData.totalXp || 0;
    const trainingsCompleted = Math.floor(totalXp / 50); // Rough estimate based on XP
    
    return [
      {
        id: 'first-workout',
        name: 'First Step',
        description: 'Complete your first workout',
        icon: <Medal className="h-6 w-6 text-amber-400" />,
        unlocked: totalXp > 0,
        progress: totalXp > 0 ? 100 : 0
      },
      {
        id: 'level-5',
        name: 'Getting Serious',
        description: 'Reach level 5',
        icon: <Star className="h-6 w-6 text-amber-400" />,
        unlocked: level >= 5,
        progress: Math.min(100, (level / 5) * 100)
      },
      {
        id: 'ten-workouts',
        name: 'Consistency',
        description: 'Complete 10 workouts',
        icon: <Trophy className="h-6 w-6 text-amber-500" />,
        unlocked: trainingsCompleted >= 10,
        progress: Math.min(100, (trainingsCompleted / 10) * 100)
      },
      {
        id: 'level-10',
        name: 'Dedicated',
        description: 'Reach level 10',
        icon: <Award className="h-6 w-6 text-amber-300" />,
        unlocked: level >= 10,
        progress: Math.min(100, (level / 10) * 100)
      }
    ] as Achievement[];
  }, [experienceData]);
  
  // Get next milestone achievement
  const nextMilestone = achievements.find(a => !a.unlocked);
  
  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 h-36 rounded-lg" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-br from-gray-900/80 via-gray-900 to-gray-900/80 border border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Achievements
            </h3>
            <span className="text-sm text-white/60">
              {achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <AchievementBadge 
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
          
          {nextMilestone && (
            <div className="mt-4 pt-3 border-t border-gray-800">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-white/70">Next milestone:</span>
                <span className="text-white/90">{nextMilestone.name}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full"
                  style={{ width: `${nextMilestone.progress || 0}%` }}
                />
              </div>
              <p className="text-xs text-white/50 mt-1.5">{nextMilestone.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface AchievementBadgeProps {
  achievement: Achievement;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center mb-1.5",
          "border-2 border-gray-700 bg-gray-800",
          achievement.unlocked && "border-yellow-500/70 bg-gradient-to-br from-yellow-900/50 to-yellow-600/20"
        )}
      >
        <div className={cn(
          "opacity-30",
          achievement.unlocked && "opacity-100"
        )}>
          {achievement.icon}
        </div>
      </div>
      <span className={cn(
        "text-xs text-center",
        achievement.unlocked ? "text-yellow-200" : "text-white/40"
      )}>
        {achievement.name}
      </span>
    </div>
  );
};
