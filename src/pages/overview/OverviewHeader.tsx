
import React from 'react';

export interface OverviewHeaderProps {
  title: string;
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({ title }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
};
