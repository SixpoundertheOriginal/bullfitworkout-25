
import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Calendar, CircleCheck, Zap } from 'lucide-react';
import { MetricCard } from '@/components/metrics/MetricCard';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const ProgressSnapshot: React.FC = () => {
  const { stats, loading } = useWorkoutStats();
  
  // Extract weekly metrics from stats with safe fallbacks
  const weeklyWorkouts = stats?.weeklyWorkouts || 0;
  const lastWeekWorkouts = stats?.lastWeekWorkouts || 0;
  const workoutChange = weeklyWorkouts - lastWeekWorkouts;
  const workoutChangePercent = lastWeekWorkouts ? Math.round((workoutChange / lastWeekWorkouts) * 100) : 0;
  
  const weeklyVolume = stats?.weeklyVolume || 0;
  const lastWeekVolume = stats?.lastWeekVolume || 0;
  const volumeChange = weeklyVolume - lastWeekVolume;
  const volumeChangePercent = lastWeekVolume ? Math.round((volumeChange / lastWeekVolume) * 100) : 0;
  
  // Generate streakData array for mini-calendar visualization
  const currentStreak = stats?.streakDays || 0;
  const streakData = Array(7).fill(false);
  
  // Fill in streak data based on dailyWorkouts
  if (stats?.dailyWorkouts) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    
    days.forEach((day, index) => {
      // Convert to lowercase for comparison
      const dayLower = day.toLowerCase();
      const adjustedIndex = (index + today) % 7; // Adjust index to make today the last day
      
      if (stats.dailyWorkouts[dayLower]) {
        streakData[adjustedIndex] = true;
      }
    });
  }
  
  if (loading) {
    return <div className="animate-pulse bg-gray-800 h-24 rounded-lg" />;
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {/* Weekly Workouts Metric */}
      <MetricCard
        icon={Calendar}
        value={weeklyWorkouts}
        label="Weekly Workouts"
        description={workoutChange !== 0 ? `${Math.abs(workoutChange)} ${workoutChange > 0 ? 'more' : 'fewer'} than last week` : 'Same as last week'}
        badgeText={workoutChange !== 0 ? `${workoutChange > 0 ? '+' : ''}${workoutChangePercent}%` : 'No change'}
        badgeColor={workoutChange > 0 ? 'text-green-400' : workoutChange < 0 ? 'text-red-400' : 'text-blue-400'}
        gradientClass="from-blue-500/20 via-transparent to-blue-500/20"
        valueClass="text-blue-400"
      />
      
      {/* Weekly Volume Metric */}
      <MetricCard
        icon={Zap}
        value={`${Math.round(weeklyVolume).toLocaleString()}`}
        label="Weekly Volume"
        description={volumeChange !== 0 ? `${Math.abs(Math.round(volumeChange)).toLocaleString()} ${volumeChange > 0 ? 'more' : 'less'} than last week` : 'Same as last week'}
        badgeText={volumeChange !== 0 ? `${volumeChange > 0 ? '+' : ''}${volumeChangePercent}%` : 'No change'}
        badgeColor={volumeChange > 0 ? 'text-green-400' : volumeChange < 0 ? 'text-red-400' : 'text-blue-400'}
        gradientClass="from-purple-500/20 via-transparent to-purple-500/20"
        valueClass="text-purple-400"
      />
      
      {/* Streak Mini-Calendar */}
      <Card className="bg-gradient-to-br from-gray-900/80 via-gray-900 to-gray-900/80 border border-gray-800 shadow p-4">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-2">
            <div className="bg-white/5 rounded-full p-1.5">
              <CircleCheck className="h-3.5 w-3.5 text-white/70" />
            </div>
            <span className="text-xs font-medium text-white/70">{currentStreak > 0 ? `${currentStreak} day streak` : 'Start a streak!'}</span>
          </div>
          
          <div className="text-xl font-bold mb-1 text-green-400">
            Weekly Consistency
          </div>
          
          <div className="mt-auto flex justify-between items-center">
            {streakData.map((isActive, i) => (
              <div 
                key={i}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs",
                  isActive ? "bg-green-500/30 border border-green-500/50" : "bg-gray-800/30 border border-gray-800"
                )}
              >
                {isActive && <div className="w-2 h-2 rounded-full bg-green-400" />}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
