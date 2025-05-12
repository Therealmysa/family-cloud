
import * as React from "react"

// Small mobile breakpoint (phones)
const MOBILE_BREAKPOINT = 640

// Using React.useState with generic type parameter for better typing
export function useIsMobile() {
  // Initialize as undefined to prevent hydration mismatch
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Update on mount and on window resize
    const updateMobileStatus = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Set initial value
    updateMobileStatus()
    
    // Use modern event listener approach
    window.addEventListener("resize", updateMobileStatus)
    
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", updateMobileStatus)
  }, [])

  // Return false if undefined (SSR fallback) or actual value
  return !!isMobile
}
