
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ChartSectionProps {
  title: string;
  height?: number;
  children: React.ReactNode;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  title,
  height = 250,
  children
}) => {
  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden" style={{ minHeight: `${height + 50}px` }}>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent style={{ height: `${height}px` }} className="flex items-center justify-center">
        <div className="w-full h-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};
