
/**
 * Enhanced Typography System
 * 
 * A comprehensive typography system aligned with iOS design principles.
 * Supports dynamic type through responsive scaling and maintains
 * a clear visual hierarchy for improved readability.
 */

// Define the core typography tokens
export const typography = {
  // Main text styles with dynamic type support
  text: {
    primary: "text-white font-normal text-base leading-relaxed",
    secondary: "text-white/80 font-normal text-base leading-relaxed",
    muted: "text-white/60 text-sm leading-relaxed",
    small: "text-white/70 text-xs leading-normal",
    numeric: "text-sky-200 font-mono font-medium tabular-nums",
    positive: "text-emerald-300 font-bold font-mono",
    negative: "text-red-400 font-bold font-mono",
  },

  // Heading hierarchy with improved vertical rhythm
  headings: {
    h1: "text-white font-bold text-3xl sm:text-4xl leading-tight tracking-tight",
    h2: "text-white font-bold text-2xl sm:text-3xl leading-snug tracking-tight",
    h3: "text-white font-semibold text-xl sm:text-2xl leading-snug",
    h4: "text-white font-semibold text-lg leading-normal",
    h5: "text-white font-medium text-base leading-normal",
    h6: "text-white/90 font-medium text-sm leading-normal",
    
    // Semantic heading styles
    primary: "text-white font-bold text-2xl leading-tight tracking-tight",
    section: "text-white font-semibold text-lg leading-normal",
    collapsible: "text-white font-medium text-base leading-normal"
  },

  // Interactive elements with improved tap targets
  interactive: {
    button: "text-white hover:text-white/90 font-medium leading-none",
    link: "text-purple-400 hover:text-purple-300 font-medium underline-offset-2",
    tab: "text-gray-300 hover:text-white data-[state=active]:text-white font-medium",
    label: "text-white/80 text-sm font-medium leading-none",
  },

  // Sections & labels with improved spacing
  sections: {
    title: "text-white font-bold text-xl leading-tight",
    subtitle: "text-white/80 text-lg leading-snug",
    label: "text-white/70 text-xs font-medium tracking-wide uppercase",
  },

  // Specialized text types
  special: {
    gradient: "bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent",
    accent: "text-purple-400",
    error: "text-red-400",
    success: "text-emerald-400",
    warning: "text-amber-400",
    info: "text-sky-400",
    
    // New iOS-style text treatments
    caption: "text-xs text-white/60 font-medium",
    footnote: "text-[11px] text-white/50 leading-tight",
    largeTitle: "text-4xl sm:text-5xl font-bold leading-none tracking-tight",
    title1: "text-3xl font-bold leading-tight tracking-tight",
    title2: "text-2xl font-bold leading-tight",
    title3: "text-xl font-semibold leading-snug",
    headline: "text-base font-semibold leading-normal",
    subheadline: "text-sm font-medium leading-snug",
    callout: "text-sm text-white/90 font-medium leading-snug",
  },
  
  // iOS-specific variant modifiers
  variants: {
    emphasized: "font-semibold",
    monospaced: "font-mono",
    rounded: "font-rounded", // Requires font configuration
    condensed: "tracking-tight",
    expanded: "tracking-wide",
  }
};

/**
 * Helper function to combine typography classes
 * @param classes Array of typography classes to combine
 * @returns Combined class string
 */
export const combineTypography = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Get full typography class based on token path
 * @param path Path to typography token (e.g., "headings.h1")
 * @returns Typography class string or empty string if not found
 */
export const getTypographyClass = (path: string): string => {
  const parts = path.split('.');
  let result: any = typography;
  
  for (const part of parts) {
    if (result[part] === undefined) {
      console.warn(`Typography path "${path}" not found`);
      return '';
    }
    result = result[part];
  }
  
  return typeof result === 'string' ? result : '';
};

/**
 * Applies dynamic type scaling for improved accessibility
 * @param baseClass The base typography class
 * @param scale The scale factor (default: user's system setting)
 * @returns The scaled typography class
 */
export const dynamicType = (baseClass: string, scale?: number): string => {
  // In a real implementation, this would adapt to the user's
  // system accessibility settings for font size
  return baseClass;
};

/**
 * Create a responsive typography class that adapts to screen size
 * @param options Typography options for different breakpoints
 * @returns Responsive typography class string
 */
export const responsiveType = ({
  base,
  sm,
  md,
  lg,
  xl
}: {
  base: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}): string => {
  return [
    base,
    sm ? `sm:${sm}` : '',
    md ? `md:${md}` : '',
    lg ? `lg:${lg}` : '',
    xl ? `xl:${xl}` : '',
  ].filter(Boolean).join(' ');
};

// Export iOS-style text variants
export const iosText = {
  largeTitle: typography.special.largeTitle,
  title1: typography.special.title1,
  title2: typography.special.title2,
  title3: typography.special.title3,
  headline: typography.special.headline,
  subheadline: typography.special.subheadline,
  body: typography.text.primary,
  callout: typography.special.callout,
  caption: typography.special.caption,
  footnote: typography.special.footnote,
};
