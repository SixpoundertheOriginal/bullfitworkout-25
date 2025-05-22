
import React, { useState, useRef } from "react";
import { Camera, Trash2, Award, ChevronUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedProfileHeaderProps {
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  fitnessGoal: string | null;
  experienceData?: {
    level: number;
    currentXp: number;
    nextLevelXp: number;
    totalXp: number;
  };
  onAvatarChange: (url: string | null) => void;
}

export function EnhancedProfileHeader({ 
  fullName, 
  email, 
  avatarUrl, 
  fitnessGoal,
  experienceData = {
    level: 1,
    currentXp: 0,
    nextLevelXp: 100,
    totalXp: 0
  },
  onAvatarChange 
}: EnhancedProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Extract user's initials for the avatar fallback
  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    
    return email?.substring(0, 2).toUpperCase() || 'U';
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const { user } = useAuth();
    if (!user) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
        
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      if (updateError) throw updateError;
      
      // Update local state
      onAvatarChange(publicUrl);
      
      toast({
        title: "Profile updated",
        description: "Your profile picture has been updated",
      });
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveAvatar = async () => {
    const { user } = useAuth();
    if (!user) return;
    
    try {
      setIsUploading(true);
      
      // Clear avatar from user metadata
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });
      
      if (error) throw error;
      
      // Update local state
      onAvatarChange(null);
      
      toast({
        title: "Profile updated",
        description: "Profile picture removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate experience percentage
  const experiencePercentage = Math.min(
    100,
    Math.round((experienceData.currentXp / experienceData.nextLevelXp) * 100)
  );

  return (
    <Card className="relative overflow-hidden border-gray-800">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 to-black pointer-events-none" />
      
      <div className="relative p-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="relative group mb-6 md:mb-0 md:mr-6">
            <Avatar className="h-24 w-24 border-2 border-purple-500 ring-4 ring-black/20">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-purple-800 text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-black rounded-full opacity-60"></div>
              <div className="flex gap-2 z-10">
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                  aria-label="Upload new profile picture"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                
                {avatarUrl && (
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="rounded-full"
                    onClick={handleRemoveAvatar} 
                    disabled={isUploading}
                    aria-label="Remove profile picture"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              className="hidden"
              accept="image/*"
            />
            
            {/* Level badge */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold border-2 border-black">
              {experienceData.level}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold leading-relaxed">
                  {fullName || "User"}
                </h2>
                
                <div className="text-gray-400 mb-2">
                  {email}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                {fitnessGoal && (
                  <Badge variant="outline" className="bg-purple-900/50 border-purple-600 text-white px-3 py-1">
                    Goal: {fitnessGoal.replace('_', ' ')}
                  </Badge>
                )}
                
                <Badge variant="outline" className="bg-blue-900/50 border-blue-600 text-white px-3 py-1 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  Level {experienceData.level}
                </Badge>
              </div>
            </div>
            
            {/* Experience bar */}
            <div 
              className="mt-4 cursor-pointer" 
              onClick={() => setShowExperience(prev => !prev)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">Experience</span>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-1">
                    {experienceData.currentXp} / {experienceData.nextLevelXp} XP
                  </span>
                  <ChevronUp 
                    className={`h-4 w-4 text-gray-400 transition-transform ${showExperience ? 'rotate-180' : ''}`} 
                  />
                </div>
              </div>
              <Progress value={experiencePercentage} className="h-2 bg-gray-700" indicatorClassName="bg-gradient-to-r from-purple-500 to-indigo-500" />
              
              {showExperience && (
                <div className="mt-3 px-2 py-3 bg-gray-800/50 rounded-md border border-gray-700 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Total XP:</span>
                    <span>{experienceData.totalXp} XP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next level:</span>
                    <span>{experienceData.nextLevelXp - experienceData.currentXp} XP needed</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
