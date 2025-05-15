
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )

  React.useEffect(() => {
    // Function to handle resize and update state
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add event listener with passive option for performance
    window.addEventListener("resize", handleResize, { passive: true })
    
    // Set initial value
    handleResize()
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile
}
