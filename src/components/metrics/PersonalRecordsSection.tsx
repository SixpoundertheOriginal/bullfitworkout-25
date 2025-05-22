
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface PersonalRecord {
  exerciseName: string;
  value: number;
  unit: string;
  date: string;
  improvement?: number;
}

interface PersonalRecordsSectionProps {
  records: PersonalRecord[];
  className?: string;
}

export const PersonalRecordsSection: React.FC<PersonalRecordsSectionProps> = ({ 
  records, 
  className = "" 
}) => {
  // If no records, show empty state
  if (!records || records.length === 0) {
    return (
      <Card className={`bg-gray-900/80 border-gray-800 shadow-md ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            Personal Records
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <Trophy className="h-10 w-10 text-gray-700 mb-2" />
          <p className="text-gray-500">No personal records yet</p>
          <p className="text-xs text-gray-600 mt-1">Complete more workouts to set new records</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gray-900/80 border-gray-800 shadow-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          Personal Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.slice(0, 4).map((record, index) => (
            <motion.div
              key={`${record.exerciseName}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50 hover:border-yellow-600/30 transition-all"
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <h4 className="font-medium text-sm truncate" title={record.exerciseName}>
                    {record.exerciseName}
                  </h4>
                  <p className="text-gray-400 text-xs">{new Date(record.date).toLocaleDateString()}</p>
                </div>
                {record.improvement && (
                  <div className="flex items-center text-green-400 text-xs">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {record.improvement}%
                  </div>
                )}
              </div>
              <div className="flex items-baseline mt-1">
                <span className="text-xl font-bold text-yellow-500">{record.value}</span>
                <span className="ml-1 text-xs text-gray-400">{record.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
