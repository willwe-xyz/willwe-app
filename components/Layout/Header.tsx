// File: ./components/Layout/Header.tsx

import React from 'react';
import { Flex, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
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
  selectedTokenColor: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
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
  cycleColors,
  selectedTokenColor,
  searchTerm,
  onSearchChange
}) => {
  // Only render header components once
  return (
    <Flex 
      justify="space-between" 
      align="center"
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
      
      {/* Search Box */}
      <InputGroup maxW="400px" mx={4}>
        <InputLeftElement pointerEvents="none">
          <span role="img" aria-label="coin">🪙</span>
        </InputLeftElement>
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          bg="white"
          borderRadius="md"
          _focus={{
            borderColor: contrastingColor,
            boxShadow: `0 0 0 1px ${contrastingColor}`
          }}
        />
      </InputGroup>

      <HeaderButtons 
        logout={logout} 
        login={login}
        userAddress={userAddress || ''} 
        chainId={chainId}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
        isTransacting={isTransacting}
        selectedTokenColor={contrastingColor}
      />
    </Flex>
  );
};

export default Header;