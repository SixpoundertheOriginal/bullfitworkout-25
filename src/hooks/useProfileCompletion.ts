
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserProfileData } from '@/pages/ProfilePage';

interface ProfileCompletionItem {
  field: keyof UserProfileData;
  label: string;
  completed: boolean;
}

export const useProfileCompletion = (profileData: UserProfileData | null) => {
  const { user } = useAuth();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [completionItems, setCompletionItems] = useState<ProfileCompletionItem[]>([]);
  
  useEffect(() => {
    if (!user || !profileData) return;
    
    // Define required profile fields
    const requiredFields: { field: keyof UserProfileData; label: string }[] = [
      { field: 'full_name', label: 'Full Name' },
      { field: 'age', label: 'Age' },
      { field: 'weight', label: 'Weight' },
      { field: 'height', label: 'Height' },
      { field: 'fitness_goal', label: 'Fitness Goal' },
      { field: 'experience_level', label: 'Experience Level' }
    ];
    
    // Check which fields are completed
    const items = requiredFields.map(item => ({
      ...item,
      completed: Boolean(profileData[item.field])
    }));
    
    // Calculate completion percentage
    const completedCount = items.filter(item => item.completed).length;
    const percentage = Math.round((completedCount / items.length) * 100);
    
    setCompletionItems(items);
    setCompletionPercentage(percentage);
  }, [user, profileData]);
  
  return { completionPercentage, completionItems };
};
