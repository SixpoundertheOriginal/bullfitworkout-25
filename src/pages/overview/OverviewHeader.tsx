
import React, { ReactNode } from 'react';
import { PageHeader } from "@/components/navigation/PageHeader";

interface OverviewHeaderProps {
  title: string;
  children?: ReactNode;
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({ title, children }) => {
  return (
    <div className="mb-6">
      <PageHeader title={title} />
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
