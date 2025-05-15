
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Search, Filter, X } from "lucide-react";
import { Exercise } from "@/types/exercise";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ExerciseTabContent } from "./ExerciseTabContent";
import { ExerciseFilters } from "./ExerciseFilters";
import { DeleteExerciseDialog } from "./DeleteExerciseDialog";
import { useExerciseFilters } from "../hooks/useExerciseFilters";

interface ExerciseTabsProps {
  standalone: boolean;
  onBack?: () => void;
  onAdd: () => void;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  onAddVariation: (exercise: Exercise) => void;
  onSelectExercise?: (exercise: Exercise) => void;
  deleteConfirmOpen: boolean;
  setDeleteConfirmOpen: (open: boolean) => void;
  exerciseToDelete: Exercise | null;
  confirmDelete: () => void;
}

export function ExerciseTabs({
  standalone,
  onBack,
  onAdd,
  onEdit,
  onDelete,
  onAddVariation,
  onSelectExercise,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  exerciseToDelete,
  confirmDelete
}: ExerciseTabsProps) {
  const { 
    activeTab, 
    setActiveTab,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    filterProps
  } = useExerciseFilters();

  return (
    <>
      <DeleteExerciseDialog 
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        exerciseName={exerciseToDelete?.name}
        onConfirm={confirmDelete}
      />

      {/* Header with back button if needed */}
      <div className="flex items-center justify-between mb-4">
        {onBack && (
          <Button 
            variant="ghost"
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2 -ml-2"
          >
            <ChevronLeft size={18} />
            Back
          </Button>
        )}
        
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-semibold text-center">
            {standalone ? "Exercise Library" : "Browse Exercises"}
          </h1>
        </div>
        
        {standalone && (
          <Button 
            onClick={onAdd}
            size="sm"
            variant="outline"
            className="h-9 px-3 rounded-full bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/50"
          >
            <Plus size={16} className="mr-1" />
            New Exercise
          </Button>
        )}
      </div>
      
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search exercises..."
          className="pl-9 bg-gray-800 border-gray-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-2 top-1.5 h-7 w-7 p-0"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Tabs for navigation */}
      <Tabs className="flex-1 overflow-hidden flex flex-col" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
        </TabsList>
        
        {/* Filters button - only show in browse tab */}
        {activeTab === 'browse' && (
          <ExerciseFilters 
            showFilters={showFilters} 
            setShowFilters={setShowFilters} 
            {...filterProps}
          />
        )}
        
        <ExerciseTabContent
          tab="suggested"
          onEdit={onEdit}
          onDelete={onDelete}
          onAddVariation={onAddVariation}
          onSelectExercise={onSelectExercise}
          standalone={standalone}
          filters={{
            searchQuery,
            ...filterProps.filters
          }}
        />
        
        <ExerciseTabContent
          tab="recent"
          onEdit={onEdit}
          onDelete={onDelete}
          onAddVariation={onAddVariation}
          onSelectExercise={onSelectExercise}
          standalone={standalone}
          filters={{
            searchQuery,
            ...filterProps.filters
          }}
        />
        
        <ExerciseTabContent
          tab="browse"
          onEdit={onEdit}
          onDelete={onDelete}
          onAddVariation={onAddVariation}
          onSelectExercise={onSelectExercise}
          showPagination
          standalone={standalone}
          filters={{
            searchQuery,
            ...filterProps.filters
          }}
        />
      </Tabs>
    </>
  );
}
