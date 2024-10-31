import React, { useState, useEffect } from 'react';
import { IconButton, IconButtonProps, useToken } from '@chakra-ui/react';
import { Palette } from 'lucide-react';

interface PaletteButtonProps extends Omit<IconButtonProps, 'aria-label'> {
  cycleColors: () => void;
  contrastingColor: string;
  reverseColor: string;
}

export const PaletteButton: React.FC<PaletteButtonProps> = ({
  cycleColors,
  contrastingColor,
  reverseColor,
  ...props
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [baseColor] = useToken('colors', [contrastingColor]);

  // Set up auto-cycling on hover
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isHovering) {
      intervalId = setInterval(cycleColors, 100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isHovering, cycleColors]);

  return (
    <IconButton
      aria-label="Cycle Colors"
      icon={<Palette size={18} />}
      onClick={cycleColors}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      size="md"
      isRound
      color={reverseColor}
      bg={baseColor}
      _hover={{ 
        bg: reverseColor, 
        color: baseColor,
        transform: 'translateY(-1px)',
      }}
      _active={{
        bg: reverseColor,
        color: baseColor,
        transform: 'translateY(0px)',
      }}
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      boxShadow="sm"
      {...props}
    />
  );
};

export default PaletteButton;