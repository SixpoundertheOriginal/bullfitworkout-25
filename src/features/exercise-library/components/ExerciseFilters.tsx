
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty } from "@/types/exercise";
import { COMMON_MUSCLE_GROUPS, COMMON_EQUIPMENT, MOVEMENT_PATTERNS, DIFFICULTY_LEVELS } from "@/types/exercise";

interface FiltersProps {
  selectedMuscleGroup: MuscleGroup | "all";
  selectedEquipment: EquipmentType | "all";
  selectedDifficulty: Difficulty | "all";
  selectedMovement: MovementPattern | "all";
  onMuscleGroupChange: (value: MuscleGroup | "all") => void;
  onEquipmentChange: (value: EquipmentType | "all") => void;
  onDifficultyChange: (value: Difficulty | "all") => void;
  onMovementChange: (value: MovementPattern | "all") => void;
  onClearFilters: () => void;
}

interface ExerciseFiltersProps extends FiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export function ExerciseFilters({
  showFilters,
  setShowFilters,
  selectedMuscleGroup,
  selectedEquipment,
  selectedDifficulty,
  selectedMovement,
  onMuscleGroupChange,
  onEquipmentChange,
  onDifficultyChange,
  onMovementChange,
  onClearFilters
}: ExerciseFiltersProps) {
  // Count active filters
  const activeFilterCount = [
    selectedMuscleGroup !== "all" ? 1 : 0,
    selectedEquipment !== "all" ? 1 : 0,
    selectedDifficulty !== "all" ? 1 : 0,
    selectedMovement !== "all" ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="mb-4">
        <Button 
          variant="outline"
          size="sm" 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center w-full justify-center ${showFilters ? 'bg-purple-900/50 border-purple-500' : ''}`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-purple-600 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>
      
      {showFilters && (
        <Card className="p-4 mb-4 bg-gray-800/50 border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Muscle Group</label>
              <Select 
                value={selectedMuscleGroup} 
                onValueChange={(value) => onMuscleGroupChange(value as MuscleGroup | "all")}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select muscle group" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectGroup>
                    <SelectItem value="all">All Muscle Groups</SelectItem>
                    {COMMON_MUSCLE_GROUPS.map((muscle) => (
                      <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Equipment</label>
              <Select 
                value={selectedEquipment} 
                onValueChange={(value) => onEquipmentChange(value as EquipmentType | "all")}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectGroup>
                    <SelectItem value="all">All Equipment</SelectItem>
                    {COMMON_EQUIPMENT.map((equipment) => (
                      <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Difficulty</label>
              <Select 
                value={selectedDifficulty} 
                onValueChange={(value) => onDifficultyChange(value as Difficulty | "all")}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectGroup>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Movement Pattern</label>
              <Select 
                value={selectedMovement} 
                onValueChange={(value) => onMovementChange(value as MovementPattern | "all")}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select movement" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectGroup>
                    <SelectItem value="all">All Movements</SelectItem>
                    {MOVEMENT_PATTERNS.map((pattern) => (
                      <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onClearFilters}
            className="w-full"
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </>
  );
}
