
import React, { useState } from 'react';
import { Exercise } from '@/types/exercise';
import { EnhancedExerciseCard } from '@/components/exercises/EnhancedExerciseCard';
import { AnimatePresence, motion } from 'framer-motion';
import { useExercises } from '@/hooks/exercise/useExerciseQueries';
import { useHaptics } from '@/hooks/use-haptics';
import { Badge } from '@/components/ui/badge';
import { isIOS } from '@/utils/iosUtils';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface EnhancedExerciseVariationGroupProps {
  baseExercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onAddVariation?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
}

export const EnhancedExerciseVariationGroup: React.FC<EnhancedExerciseVariationGroupProps> = ({
  baseExercise,
  onSelect,
  onEdit,
  onDelete,
  onAddVariation,
  onViewDetails
}) => {
  const { exercises } = useExercises();
  const [expanded, setExpanded] = useState(false);
  const { triggerHaptic } = useHaptics();
  const isIOSDevice = isIOS();

  // Find variations for this base exercise
  const variations = React.useMemo(() => {
    if (!baseExercise?.id || !exercises) return [];
    
    return exercises.filter(ex => 
      ex?.base_exercise_id === baseExercise.id
    );
  }, [baseExercise, exercises]);

  // Toggle expanded state to show/hide variations
  const toggleExpand = () => {
    triggerHaptic('selection');
    setExpanded(prev => !prev);
  };

  // Get variation badge based on count
  const getVariationBadge = () => {
    if (!variations.length) return null;
    
    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${expanded ? 'bg-purple-900/40 border-purple-500/50' : 'bg-gray-800/50 border-gray-700'}`}
      >
        {variations.length} {variations.length === 1 ? 'variation' : 'variations'}
      </Badge>
    );
  };

  const renderVariationIndicator = () => {
    if (!variations.length) return null;
    
    return (
      <div className={`flex items-center gap-1.5 absolute -left-1 top-1/2 transform -translate-y-1/2 -translate-x-full ${expanded ? 'text-purple-500' : 'text-gray-500'}`}>
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {expanded ? 
            <ChevronDown size={18} /> : 
            <ChevronRight size={18} />
          }
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Base exercise */}
      <div className="relative">
        {renderVariationIndicator()}
        <EnhancedExerciseCard
          exerciseName={baseExercise.name}
          exerciseData={baseExercise}
          onSelect={onSelect ? () => onSelect(baseExercise) : undefined}
          onEdit={onEdit ? () => onEdit(baseExercise) : undefined}
          onDelete={onDelete ? () => onDelete(baseExercise) : undefined}
          onAddVariation={onAddVariation ? () => onAddVariation(baseExercise) : undefined}
          onViewDetails={onViewDetails ? () => onViewDetails(baseExercise) : undefined}
          expanded={expanded}
          toggleExpand={variations.length > 0 ? toggleExpand : undefined}
          className={expanded ? 'border-purple-600/30 shadow-md shadow-purple-900/10' : ''}
          showVariationCount={variations.length > 0}
          variationCount={variations.length}
        />
      </div>
      
      {/* Variations */}
      {variations.length > 0 && (
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ 
                duration: 0.3, 
                ease: isIOSDevice ? [0.23, 1, 0.32, 1] : 'easeOut' 
              }}
              className="pl-6 space-y-2 overflow-hidden border-l-2 border-purple-700/30 ml-4"
            >
              {variations.map((variation, index) => (
                <motion.div
                  key={variation.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.25,
                    delay: index * 0.05,
                    ease: isIOSDevice ? [0.23, 1, 0.32, 1] : 'easeOut'
                  }}
                >
                  <EnhancedExerciseCard
                    exerciseName={variation.name}
                    exerciseData={variation}
                    isVariation
                    onSelect={onSelect ? () => onSelect(variation) : undefined}
                    onEdit={onEdit ? () => onEdit(variation) : undefined}
                    onDelete={onDelete ? () => onDelete(variation) : undefined}
                    onViewDetails={onViewDetails ? () => onViewDetails(variation) : undefined}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default EnhancedExerciseVariationGroup;
