
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, TrendingUp, Zap, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useExperiencePoints } from '@/hooks/useExperiencePoints';
import { ExperienceDisplay } from '@/components/training/ExperienceDisplay';

export function ExperienceSummaryCard() {
  const { experienceData, isLoading, error } = useExperiencePoints();
  const [selectedType, setSelectedType] = React.useState<string | null>(null);
  
  // Handle loading state
  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <span>Experience</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full mb-3"></div>
              <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-800 rounded w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Handle error state
  if (error || !experienceData) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <span>Experience</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 p-4">
            <Zap className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p>Unable to load experience data</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { totalXp, level, progress, trainingTypeLevels } = experienceData;
  
  // Get training types sorted by XP
  const trainingTypes = Object.entries(trainingTypeLevels)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.xp - a.xp);
  
  const topTypes = trainingTypes.slice(0, 3);
  
  // Get selected type data
  const selectedTypeData = selectedType 
    ? trainingTypeLevels[selectedType] 
    : null;
  
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          <span>Experience Level</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          {/* Overall experience */}
          <div className="flex-1">
            <ExperienceDisplay
              level={level}
              xp={totalXp}
              progress={progress}
              className="mb-4"
            />
            
            {/* Top training types */}
            <div className="space-y-3 mt-4">
              <h4 className="text-sm font-medium text-gray-400 flex items-center">
                <Trophy className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                <span>Top Training Types</span>
              </h4>
              
              {topTypes.map((type) => (
                <button
                  key={type.name}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded transition-colors",
                    "hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-700",
                    selectedType === type.name ? "bg-gray-800 border-l-2 border-primary" : ""
                  )}
                  onClick={() => setSelectedType(type.name === selectedType ? null : type.name)}
                >
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-white">{type.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono text-gray-300">{type.xp}</span>
                    <span className="text-xs text-gray-500">XP</span>
                  </div>
                </button>
              ))}
              
              {topTypes.length === 0 && (
                <div className="text-center p-3 border border-dashed border-gray-800 rounded">
                  <p className="text-sm text-gray-500">No training data yet</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Training type detail */}
          {selectedType && selectedTypeData && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 border-l border-gray-800 pl-6"
            >
              <h3 className="font-medium text-lg text-white mb-3">{selectedType}</h3>
              <ExperienceDisplay
                level={selectedTypeData.level}
                xp={selectedTypeData.xp}
                progress={selectedTypeData.progress}
                trainingType={selectedType}
              />
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
