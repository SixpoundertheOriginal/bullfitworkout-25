
import React from 'react';
import { Loader2, Dumbbell } from "lucide-react";

export const TrainingSessionLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="flex flex-col items-center">
        <div className="mb-4 relative">
          <div className="w-16 h-16 rounded-full bg-purple-900/20 flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        </div>
        <p className="text-gray-400">Loading your workout...</p>
      </div>
    </div>
  );
};
