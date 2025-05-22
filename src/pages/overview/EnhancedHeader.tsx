
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { OverviewHeader } from './OverviewHeader';
import { DateRangeFilter } from '@/components/date-filters/DateRangeFilter';
import { ComparisonToggle } from '@/components/ui/period-comparison/ComparisonToggle';
import { useDateRange } from '@/context/DateRangeContext';
import { format } from 'date-fns';
import { Calendar, Dumbbell, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedHeaderProps {
  title: string;
  stats: {
    totalWorkouts: number;
    totalVolume: number;
    avgDuration: number;
  };
}

export const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ 
  title,
  stats
}) => {
  const { dateRange } = useDateRange();
  
  // Format date range for display
  const formattedDateRange = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "Current Period";
    return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`;
  }, [dateRange]);

  return (
    <div className="mb-6">
      <OverviewHeader title={title}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-2">
          <div className="md:order-1">
            <DateRangeFilter />
          </div>
          <div className="md:order-2">
            <ComparisonToggle showDateSelector={true} />
          </div>
        </div>
      </OverviewHeader>

      {/* Period Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="mt-4 bg-gradient-to-r from-gray-900/80 via-gray-800/90 to-gray-900/80 border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-3 md:mb-0">
                <Calendar className="h-5 w-5 text-purple-400 mr-2" />
                <h3 className="text-lg font-medium">{formattedDateRange} Summary</h3>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-end">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-500/10 mr-2">
                    <Dumbbell className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Workouts</p>
                    <p className="text-lg font-semibold">{stats.totalWorkouts}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-500/10 mr-2">
                    <Zap className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Volume</p>
                    <p className="text-lg font-semibold">{Math.round(stats.totalVolume).toLocaleString()} kg</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-500/10 mr-2">
                    <Calendar className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Avg Duration</p>
                    <p className="text-lg font-semibold">{Math.round(stats.avgDuration)} min</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
