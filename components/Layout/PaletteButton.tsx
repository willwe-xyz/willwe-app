import React, { useState, useEffect } from 'react';
import { useToken } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import logoSrc from '../../public/logos/logo.png';

interface PaletteButtonProps {
  cycleColors: () => void;
  contrastingColor: string;
  reverseColor: string;
  className?: string;
}

export const PaletteButton: React.FC<PaletteButtonProps> = ({
  cycleColors,
  contrastingColor,
  reverseColor,
  ...props
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [baseColor] = useToken('colors', [contrastingColor]);

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
    <Link
      href="/"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        color: reverseColor,
        backgroundColor: baseColor,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={cycleColors}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      <Image 
        src={logoSrc} 
        alt="Logo" 
        width={66} 
        height={66}
        style={{ 
          transform: isHovering ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease-in-out',
          filter: 'brightness(0) saturate(100%)',
        }}
      />
    </Link>
  );
};

export default PaletteButton;