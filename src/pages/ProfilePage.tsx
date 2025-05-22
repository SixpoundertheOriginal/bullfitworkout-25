
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserProfileForm } from "@/components/UserProfileForm";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TabsContent } from "@/components/ui/tabs";
import { useLocation } from "react-router-dom";

// Import new components
import { EnhancedProfileHeader } from "@/components/profile/EnhancedProfileHeader";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { EnhancedTabs } from "@/components/profile/EnhancedTabs";
import { StatsSection } from "@/components/profile/StatsSection";
import { RecentWorkoutsSection } from "@/components/profile/RecentWorkoutsSection";
import { SettingsSection } from "@/components/profile/SettingsSection";
import { AchievementBadges } from "@/components/profile/AchievementBadges";

// Import new hooks
import { useUserExperience } from "@/hooks/useUserExperience";
import { useUserAchievements } from "@/hooks/useUserAchievements";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

export type UserProfileData = {
  full_name: string | null;
  age: number | null;
  weight: number | null;
  weight_unit: string;
  height: number | null;
  height_unit: string;
  fitness_goal: string | null;
  experience_level: string | null;
};

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    totalWorkouts: 0,
    totalSets: 0,
    averageDuration: 0,
    totalDuration: 0
  });
  
  // Get tab from URL query param or default to "dashboard"
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Use our new hooks
  const { experienceData, loading: expLoading } = useUserExperience();
  const { achievements, loading: achievementsLoading } = useUserAchievements();
  const { completionPercentage } = useProfileCompletion(profileData);

  // Update URL when tab changes without full navigation
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(location.search);
    params.set("tab", value);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [location.search, navigate, location.pathname]);

  // Handle avatar update
  const handleAvatarChange = (url: string | null) => {
    if (!user) return;
    // Update avatar URL in local state
    // Note: The actual update to Supabase is handled in the ProfileHeader component
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Fetch user profile data
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile", error);
          toast({
            title: "Error",
            description: "Could not load profile data",
            variant: "destructive"
          });
          return;
        }

        if (data) {
          setProfileData(data);
        } else {
          setProfileData({
            full_name: user.user_metadata?.full_name || null,
            age: null,
            weight: null,
            weight_unit: "kg",
            height: null,
            height_unit: "cm",
            fitness_goal: null,
            experience_level: null
          });
        }
        
        // Fetch recent workouts
        const { data: workouts, error: workoutsError } = await supabase
          .from("workout_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (workoutsError) {
          console.error("Error fetching workouts", workoutsError);
        } else {
          setRecentWorkouts(workouts || []);
        }
        
        // Calculate stats
        if (workouts && workouts.length > 0) {
          // Fetch total sets
          const { data: totalSetsData } = await supabase
            .from("exercise_sets")
            .select("id")
            .in("workout_id", workouts.map(w => w.id));
          
          const totalWorkouts = workouts.length;
          const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
          const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
          
          setStatsData({
            totalWorkouts,
            totalSets: totalSetsData?.length || 0,
            averageDuration,
            totalDuration
          });
        }
      } catch (err) {
        console.error("Error in fetchUserProfile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, navigate]);

  const handleSaveProfile = async (data: UserProfileData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert({ 
          id: user.id, 
          ...data,
          updated_at: new Date().toISOString() 
        });

      if (error) {
        throw error;
      }

      setProfileData(data);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <main className="max-w-4xl mx-auto p-6 mt-16 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            <EnhancedProfileHeader 
              fullName={profileData?.full_name || user?.user_metadata?.full_name}
              email={user?.email}
              avatarUrl={user?.user_metadata?.avatar_url}
              fitnessGoal={profileData?.fitness_goal}
              experienceData={experienceData}
              onAvatarChange={handleAvatarChange}
            />
            
            <EnhancedTabs 
              defaultTab="dashboard" 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
            >
              <TabsContent value="dashboard" className="mt-0 space-y-6">
                <ProfileDashboard 
                  stats={{
                    ...statsData,
                    profileCompletion: completionPercentage
                  }}
                />
                
                <AchievementBadges achievements={achievements} />
                
                <RecentWorkoutsSection workouts={recentWorkouts} />
              </TabsContent>
              
              <TabsContent value="stats" className="mt-0 space-y-6">
                <StatsSection 
                  totalWorkouts={statsData.totalWorkouts}
                  totalSets={statsData.totalSets}
                  averageDuration={statsData.averageDuration}
                  totalDuration={statsData.totalDuration}
                />
                
                <RecentWorkoutsSection workouts={recentWorkouts} />
                
                <SettingsSection />
              </TabsContent>
              
              <TabsContent value="profile" className="mt-0">
                <div className="max-w-lg mx-auto">
                  {profileData && (
                    <UserProfileForm 
                      initialData={profileData} 
                      onSubmit={handleSaveProfile}
                    />
                  )}
                </div>
              </TabsContent>
            </EnhancedTabs>
          </>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
