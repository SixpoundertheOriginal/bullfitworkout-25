
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MinimalExerciseSet } from '@/utils/setRecommendations';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CheckCircle, Dumbbell, ThumbsUp } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import { useIsMobile } from '@/hooks/use-mobile';

const RPE_RATINGS = [
  { value: 1, label: "Very Easy", description: "Could do many more reps" },
  { value: 2, label: "Easy", description: "Could do several more reps" },
  { value: 3, label: "Moderate", description: "Could do more reps" },
  { value: 4, label: "Somewhat Hard", description: "Could do a few more reps" },
  { value: 5, label: "Hard", description: "Could do 1-2 more reps" },
  { value: 6, label: "Harder", description: "Could maybe do 1 more rep" },
  { value: 7, label: "Very Hard", description: "Could not do more reps" },
  { value: 8, label: "Extremely Hard", description: "Form was compromised" },
  { value: 9, label: "Near Max", description: "Could barely complete the set" },
  { value: 10, label: "Maximum", description: "Could not complete the set" }
];

export interface PostSetRatingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitRating: (rating: number) => void;
  exerciseName: string;
  setDetails?: MinimalExerciseSet;
}

export const PostSetRatingSheet: React.FC<PostSetRatingSheetProps> = ({
  open,
  onOpenChange,
  onSubmitRating,
  exerciseName,
  setDetails
}) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const { play: playSuccess } = useSound('/sounds/success.mp3');
  const { play: playClick } = useSound('/sounds/tick.mp3');
  const isMobile = useIsMobile();

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    playClick();
  };

  const handleSubmit = () => {
    if (selectedRating !== null) {
      onSubmitRating(selectedRating);
      playSuccess();
      setSelectedRating(null);
    }
  };

  // Get the descriptive text for the selected rating
  const getSelectedRatingText = () => {
    if (selectedRating === null) return "";
    const rating = RPE_RATINGS.find(r => r.value === selectedRating);
    return rating ? `${rating.label}: ${rating.description}` : "";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn(
        "bg-gray-900 border-l border-gray-800 overflow-y-auto",
        isMobile ? "w-full px-2" : "sm:max-w-md"
      )}>
        <SheetHeader className="pb-4 border-b border-gray-800">
          <SheetTitle className="text-xl flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            <span>Set Completed!</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="py-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Dumbbell className="h-5 w-5 mr-2 text-purple-400" />
              {exerciseName}
            </h3>
            {setDetails && (
              <p className="text-gray-400 text-sm">
                Set {setDetails.set_number || "-"}: {setDetails.weight}kg × {setDetails.reps} reps
              </p>
            )}
          </div>
          
          <div className="mb-8">
            <h4 className="font-medium mb-3">How difficult was this set?</h4>
            <div className={cn(
              "grid gap-2",
              isMobile ? "grid-cols-5" : "grid-cols-5"
            )}>
              {RPE_RATINGS.map(rating => (
                <button
                  key={rating.value}
                  onClick={() => handleRatingSelect(rating.value)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-lg transition-all",
                    "hover:bg-gray-800 hover:shadow-md",
                    "min-h-[60px]", // Ensure minimum touch target height
                    selectedRating === rating.value 
                      ? "bg-purple-600/20 border border-purple-500/40 shadow-lg shadow-purple-500/10" 
                      : "border border-gray-800"
                  )}
                >
                  <span className={cn(
                    "text-lg font-bold mb-1",
                    selectedRating === rating.value ? "text-purple-300" : "text-gray-300"
                  )}>
                    {rating.value}
                  </span>
                  <span className="text-xs text-gray-400 text-center">{rating.label}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-4 min-h-[48px]">
              {selectedRating !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-center p-2 rounded-md bg-gray-800/50 text-gray-300"
                >
                  {getSelectedRatingText()}
                </motion.div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selectedRating === null}
            className={cn(
              "w-full transition-all duration-300",
              "h-12", // Larger touch target
              selectedRating !== null 
                ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 shadow-lg" 
                : "bg-gray-800 text-gray-400"
            )}
            size="lg"
          >
            <ThumbsUp className="mr-2 h-5 w-5" />
            Start Rest Timer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PostSetRatingSheet;
