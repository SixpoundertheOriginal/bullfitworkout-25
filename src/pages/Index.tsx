import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QuickStatsSection } from "@/components/metrics/QuickStatsSection";
import { ConfigureTrainingDialog } from "@/components/ConfigureTrainingDialog";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { FeaturesSection } from "@/components/features/FeaturesSection";
import { WorkoutLogSection } from "@/components/workouts/WorkoutLogSection";
import { toast } from "@/hooks/use-toast";
import { TrainingStartButton } from "@/components/training/TrainingStartButton";
import { motion } from "framer-motion";
import { typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useWorkoutState } from "@/hooks/useWorkoutState";
import { useExperiencePoints } from "@/hooks/useExperiencePoints";
import { ExperienceDisplay } from "@/components/training/ExperienceDisplay";
import { useWorkoutRecommendations } from "@/hooks/useWorkoutRecommendations";
import { format } from "date-fns";
import { Calendar, Dumbbell, Trophy, Zap } from "lucide-react";
import { formatDurationHuman } from "@/utils/formatTime";

// Import our new components
import { ProgressSnapshot } from "@/components/metrics/ProgressSnapshot";
import { AchievementShowcase } from "@/components/achievements/AchievementShowcase";
import { EnhancedRecommendations } from "@/components/recommendations/EnhancedRecommendations";

// The main Index component
const Index = () => {
  const navigate = useNavigate();
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { stats, loading } = useWorkoutStats();
  const { isActive, lastActiveRoute } = useWorkoutState();
  const { experienceData } = useExperiencePoints();
  const { data: recommendations } = useWorkoutRecommendations();
  
  // Use IntersectionObserver for section visibility
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.5, rootMargin: "-100px" }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);
  
  const [stableFabVisibility, setStableFabVisibility] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStableFabVisibility(!isSectionVisible);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isSectionVisible]);

  // Check for active workout to show continue option
  useEffect(() => {
    if (isActive) {
      toast({
        title: "Workout in progress",
        description: "You have an active workout. Click the banner to return.",
      });
    }
  }, [isActive]);

  const handleStartTraining = ({ trainingType, tags, duration, rankedExercises }) => {
    toast({
      title: "Quest Started!",
      description: 
        <div className="flex flex-col">
          <span>{`${trainingType} adventure for ${duration} minutes`}</span>
          <div className="flex items-center mt-1 text-xs">
            <div className="h-1.5 w-1.5 bg-yellow-400 rounded-full mr-1.5"></div>
            <span className="text-yellow-400">+{Math.round(duration * 2)} XP will be awarded on completion</span>
          </div>
        </div>,
    });
    
    const isFirstWorkoutToday = !stats?.lastWorkoutDate || 
      new Date(stats.lastWorkoutDate).toDateString() !== new Date().toDateString();
      
    if (isFirstWorkoutToday) {
      setShowLevelUp(true);
      
      setTimeout(() => {
        setShowLevelUp(false);
        navigateToTraining({ trainingType, tags, duration, rankedExercises });
      }, 2500);
    } else {
      navigateToTraining({ trainingType, tags, duration, rankedExercises });
    }
  };

  const navigateToTraining = ({ trainingType, tags, duration, rankedExercises }) => {
    navigate('/training-session', { 
      state: { 
        trainingConfig: {
          trainingType, 
          tags, 
          duration,
          rankedExercises
        }
      } 
    });
  };

  const handleContinueWorkout = () => {
    if (isActive && lastActiveRoute) {
      navigate(lastActiveRoute);
    }
  };

  const toggleWorkoutDisplay = () => {
    setShowWorkouts(!showWorkouts);
  };

  // Get recommended training type
  const recommendedWorkoutType = stats?.recommendedType || recommendations?.trainingType || "Strength";
  const recommendedDuration = stats?.recommendedDuration || recommendations?.suggestedDuration || 45;

  // Generate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-900/98 to-gray-900/95">
      <main className="flex-1 overflow-auto px-4 py-6 space-y-6 mt-14 pb-20">
        {/* Personalized Welcome */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl p-6 bg-gradient-to-r from-purple-600/30 to-pink-500/30 border border-purple-500/20 
                   shadow-lg backdrop-blur-sm hover:shadow-purple-500/10 transition-all duration-300"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <p className={cn(typography.text.primary, "text-xl")}>
                {getGreeting()}! Ready for your next challenge? 💪
              </p>
              <p className={cn(typography.text.secondary, "text-sm mt-1")}>
                {recommendations?.bestTimeOfDay === format(new Date(), 'a').toLowerCase() 
                  ? "Perfect timing! This is your optimal workout window." 
                  : `Today's focus: ${recommendations?.trainingType || "Building strength"}`}
              </p>
            </div>
            
            {/* Current Date Display */}
            <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-300" />
              <span className="text-sm">{format(new Date(), "EEEE, MMM d")}</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats with enhanced data */}
        <QuickStatsSection />

        {/* NEW: Progress Snapshot */}
        <ProgressSnapshot />

        {/* Experience Display & Start Button Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Experience Display */}
          {experienceData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-1"
            >
              <ExperienceDisplay 
                level={experienceData.level} 
                xp={experienceData.totalXp}
                progress={experienceData.progress}
                trainingType={recommendedWorkoutType}
              />
            </motion.div>
          )}

          {/* Workout Start Section */}
          <section ref={sectionRef} className="md:col-span-2 text-center flex flex-col justify-center">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className={cn(typography.text.secondary, "mb-6")}
            >
              Embark on a new fitness adventure
            </motion.h2>
            
            <div style={{ height: "12rem" }} className="relative">
              <ExerciseFAB 
                onClick={() => setDialogOpen(true)}
                visible={stableFabVisibility}
                className="!bottom-20"
              />

              <div className={cn(
                "absolute left-1/2 transform -translate-x-1/2 transition-all duration-300",
                isSectionVisible ? "scale-100 opacity-100" : "scale-95 opacity-90"
              )}>
                {isActive ? (
                  <div className="flex flex-col items-center space-y-4">
                    <TrainingStartButton
                      onStartClick={handleContinueWorkout}
                      className=""
                      label="Resume"
                      size={120}
                    />
                    <button 
                      onClick={() => setDialogOpen(true)}
                      className="text-sm text-white/70 hover:text-white/90 underline"
                    >
                      Start a new workout
                    </button>
                  </div>
                ) : (
                  <TrainingStartButton
                    onStartClick={() => setDialogOpen(true)}
                    className=""
                    label="Start"
                    size={120}
                  />
                )}
              </div>
            </div>
          </section>
        </div>

        {/* NEW: Achievement Showcase */}
        <AchievementShowcase />

        {/* NEW: Enhanced Recommendations Section */}
        <EnhancedRecommendations onStartWorkout={() => setDialogOpen(true)} />

        {/* Workout Log */}
        <WorkoutLogSection 
          showWorkouts={showWorkouts}
          onToggle={toggleWorkoutDisplay}
        />

        {/* Features Section - Keep this for navigational purposes */}
        <FeaturesSection onNavigate={navigate} />
      </main>

      <ConfigureTrainingDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onStartTraining={handleStartTraining} 
      />
      
      <AnimatedLevelUp show={showLevelUp} />
    </div>
  );
};

// Keep existing AnimatedLevelUp component (unchanged)
const AnimatedLevelUp = ({ show }: { show: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm ${!show && 'pointer-events-none'}`}
    >
      {show && (
        <motion.div
          className="flex flex-col items-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4"
            animate={{ 
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 20px 0px rgba(168, 85, 247, 0.5)",
                "0 0 30px 5px rgba(168, 85, 247, 0.8)",
                "0 0 20px 0px rgba(168, 85, 247, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: 1 }}
          >
            <span className="text-white font-bold text-4xl">
              +1
            </span>
          </motion.div>
          
          <motion.h2
            className="text-white text-3xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Level Up!
          </motion.h2>
          
          <motion.p
            className="text-white/80 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            First workout of the day
          </motion.p>
          
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm text-white">
              +50 XP Bonus
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Index;
