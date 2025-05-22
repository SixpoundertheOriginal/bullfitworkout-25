
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Star, Target, Trophy, Calendar, Flame } from "lucide-react";
import { SectionHeader } from "@/components/profile/SectionHeader";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: "award" | "star" | "target" | "trophy" | "calendar" | "flame";
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
}

export function AchievementBadges({ achievements }: AchievementBadgesProps) {
  // Helper to render the correct icon
  const renderIcon = (iconName: string, unlocked: boolean) => {
    const iconClass = cn(
      "h-8 w-8", 
      unlocked ? "text-yellow-400" : "text-gray-600"
    );
    
    switch (iconName) {
      case "award":
        return <Award className={iconClass} />;
      case "star":
        return <Star className={iconClass} />;
      case "target":
        return <Target className={iconClass} />;
      case "trophy":
        return <Trophy className={iconClass} />;
      case "calendar":
        return <Calendar className={iconClass} />;
      case "flame":
        return <Flame className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 p-6">
      <SectionHeader title="Achievements" navigateTo="/achievements" />
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={cn(
              "p-4 rounded-lg border flex flex-col items-center text-center transition-all",
              achievement.unlocked 
                ? "bg-gradient-to-b from-yellow-900/30 to-black border-yellow-700/50 hover:border-yellow-600" 
                : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800 opacity-70"
            )}
          >
            <div className="mb-3">
              {renderIcon(achievement.icon, achievement.unlocked)}
            </div>
            
            <h3 className={cn(
              "text-sm font-medium mb-1",
              achievement.unlocked ? "text-yellow-400" : "text-gray-400"
            )}>
              {achievement.name}
            </h3>
            
            <p className="text-xs text-gray-500 mb-2">
              {achievement.description}
            </p>
            
            {achievement.progress !== undefined && achievement.maxProgress && (
              <div className="mt-auto w-full">
                <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      achievement.unlocked ? "bg-yellow-500" : "bg-gray-600"
                    )}
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {achievement.progress} / {achievement.maxProgress}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
