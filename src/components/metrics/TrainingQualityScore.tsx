
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, TrendingDown } from 'lucide-react';

interface TrainingQualityScoreProps {
  score: number;
  previousScore?: number;
  className?: string;
}

export const TrainingQualityScore: React.FC<TrainingQualityScoreProps> = ({ 
  score, 
  previousScore,
  className = "" 
}) => {
  // Calculate score change
  const scoreChange = previousScore !== undefined ? score - previousScore : undefined;
  const scoreChangePercent = previousScore !== undefined && previousScore !== 0 
    ? Math.round((scoreChange! / previousScore) * 100) 
    : undefined;
  
  // Score color based on value
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    if (value >= 40) return "text-orange-500";
    return "text-red-500";
  };

  // Quality label based on score
  const getQualityLabel = (value: number) => {
    if (value >= 80) return "Excellent";
    if (value >= 60) return "Good";
    if (value >= 40) return "Average";
    if (value >= 20) return "Needs Improvement";
    return "Poor";
  };

  return (
    <Card className={`bg-gray-900/80 border-gray-800 shadow-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Target className="h-5 w-5 text-purple-400 mr-2" />
          Training Quality
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            {/* Circular background */}
            <svg className="absolute w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#333" 
                strokeWidth="8" 
              />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444"} 
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 283} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            
            {/* Score display */}
            <div className="flex flex-col items-center z-10">
              <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
              <span className="text-sm text-gray-400">/100</span>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className={`text-xl font-semibold ${getScoreColor(score)}`}>
              {getQualityLabel(score)}
            </h3>
            
            {scoreChange !== undefined && (
              <div className="flex items-center justify-center mt-2">
                {scoreChange > 0 ? (
                  <div className="flex items-center text-green-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+{scoreChange} pts</span>
                    {scoreChangePercent && <span className="ml-1">({scoreChangePercent}%)</span>}
                  </div>
                ) : scoreChange < 0 ? (
                  <div className="flex items-center text-red-400 text-sm">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span>{scoreChange} pts</span>
                    {scoreChangePercent && <span className="ml-1">({scoreChangePercent}%)</span>}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No change</div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
