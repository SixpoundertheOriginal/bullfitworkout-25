
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WorkoutStyleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface WorkoutStyleCardProps {
  style: WorkoutStyleOption;
  isSelected: boolean;
  onToggle: () => void;
}

export const WorkoutStyleCard = ({ 
  style, 
  isSelected, 
  onToggle 
}: WorkoutStyleCardProps) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    onClick={onToggle}
    className={cn(
      "p-4 rounded-xl border cursor-pointer transform transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-purple-500",
      isSelected 
        ? "bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-900/20" 
        : "bg-gray-900/50 border-gray-800 hover:bg-gray-800/70 hover:border-gray-700"
    )}
  >
    <div className="flex items-center">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center mr-3",
        `bg-gradient-to-br ${style.color}`,
      )}>
        <style.icon className="w-5 h-5 text-white" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{style.name}</h4>
          {style.difficulty && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              style.difficulty === 'Beginner' && "bg-green-900/40 text-green-300 border border-green-500/30",
              style.difficulty === 'Intermediate' && "bg-yellow-900/40 text-yellow-300 border border-yellow-500/30",
              style.difficulty === 'Advanced' && "bg-red-900/40 text-red-300 border border-red-500/30"
            )}>
              {style.difficulty}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">{style.description}</p>
      </div>
      
      <div className={cn(
        "w-5 h-5 rounded-full border-2 ml-2 flex-shrink-0",
        "transition-all duration-200 ease-in-out",
        "flex items-center justify-center",
        isSelected 
          ? "border-purple-500 bg-purple-500" 
          : "border-gray-600 bg-transparent"
      )}>
        {isSelected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-white rounded-full"
          />
        )}
      </div>
    </div>
  </motion.div>
);
