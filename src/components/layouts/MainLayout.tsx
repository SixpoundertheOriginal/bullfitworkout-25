
import React, { useLayoutEffect } from "react";
import { BottomNav } from "@/components/navigation/BottomNav";
import { PageHeader } from "@/components/navigation/PageHeader";
import { WorkoutBanner } from "@/components/training/WorkoutBanner";
import { useLocation } from "react-router-dom";
import { useLayout } from "@/context/LayoutContext";
import { DateRangeFilter } from "@/components/date-filters/DateRangeFilter";
import { MainMenu } from "@/components/navigation/MainMenu";
import { cn } from "@/lib/utils";

// Function to get page title based on the current route
const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case "/":
      return "Today";
    case "/overview":
      return "Overview";
    case "/profile":
      return "Profile";
    case "/training-session":
      return "Workout";
    case "/workout-complete":
      return "Workout Complete";
    case "/all-exercises":
      return "All Exercises";
    case "/workouts":
      return "Workouts";
    default:
      if (pathname.startsWith("/workout-details")) {
        return "Workout Details";
      }
      return "404";
  }
};

interface MainLayoutProps {
  children: React.ReactNode;
  noHeader?: boolean;
  noFooter?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  noHeader = false, 
  noFooter = false 
}) => {
  const location = useLocation();
  const { isFilterVisible } = useLayout();
  const title = getPageTitle(location.pathname);
  
  // Prevent layout shifts during route changes
  useLayoutEffect(() => {
    const mainContent = document.querySelector('.content-container');
    if (mainContent) {
      mainContent.classList.add('force-no-transition');
      setTimeout(() => mainContent.classList.remove('force-no-transition'), 100);
    }
    if (location.pathname === '/overview') {
      document.body.style.overflow = 'hidden';
      setTimeout(() => { document.body.style.overflow = '' }, 50);
    }
    return () => { document.body.style.overflow = '' };
  }, [location.pathname]);

  // Hide global bottom nav only on workout complete page
  const hideGlobalNavOn = ['/workout-complete'];
  const shouldShowGlobalNav = !noFooter && !hideGlobalNavOn.some(route => location.pathname.startsWith(route));
  
  // Check if we're on the overview page
  const isOverviewPage = location.pathname === '/overview';

  console.log('MainLayout rendering, isFilterVisible:', isFilterVisible);

  // Calculate content padding based on header and filter visibility
  const headerHeight = 64; // 16 * 4 = 64px (h-16)
  const filterHeight = isFilterVisible ? 56 : 0; // Height for filter section when visible
  const footerHeight = shouldShowGlobalNav ? 64 : 0; // Height for bottom nav when visible

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 will-change-transform relative">
      {!noHeader && (
        <>
          {/* Header is now sticky at the top */}
          <div className="sticky top-0 left-0 right-0 z-50">
            <PageHeader title={title} showBackButton={location.pathname !== '/' && location.pathname !== '/overview'}>
              <MainMenu />
            </PageHeader>
            
            {/* Filter section is also sticky, directly below the header */}
            {isFilterVisible && (
              <div className="bg-gray-800 border-b border-gray-700 shadow-md">
                <div className="container mx-auto py-3 px-4">
                  <DateRangeFilter />
                </div>
              </div>
            )}
            
            <WorkoutBanner />
          </div>
        </>
      )}
      
      {/* Main content with appropriate padding for header and footer */}
      <main className={cn(
        "flex-grow overflow-y-auto will-change-transform",
        "w-full h-full",
        // Add padding based on visibility of elements
        noHeader ? "" : "pt-0", // No extra padding needed since header is sticky
        shouldShowGlobalNav ? `pb-16` : "pb-6", // Padding for footer height
        isOverviewPage ? "pb-24" : "" // Extra padding for overview page
      )}>
        <div className="content-container w-full h-full">
          {children}
        </div>
      </main>
      
      {/* Global bottom nav is now fixed at the bottom */}
      {shouldShowGlobalNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      )}
      
      {/* CSS styles updated for fixed positioning */}
      <style>
        {`
          .content-container {
            min-height: calc(100vh - ${headerHeight + filterHeight + footerHeight}px);
            padding-top: ${isFilterVisible ? '0' : '0'}; /* No extra padding needed with sticky header */
          }
          
          .force-no-transition * {
            transition: none !important;
            animation: none !important;
          }
        `}
      </style>
    </div>
  );
};
