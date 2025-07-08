// File: ./components/Layout/Header.tsx

import React from 'react';
import { Flex, Input, InputGroup, InputLeftElement, Text } from '@chakra-ui/react';
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
      position="relative"
    >
      <Flex align="center" flexShrink={0}>
        <PaletteButton 
          cycleColors={cycleColors} 
          contrastingColor={contrastingColor} 
          reverseColor={reverseColor}
        />
        <Text 
          color="red.500" 
          fontFamily="'Comic Sans MS', 'Comic Sans', cursive"
          fontWeight="bold"
          fontSize="sm"
          ml={2}
          whiteSpace="nowrap"
        >
          [experimental]
        </Text>
      </Flex>
      
      {/* Search Box - Centered */}
      <Flex position="absolute" left="50%" transform="translateX(-50%)" w="100%" maxW="400px">
        <InputGroup>
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
            placeholder="Search..."
          />
        </InputGroup>
      </Flex>
      
      <Flex flexShrink={0}>
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
    </Flex>
  );
};

export default Header;