export const cols = {
    lightC: '#dad6d6',
    lightGreen: '#65aa98',
    darkGreen: '#348b60',
    blackColor: '#273437',
    redColor: '#b04f45',
    salmonColor: '#DAC2BB',
    darkBlue: '#19232F',
    lightBlue: '#5EA9B3',
    lightGrey: '#9DA4B1',
    violet: '#A79FBB'
  };
  function isValidHex(hex: string): boolean {
    return typeof hex === 'string' && /^#?[0-9A-Fa-f]{6}$/.test(hex);
}

function hexToRgb(hex: string): [number, number, number] | null {
    if (!isValidHex(hex)) return null;
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');
    // Parse r, g, b values
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return [r, g, b];
}

function rgbToLuminance(r: number, g: number, b: number): number {
    // Calculate luminance as per the formula
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getComplementaryColor(hex: string): string | null {
    let rgb = hexToRgb(hex);
    if (!rgb) return null;
    let [r, g, b] = rgb;
    // Calculate complementary color
    let compR = 255 - r;
    let compG = 255 - g;
    let compB = 255 - b;
    // Convert back to hex
    return `#${((1 << 24) + (compR << 16) + (compG << 8) + (compB)).toString(16).slice(1).toUpperCase()}`;
}

function colorsAreTooSimilar(hex1: string, hex2: string): boolean {
    let rgb1 = hexToRgb(hex1);
    let rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return false;
    let [r1, g1, b1] = rgb1;
    let [r2, g2, b2] = rgb2;
    let luminance1 = rgbToLuminance(r1, g1, b1);
    let luminance2 = rgbToLuminance(r2, g2, b2);
    // You can adjust the threshold for similarity here
    let threshold = 50;
    return Math.abs(luminance1 - luminance2) < threshold;
}

export function getDistinguishableColor(hex: string, backgroundHex: string): string | null {
    if (!isValidHex(hex) || !isValidHex(backgroundHex)) return null;
    if (colorsAreTooSimilar(hex, backgroundHex)) {
        return getComplementaryColor(hex);
    }
    return hex;
}

function rgbToHex(r: number, g: number, b: number): string {
  // Convert r, g, b values to a hex string
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

export function getReverseColor(hex: string): string | null {
  let rgb = hexToRgb(hex);
  if (!rgb) return null;
  let [r, g, b] = rgb;
  // Calculate complementary color
  let compR = 255 - r;
  let compG = 255 - g;
  let compB = 255 - b;
  // Convert back to hex
  return rgbToHex(compR, compG, compB);
}