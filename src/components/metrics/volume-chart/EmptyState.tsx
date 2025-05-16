
import React from 'react';

interface EmptyStateProps {
  message: string;
  height: number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, height }) => {
  return (
    <div className="flex items-center justify-center h-full text-gray-400" style={{ height }}>
      {message}
    </div>
  );
};
