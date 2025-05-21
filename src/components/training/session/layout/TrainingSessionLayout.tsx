
import React from 'react';

export interface TrainingSessionLayoutProps {
  children: React.ReactNode;
}

export const TrainingSessionLayout: React.FC<TrainingSessionLayoutProps> = ({ 
  children 
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-black/95 text-white pt-16 pb-24">
      <main className="flex-1 overflow-auto px-4">
        <div className="container max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
