
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Calendar, Timer, Award, Target, Heart } from "lucide-react";
import { SectionHeader } from "@/components/profile/SectionHeader";
import { StatCard } from "@/components/metrics/StatCard";
import { Progress } from "@/components/ui/progress";

interface ProfileDashboardProps {
  stats: {
    totalWorkouts: number;
    totalSets: number;
    averageDuration: number;
    totalDuration: number;
    profileCompletion: number;
  };
}

export function ProfileDashboard({ stats }: ProfileDashboardProps) {
  // Format time (seconds) to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get color for profile completion
  const getCompletionColor = (percentage: number) => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="bg-gray-900 border-gray-800 p-6">
      <SectionHeader title="Your Dashboard" />
      
      {/* Profile completion section */}
      <div className="mb-6 mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-400">Profile Completion</h3>
          <span className="text-sm font-medium">{stats.profileCompletion}%</span>
        </div>
        <Progress 
          value={stats.profileCompletion} 
          className="h-2" 
          indicatorClassName={getCompletionColor(stats.profileCompletion)} 
        />
        
        <div className="mt-2 text-xs text-gray-500">
          Complete your profile to get personalized workout recommendations
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard 
          icon={<Calendar className="h-5 w-5 text-purple-400" />}
          label="Total Workouts"
          value={stats.totalWorkouts.toString()}
          className="hover:border-purple-800 transition-colors"
        />
        <StatCard 
          icon={<Dumbbell className="h-5 w-5 text-purple-400" />}
          label="Total Sets"
          value={stats.totalSets.toString()}
          className="hover:border-purple-800 transition-colors"
        />
        <StatCard 
          icon={<Timer className="h-5 w-5 text-purple-400" />}
          label="Avg. Duration"
          value={formatTime(stats.averageDuration)}
          className="hover:border-purple-800 transition-colors"
        />
        <StatCard 
          icon={<Heart className="h-5 w-5 text-red-400" />}
          label="Streak"
          value="2 days"
          className="hover:border-red-800 transition-colors"
        />
        <StatCard 
          icon={<Award className="h-5 w-5 text-yellow-400" />}
          label="Achievements"
          value="3 / 24"
          className="hover:border-yellow-800 transition-colors"
        />
        <StatCard 
          icon={<Target className="h-5 w-5 text-blue-400" />}
          label="Goals"
          value="1 / 3"
          className="hover:border-blue-800 transition-colors"
        />
      </div>
    </Card>
  );
}
