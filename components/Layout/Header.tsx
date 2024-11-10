// File: ./components/Layout/Header.tsx

import React from 'react';
import { Flex } from '@chakra-ui/react';
import { PaletteButton } from './PaletteButton';
import HeaderButtons from '../HeaderButtons';

interface HeaderProps {
  userAddress?: string;
  chainId: string;
  logout: () => void;
  login: () => void;
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
  isTransacting?: boolean;
  contrastingColor: string;
  reverseColor: string;
  cycleColors: () => void;
}

const Header: React.FC<HeaderProps> = ({
  userAddress,
  chainId,
  logout,
  login,
  selectedNodeId,
  onNodeSelect,
  isTransacting,
  contrastingColor,
  reverseColor,
  cycleColors
}) => {
  // Only render header components once
  return (
    <Flex 
      justify="space-between" 
      p={4} 
      borderBottom="1px solid" 
      borderColor="gray.200"
      bg="white"
    >
      <PaletteButton 
        cycleColors={cycleColors} 
        contrastingColor={contrastingColor} 
        reverseColor={reverseColor}
      />
      <HeaderButtons 
        logout={logout} 
        login={login}
        userAddress={userAddress || ''} 
        chainId={chainId}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
        isTransacting={isTransacting}
      />
    </Flex>
  );
};

export default Header;