
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface EnhancedTabsProps {
  defaultTab: string;
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

export function EnhancedTabs({ 
  defaultTab, 
  activeTab, 
  onTabChange, 
  children 
}: EnhancedTabsProps) {
  return (
    <Tabs 
      defaultValue={defaultTab} 
      value={activeTab} 
      onValueChange={onTabChange} 
      className="w-full"
    >
      <TabsList className="grid grid-cols-3 bg-gray-800 border-gray-700 mb-6 relative overflow-hidden">
        <TabsTrigger 
          value="dashboard" 
          className="data-[state=active]:bg-transparent data-[state=active]:text-white relative z-10"
        >
          Dashboard
          {activeTab === "dashboard" && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-800 rounded-md"
              layoutId="tab-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="stats" 
          className="data-[state=active]:bg-transparent data-[state=active]:text-white relative z-10"
        >
          Stats
          {activeTab === "stats" && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-800 rounded-md"
              layoutId="tab-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="profile" 
          className="data-[state=active]:bg-transparent data-[state=active]:text-white relative z-10"
        >
          Edit Profile
          {activeTab === "profile" && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-800 rounded-md"
              layoutId="tab-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </TabsTrigger>
      </TabsList>
      
      {children}
    </Tabs>
  );
}
