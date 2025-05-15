
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WizardProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function WizardProgressBar({ currentStep, totalSteps }: WizardProgressBarProps) {
  return (
    <div className="w-full flex gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-1 rounded-full flex-1 transition-colors duration-300",
            index <= currentStep
              ? "bg-gradient-to-r from-purple-500 to-pink-500"
              : "bg-gray-800"
          )}
        >
          {index === currentStep && (
            <motion.div
              layoutId="activeStep"
              className="h-full w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
