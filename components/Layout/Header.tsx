// File: ./components/Layout/Header.tsx

import React, { useState } from 'react';
import { Flex, Box, InputGroup, Input, InputLeftElement } from '@chakra-ui/react';
import { PaletteButton } from './PaletteButton';
import HeaderButtons from '../HeaderButtons';
import { Search } from 'lucide-react';

interface HeaderProps {
  userAddress?: string;
  chainId: string;
  logout?: () => void;
  login?: () => void;
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
  isTransacting?: boolean;
  contrastingColor: string;
  reverseColor: string;
  cycleColors: () => void;
  selectedTokenColor: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  userAddress,
  chainId,
  selectedNodeId,
  onNodeSelect,
  isTransacting,
  contrastingColor,
  reverseColor,
  cycleColors,
  selectedTokenColor,
  searchQuery,
  onSearchChange
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const isActive = Boolean(searchQuery) || searchFocused;

  return (
    <Flex 
      justify="space-between" 
      align="center"
      p={4} 
      borderBottom="1px solid" 
      borderColor="gray.200"
      bg="white"
    >
      {/* Left: Palette Button */}
      <Box flex="0 0 auto">
        <PaletteButton 
          cycleColors={cycleColors} 
          contrastingColor={contrastingColor} 
          reverseColor={reverseColor}
        />
      </Box>

      {/* Center: Search Bar */}
      <Box flex="1" maxW="600px" mx={4}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Search size={18} color={isActive ? contrastingColor : 'gray.400'} />
          </InputLeftElement>
          <Input
            placeholder="Search tokens, nodes, or addresses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            borderColor={isActive ? contrastingColor : 'gray.200'}
            _hover={{ borderColor: isActive ? contrastingColor : 'gray.300' }}
            _focus={{ borderColor: contrastingColor, boxShadow: `0 0 0 1px ${contrastingColor}` }}
            transition="all 0.2s"
          />
        </InputGroup>
      </Box>

      {/* Right: Header Buttons */}
      <Box flex="0 0 auto">
        <HeaderButtons 
          userAddress={userAddress} 
          chainId={chainId}
          selectedNodeId={selectedNodeId}
          onNodeSelect={onNodeSelect}
          isTransacting={isTransacting}
          selectedTokenColor={selectedTokenColor}
        />
      </Box>
    </Flex>
  );
};

export default Header;