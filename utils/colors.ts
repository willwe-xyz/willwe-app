// Function to calculate luminance of a color
function getLuminance(color: string): number {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  
  // Function to get a distinguishable color
  export function getDistinguishableColor(baseColor: string, backgroundColor: string): string {
    const baseLuminance = getLuminance(baseColor);
    const bgLuminance = getLuminance(backgroundColor);
    
    let rgb = parseInt(baseColor.slice(1), 16);
    let r = (rgb >> 16) & 0xff;
    let g = (rgb >> 8) & 0xff;
    let b = (rgb >> 0) & 0xff;
  
    // Adjust color until it's distinguishable
    while (Math.abs(getLuminance(baseColor) - bgLuminance) < 128) {
      r = Math.min(255, Math.max(0, r + (r < 128 ? 10 : -10)));
      g = Math.min(255, Math.max(0, g + (g < 128 ? 10 : -10)));
      b = Math.min(255, Math.max(0, b + (b < 128 ? 10 : -10)));
      baseColor = `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    }
  
    return baseColor;
  }
  
  // Function to get the reverse color
  export function getReverseColor(color: string, alpha: number = 1): string {
    const rgb = parseInt(color.slice(1), 16);
    const r = 255 - ((rgb >> 16) & 0xff);
    const g = 255 - ((rgb >> 8) & 0xff);
    const b = 255 - ((rgb >> 0) & 0xff);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // Color definitions
  export const cols = {
    lightBlue: "#3B82F6",
    darkBlue: "#1E40AF",
    lightGreen: "#10B981",
    darkGreen: "#065F46",
    lightRed: "#EF4444",
    darkRed: "#B91C1C",
    lightYellow: "#F59E0B",
    darkYellow: "#B45309",
    lightPurple: "#8B5CF6",
    darkPurple: "#5B21B6",
    lightGray: "#9CA3AF",
    darkGray: "#4B5563",
    white: "#FFFFFF",
    black: "#000000",
  };