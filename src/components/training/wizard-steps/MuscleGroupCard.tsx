
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MuscleGroupCategory {
  name: string;
  muscles: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface MuscleGroupCardProps {
  category: MuscleGroupCategory;
  selectedMuscles: string[];
  onToggleMuscle: (muscle: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const MuscleGroupCard = ({ 
  category, 
  selectedMuscles, 
  onToggleMuscle,
  isExpanded,
  onToggleExpand 
}: MuscleGroupCardProps) => {
  const selectedCount = category.muscles.filter(m => selectedMuscles.includes(m)).length;
  const allSelected = selectedCount === category.muscles.length;
  
  const handleSelectAll = () => {
    if (allSelected) {
      // Remove all muscles from this category
      category.muscles.forEach(muscle => {
        if (selectedMuscles.includes(muscle)) {
          onToggleMuscle(muscle);
        }
      });
    } else {
      // Add all muscles from this category
      category.muscles.forEach(muscle => {
        if (!selectedMuscles.includes(muscle)) {
          onToggleMuscle(muscle);
        }
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border cursor-pointer transform transition-all duration-200",
        "bg-gray-900/50 border-gray-800 hover:bg-gray-800/70 hover:border-gray-700",
        selectedCount > 0 && "bg-purple-900/30 border-purple-500/50 shadow-lg shadow-purple-900/20"
      )}
    >
      <div 
        className="p-4 flex items-center justify-between"
        onClick={onToggleExpand}
      >
        <div className="flex items-center">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mr-4",
            `bg-gradient-to-br ${category.color}`,
          )}>
            <category.icon className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">{category.name}</h3>
              {selectedCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-500/30">
                  {selectedCount}/{category.muscles.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">{category.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAll();
              }}
              className="text-xs px-2 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              {allSelected ? 'Clear' : 'All'}
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-800 p-4"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {category.muscles.map(muscle => {
              const isSelected = selectedMuscles.includes(muscle);
              return (
                <motion.button
                  key={muscle}
                  whileTap={{ scale: 0.96 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMuscle(muscle);
                  }}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    "flex items-center justify-between cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500",
                    isSelected
                      ? "bg-purple-900/50 border-purple-500/50 border text-white"
                      : "bg-gray-800/50 border-gray-700 border text-gray-400 hover:bg-gray-800"
                  )}
                >
                  <span className="truncate">{muscle}</span>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-purple-400 ml-2"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
