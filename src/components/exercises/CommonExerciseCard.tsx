
import React from 'react';
import { Exercise } from '@/types/exercise';
import { BaseExerciseCard } from './cards/BaseExerciseCard';
import { ExerciseCardContent } from './cards/ExerciseCardContent';
import { ExerciseCardActions } from './cards/ExerciseCardActions';

interface CommonExerciseCardProps {
  exercise: Exercise | string;
  variant: 'list' | 'selector' | 'workout-add' | 'library-manage' | 'workout';
  className?: string;
  onSelect?: () => void;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
  onDuplicate?: () => void;
  isSelected?: boolean;
  isVariation?: boolean;
  rightContent?: React.ReactNode;
  variationBadge?: React.ReactNode;
  thumbnail?: React.ReactNode;
  // These workout-specific props are kept for backward compatibility
  // but should eventually be moved to a separate WorkoutExerciseCard component
  sets?: any[];
  isActive?: boolean;
  onAddSet?: () => void;
  onCompleteSet?: (setIndex: number) => void;
  onDeleteExercise?: () => void;
  onRemoveSet?: (setIndex: number) => void;
  onEditSet?: (setIndex: number) => void;
  onSaveSet?: (setIndex: number) => void;
  onWeightChange?: (setIndex: number, value: string) => void;
  onRepsChange?: (setIndex: number, value: string) => void;
  onRestTimeChange?: (setIndex: number, value: string) => void;
  onWeightIncrement?: (setIndex: number, increment: number) => void;
  onRepsIncrement?: (setIndex: number, increment: number) => void;
  onRestTimeIncrement?: (setIndex: number, increment: number) => void;
  onShowRestTimer?: () => void;
  onResetRestTimer?: () => void;
}

export const CommonExerciseCard: React.FC<CommonExerciseCardProps> = ({
  exercise,
  variant,
  className,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onDuplicate,
  isSelected = false,
  isVariation = false,
  rightContent,
  variationBadge,
  thumbnail,
  // Workout-specific props (preserved for backward compatibility)
  sets,
  isActive,
  onAddSet,
  onCompleteSet,
  onDeleteExercise,
  onRemoveSet,
  onEditSet,
  onSaveSet,
  onWeightChange,
  onRepsChange,
  onRestTimeChange,
  onWeightIncrement,
  onRepsIncrement,
  onRestTimeIncrement,
  onShowRestTimer,
  onResetRestTimer
}) => {
  // Determine appropriate handlers based on variant
  const handleClick = () => {
    if (variant === 'selector' && onSelect) {
      onSelect();
    } else if ((variant === 'workout-add' || variant === 'workout') && onAdd) {
      onAdd();
    } else if (onSelect) {
      onSelect();
    }
  };

  // If custom right content is not provided, use the actions component
  const actionContent = rightContent ? rightContent : (
    <ExerciseCardActions 
      variant={variant}
      isSelected={isSelected}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      onViewDetails={onViewDetails}
      onDuplicate={onDuplicate}
    />
  );

  return (
    <BaseExerciseCard
      exercise={exercise}
      className={className}
      isSelected={isSelected}
      isVariation={isVariation}
      onClick={handleClick}
    >
      <ExerciseCardContent 
        exercise={exercise}
        thumbnail={thumbnail}
        variationBadge={variationBadge}
        rightContent={actionContent}
      />
    </BaseExerciseCard>
  );
};

export default CommonExerciseCard;
