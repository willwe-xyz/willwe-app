// File: ./components/BalanceList.tsx

import React, { useRef, useState, useCallback } from 'react';
import { Box, HStack, IconButton, useToken } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TokenBalance from './TokenBalance';
import { AlchemyTokenBalance } from '../hooks/useAlchemyBalances';

interface BalanceListProps {
  selectedToken: string;
  rootToken?: string;
  handleTokenSelect: (tokenAddress: string) => void;
  contrastingColor: string;
  reverseColor: string; 
  hoverColor: string;
  userAddress: string;
  chainId: string;
  balances: AlchemyTokenBalance[];
  protocolBalances: AlchemyTokenBalance[];
  isLoading: boolean;
}

const BalanceList: React.FC<BalanceListProps> = ({
  selectedToken,
  rootToken,
  handleTokenSelect,
  contrastingColor,
  reverseColor,
  hoverColor,
  balances = [],
  protocolBalances = [],
  isLoading
}) => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const [baseColor] = useToken('colors', [contrastingColor]);

  // Sort balances by token name
  const sortedBalances = [...balances].sort((a, b) => 
    (a.name || '').localeCompare(b.name || '')
  );

  // Handle scroll visibility
  const checkScrollButtons = useCallback(() => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // Scroll handlers
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const scrollAmount = 300;
      scrollContainer.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  const isTokenActive = useCallback((tokenAddress: string) => {
    return selectedToken === tokenAddress || rootToken === tokenAddress;
  }, [selectedToken, rootToken]);

  if (isLoading) {
    return (
      <Box height="100px" display="flex" alignItems="center" justifyContent="center" bg="white">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </Box>
    );
  }

  return (
    <Box position="relative" bg="white" height="100px">
      {/* Left Scroll Button */}
      {showLeftScroll && (
        <IconButton
          aria-label="Scroll left"
          icon={<ChevronLeft size={20} />}
          position="absolute"
          left={0}
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          bg="white"
          color={contrastingColor}
          onClick={() => scroll('left')}
          _hover={{ bg: hoverColor }}
          h="full"
          borderRadius="none"
        />
      )}

      {/* Token List */}
      <Box
        ref={scrollContainer}
        overflowX="hidden"
        whiteSpace="nowrap"
        py={2}
        px={10}
        onScroll={checkScrollButtons}
        height="100%"
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <HStack spacing={4} height="100%">
          {sortedBalances.map((balance) => {
            const protocolBalance = protocolBalances.find(
              p => p.contractAddress.toLowerCase() === balance.contractAddress.toLowerCase()
            );
            const isActive = isTokenActive(balance.contractAddress);

            return (
              <Box
                key={balance.contractAddress}
                onClick={() => handleTokenSelect(balance.contractAddress)}
                cursor="pointer"
                transition="all 0.2s"
                borderRadius="md"
                bg={isActive ? `${baseColor}15` : 'transparent'}
                border="2px solid"
                borderColor={isActive ? baseColor : 'transparent'}
                _hover={{
                  bg: hoverColor,
                  transform: 'translateY(-2px)',
                  shadow: 'md'
                }}
                position="relative"
                height="100%"
                minW="200px"
                maxW="200px"
                p={3}
                shadow={isActive ? 'md' : 'none'}
                {...(isActive && {
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '40%',
                    height: '2px',
                    bg: baseColor,
                    borderRadius: 'full'
                  }
                })}
              >
                <TokenBalance
                  balanceItem={balance}
                  protocolBalance={protocolBalance}
                  isSelected={isActive}
                  contrastingColor={contrastingColor}
                  reverseColor={reverseColor}
                />
              </Box>
            );
          })}
        </HStack>
      </Box>

      {/* Right Scroll Button */}
      {showRightScroll && (
        <IconButton
          aria-label="Scroll right"
          icon={<ChevronRight size={20} />}
          position="absolute"
          right={0}
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          bg="white"
          color={contrastingColor}
          onClick={() => scroll('right')}
          _hover={{ bg: hoverColor }}
          h="full"
          borderRadius="none"
        />
      )}
    </Box>
  );
};

export default BalanceList;