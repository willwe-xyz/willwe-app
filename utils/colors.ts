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


export function invertColor(hex: string) {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1);
  }
  return `#${(Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()}`;
}

export function adjustBrightness(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `#${(1 << 24 | (R < 255 ? R < 1 ? 0 : R : 255) << 16 | (G < 255 ? G < 1 ? 0 : G : 255) << 8 | (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
}