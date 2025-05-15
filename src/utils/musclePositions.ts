
export interface MusclePosition {
  top: string;
  left: string;
  width: string;
  height: string;
  right?: string;
}

export function getMusclePosition(muscle: string): MusclePosition {
  // Return position coordinates based on muscle
  switch (muscle) {
    // Upper body
    case 'chest': return { top: '25%', left: '50%', width: '30%', height: '10%' };
    case 'shoulders': return { top: '19%', left: '50%', width: '50%', height: '5%' };
    case 'back': return { top: '27%', left: '50%', width: '22%', height: '15%' };
    case 'traps': return { top: '22%', left: '50%', width: '20%', height: '5%' };
    case 'lats': return { top: '30%', left: '50%', width: '30%', height: '10%' };
    case 'biceps': return { top: '30%', left: '25%', width: '10%', height: '10%', right: 'auto' };
    case 'triceps': return { top: '30%', left: 'auto', width: '10%', height: '10%', right: '25%' };
    case 'forearms': return { top: '40%', left: '50%', width: '40%', height: '5%' };
    
    // Core
    case 'abs': return { top: '35%', left: '50%', width: '16%', height: '10%' };
    case 'obliques': return { top: '35%', left: '50%', width: '26%', height: '10%' };
    case 'lower back': return { top: '35%', left: '50%', width: '16%', height: '7%' };
    
    // Lower body
    case 'glutes': return { top: '46%', left: '50%', width: '20%', height: '7%' };
    case 'quads': return { top: '55%', left: '50%', width: '30%', height: '15%' };
    case 'hamstrings': return { top: '55%', left: '50%', width: '25%', height: '15%' };
    case 'calves': return { top: '70%', left: '50%', width: '20%', height: '13%' };
    
    // General
    case 'arms': return { top: '30%', left: '50%', width: '60%', height: '15%' };
    case 'legs': return { top: '60%', left: '50%', width: '40%', height: '30%' };
    case 'core': return { top: '35%', left: '50%', width: '30%', height: '15%' };
    case 'cardio': return { top: '40%', left: '50%', width: '80%', height: '40%' };
    case 'full body': return { top: '40%', left: '50%', width: '90%', height: '60%' };
    
    default: return { top: '0', left: '0', width: '0', height: '0', display: 'none' };
  }
}
