// File: ./components/Layout/Header.tsx

import React, { useState } from 'react';
import { Flex, Box, InputGroup, Input, InputLeftElement } from '@chakra-ui/react';
import { PaletteButton } from './PaletteButton';
import HeaderButtons from '../HeaderButtons';
import { Search } from 'lucide-react';

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
  searchQuery: string;
  onSearchChange: (query: string) => void;
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
      <Box 
        flex="1 1 0"
        maxW="400px"
        mx={8}
        width={isActive ? "240px" : "200px"}
        transition="width 0.3s cubic-bezier(.4,1.3,.6,1)"
        borderBottomWidth={isActive ? "3.3px" : "3px"}
        borderBottomStyle="solid"
        borderBottomColor={isActive ? `${contrastingColor}` : `${contrastingColor}80`}
        borderRadius={0}
        bg="transparent"
        boxShadow="none"
      >
        <InputGroup size="sm" alignItems="center">
          <InputLeftElement pointerEvents="none" height="100%">
            <Box
              bg="transparent"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="24px"
              height="24px"
              mr={2}
            >
              <Search size={18} color={contrastingColor} opacity={1} />
            </Box>
          </InputLeftElement>
          <Input
            placeholder="🪙"
            fontSize="20px"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            bg="transparent"
            border="none"
            color={contrastingColor}
            _placeholder={{ color: `${contrastingColor}A0`, opacity: 1 }}
            borderRadius="none"
            width="99%"
            fontWeight={isActive ? 400 : 450}
            boxShadow="none"
            _focus={{ outline: "none", boxShadow: "none" }}
          />
        </InputGroup>
      </Box>

      {/* Right: Header Buttons */}
      <Box flex="0 0 auto">
        <HeaderButtons 
          logout={logout} 
          login={login}
          userAddress={userAddress || ''} 
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