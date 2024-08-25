import { useState, useCallback } from 'react';
import { getDistinguishableColor, getReverseColor } from "../utils/colors";

interface ColorState {
  contrastingColor: string;
  reverseColor: string;
  hoverColor: string;
}

export const useColorManagement = () => {
  const [colorState, setColorState] = useState<ColorState>({
    contrastingColor: '#000000',
    reverseColor: '#ffffff',
    hoverColor: '#e2e8f0',
  });

  const updateColors = useCallback((baseColor: string) => {
    const newContrastingColor = getDistinguishableColor(`#${baseColor.slice(-6)}`, '#e2e8f0');
    setColorState({
      contrastingColor: newContrastingColor,
      reverseColor: getReverseColor(newContrastingColor),
      hoverColor: getReverseColor(newContrastingColor, 0.2),
    });
  }, []);

  const cycleColors = useCallback(() => {
    const currentHue = parseInt(colorState.contrastingColor.slice(1), 16);
    const newHue = (currentHue + 0.08 * 16777215) % 16777215;
    const noise = Math.floor(Math.random() * 1000);
    const newColor = Math.floor(newHue + noise).toString(16).padStart(6, '0');
    updateColors(newColor);
  }, [colorState.contrastingColor, updateColors]);

  return { colorState, updateColors, cycleColors };
};