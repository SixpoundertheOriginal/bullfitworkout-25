
import React from 'react';
import { EnhancedExerciseEditor } from '@/components/exercises/enhanced/EnhancedExerciseEditor';
import { PageHeader } from '@/components/navigation/PageHeader';

export default function EnhancedExercisesPage() {
  return (
    <div className="pt-16 pb-24">
      <PageHeader title="Enhanced Exercises" />
      <div className="container mx-auto px-4 py-6">
        <EnhancedExerciseEditor />
      </div>
    </div>
  );
}
