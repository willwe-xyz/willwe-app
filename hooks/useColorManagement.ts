import { useState, useCallback } from 'react';

interface ColorState {
  contrastingColor: string;
  reverseColor: string;
  hoverColor: string;
}

export const useColorManagement = () => {
  // Color utility functions
  const hexToRgb = useCallback((hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0, 0, 0];
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ];
  }, []);

  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    return '#' + [r, g, b]
      .map(x => Math.round(x).toString(16).padStart(2, '0'))
      .join('');
  }, []);

  const getContrastColor = useCallback((hex: string): string => {
    const [r, g, b] = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }, [hexToRgb]);

  const getReverseColor = useCallback((hex: string, alpha: number = 1): string => {
    const [r, g, b] = hexToRgb(hex);
    const reverse = [255 - r, 255 - g, 255 - b];
    if (alpha === 1) {
      return rgbToHex(reverse[0], reverse[1], reverse[2]);
    }
    return `rgba(${reverse[0]}, ${reverse[1]}, ${reverse[2]}, ${alpha})`;
  }, [hexToRgb, rgbToHex]);

  const getRandomColor = useCallback((): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }, []);

  const [colorState, setColorState] = useState<ColorState>({
    contrastingColor: '#7C3AED', // Default purple
    reverseColor: '#FFFFFF',
    hoverColor: 'rgba(124, 58, 237, 0.1)'
  });

  const cycleColors = useCallback(() => {
    const newColor = getRandomColor();
    setColorState({
      contrastingColor: newColor,
      reverseColor: getContrastColor(newColor),
      hoverColor: `${newColor}20`
    });
  }, [getRandomColor, getContrastColor]);

  return { colorState, cycleColors };
};

export default useColorManagement;