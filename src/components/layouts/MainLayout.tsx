
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
  
  // Enhanced layout effect for smooth transitions
  useLayoutEffect(() => {
    const mainContent = document.querySelector('.content-container');
    if (mainContent) {
      mainContent.classList.add('force-no-transition');
      setTimeout(() => mainContent.classList.remove('force-no-transition'), 100);
    }
    
    // Enhanced scroll behavior for iOS-like experience
    if (location.pathname === '/overview') {
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      setTimeout(() => { 
        document.body.style.overflow = '';
        document.body.style.overscrollBehavior = '';
      }, 50);
    }
    
    // Ensure proper scroll restoration
    window.scrollTo(0, 0);
    
    return () => { 
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    };
  }, [location.pathname]);

  // Hide global bottom nav only on workout complete page
  const hideGlobalNavOn = ['/workout-complete'];
  const shouldShowGlobalNav = !noFooter && !hideGlobalNavOn.some(route => location.pathname.startsWith(route));
  
  // Check if we're on the overview page
  const isOverviewPage = location.pathname === '/overview';

  console.log('MainLayout rendering, isFilterVisible:', isFilterVisible);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 relative">
      {/* Fixed Header Section */}
      {!noHeader && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <PageHeader title={title} showBackButton={location.pathname !== '/' && location.pathname !== '/overview'}>
            <MainMenu />
          </PageHeader>
          
          {/* Filter section positioned directly below header */}
          {isFilterVisible && (
            <div 
              className={cn(
                "bg-gray-800/95 backdrop-blur-xl border-b border-gray-700/60",
                "shadow-lg shadow-black/20"
              )}
              style={{
                // Position it exactly below the header
                top: '64px',
                position: 'fixed',
                left: 0,
                right: 0,
                zIndex: 40
              }}
            >
              <div className="container mx-auto py-3 px-4">
                <DateRangeFilter />
              </div>
            </div>
          )}
          
          <WorkoutBanner />
        </div>
      )}
      
      {/* Main content with proper spacing for fixed elements */}
      <main 
        className={cn(
          "flex-grow w-full",
          // Enhanced scroll behavior with iOS momentum
          "overflow-y-auto overscroll-behavior-contain",
          // GPU acceleration for smooth scrolling
          "will-change-scroll",
          // iOS-style momentum scrolling
          "ios-momentum-scroll"
        )}
        style={{
          // Dynamic top padding based on header and filter visibility
          paddingTop: noHeader ? '0' : `${64 + (isFilterVisible ? 56 : 0)}px`,
          // Dynamic bottom padding for footer
          paddingBottom: shouldShowGlobalNav ? '80px' : '24px',
          // Minimum height to ensure proper scrolling
          minHeight: '100vh'
        }}
      >
        <div className="content-container w-full h-full">
          {children}
        </div>
      </main>
      
      {/* Fixed Footer */}
      {shouldShowGlobalNav && <BottomNav />}
      
      {/* Enhanced CSS for better performance and iOS-like behavior */}
      <style jsx>{`
        .content-container {
          position: relative;
          z-index: 1;
        }
        
        .force-no-transition * {
          transition: none !important;
          animation: none !important;
        }
        
        .ios-momentum-scroll {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        /* Enhanced safe area support */
        @supports (padding-top: env(safe-area-inset-top)) {
          .safe-area-top {
            padding-top: env(safe-area-inset-top);
          }
        }
        
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </div>
  );
};
