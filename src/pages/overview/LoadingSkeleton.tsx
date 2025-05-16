
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4 space-y-6 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Workout Overview</h1>
      </div>
      <Card className="bg-card overflow-hidden">
        <CardHeader><CardTitle>Loading Overview...</CardTitle></CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent><Skeleton className="w-full h-[100px] mt-4" /></CardContent></Card>
        <Card><CardContent><Skeleton className="w-full h-[100px] mt-4" /></CardContent></Card>
        <Card><CardContent><Skeleton className="w-full h-[100px] mt-4" /></CardContent></Card>
      </div>
    </div>
  );
};
