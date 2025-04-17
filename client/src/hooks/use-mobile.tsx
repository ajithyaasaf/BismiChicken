import * as React from "react"

// Define standard breakpoints for responsive design
export const breakpoints = {
  xs: 320,   // Extra small devices (portrait phones)
  sm: 576,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 992,   // Large devices (desktops)
  xl: 1200,  // Extra large devices (large desktops)
  xxl: 1400, // Extra extra large devices
};

export type Breakpoint = keyof typeof breakpoints;

// Hook to check if viewport is below a specific breakpoint
export function useIsBelowBreakpoint(breakpoint: Breakpoint) {
  const breakpointValue = breakpoints[breakpoint];
  const [isBelow, setIsBelow] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpointValue - 1}px)`);
    
    const onChange = () => {
      setIsBelow(mql.matches);
    };
    
    // Modern browsers use addEventListener
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
    } else {
      // For Safari older versions - deprecated but needed for compatibility
      // @ts-ignore - TS will complain about this but it's needed for older browsers
      mql.addListener(onChange);
    }
    
    // Set initial value
    setIsBelow(mql.matches);
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", onChange);
      } else {
        // @ts-ignore
        mql.removeListener(onChange);
      }
    };
  }, [breakpointValue]);

  return !!isBelow;
}

// Convenience hooks for specific breakpoints
export function useIsMobile() {
  return useIsBelowBreakpoint('md');
}

export function useIsTablet() {
  const isBelowLg = useIsBelowBreakpoint('lg');
  const isAboveSm = !useIsBelowBreakpoint('sm');
  return isBelowLg && isAboveSm;
}

export function useIsDesktop() {
  return !useIsBelowBreakpoint('lg');
}

// Hook to get current active breakpoint
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('md');
  
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < breakpoints.sm) {
        setBreakpoint('xs');
      } else if (width < breakpoints.md) {
        setBreakpoint('sm');
      } else if (width < breakpoints.lg) {
        setBreakpoint('md');
      } else if (width < breakpoints.xl) {
        setBreakpoint('lg');
      } else if (width < breakpoints.xxl) {
        setBreakpoint('xl');
      } else {
        setBreakpoint('xxl');
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return breakpoint;
}
