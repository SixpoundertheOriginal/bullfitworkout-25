
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RotateCcw, Play } from 'lucide-react';

interface SessionRecoveryPromptProps {
  onResumeSetup: () => void;
  onStartFresh: () => void;
  timeAgo?: string;
  trainingType?: string;
}

export function SessionRecoveryPrompt({ 
  onResumeSetup, 
  onStartFresh, 
  timeAgo,
  trainingType 
}: SessionRecoveryPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4"
    >
      <Alert className="border-purple-500/30 bg-purple-900/20">
        <Play className="h-4 w-4" />
        <AlertDescription>
          Found previous workout setup{timeAgo ? ` from ${timeAgo}` : ''}.
          {trainingType && ` Training type: ${trainingType}`}
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onResumeSetup}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        >
          <Play className="mr-2 h-4 w-4" />
          Continue Setup
        </Button>
        
        <Button
          onClick={onStartFresh}
          variant="outline"
          className="flex-1 border-gray-600"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </div>
    </motion.div>
  );
}
