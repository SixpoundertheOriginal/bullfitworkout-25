
import { useState, useEffect } from 'react';
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';

export function useExerciseFilters() {
  const [activeTab, setActiveTab] = useState<string>("suggested");
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | "all">("all");
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");
  const [selectedMovement, setSelectedMovement] = useState<MovementPattern | "all">("all");

  // Reset to page 1 when filters change
  useEffect(() => {
    // Reset pagination could be done here
  }, [searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, selectedMovement]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedMuscleGroup("all");
    setSelectedEquipment("all");
    setSelectedDifficulty("all");
    setSelectedMovement("all");
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    showFilters, 
    setShowFilters,
    filterProps: {
      selectedMuscleGroup,
      selectedEquipment,
      selectedDifficulty,
      selectedMovement,
      onMuscleGroupChange: setSelectedMuscleGroup,
      onEquipmentChange: setSelectedEquipment,
      onDifficultyChange: setSelectedDifficulty,
      onMovementChange: setSelectedMovement,
      onClearFilters: clearFilters,
      filters: {
        selectedMuscleGroup,
        selectedEquipment,
        selectedDifficulty,
        selectedMovement
      }
    }
  };
}
