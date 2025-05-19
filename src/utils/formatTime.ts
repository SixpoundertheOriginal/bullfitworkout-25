
/**
 * Format a duration in seconds to display as minutes and seconds
 * For longer durations, it will display hours, minutes, and seconds
 * 
 * @param seconds Total duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 0) return "00:00";
  
  // For durations over an hour
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // For durations under an hour
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format a duration in seconds to display as a human-readable string
 * 
 * @param seconds Total duration in seconds
 * @returns Human-readable duration string like "1h 30m" or "45m 20s"
 */
export const formatDurationHuman = (seconds: number): string => {
  if (seconds < 0) return "0m";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
