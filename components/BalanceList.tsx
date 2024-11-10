// File: ./components/BalanceList.tsx

import React, { useRef, useState, useCallback } from 'react';
import { Box, HStack, IconButton, useToken } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TokenBalance from './TokenBalance';
import { BalanceItem } from '@covalenthq/client-sdk';

interface BalanceListProps {
  selectedToken: string;
  handleTokenSelect: (tokenAddress: string) => void;
  contrastingColor: string;
  reverseColor: string; 
  hoverColor: string;
  userAddress: string;
  chainId: string;
  balances: BalanceItem[];
  protocolBalances: BalanceItem[];
  isLoading: boolean;
}

const BalanceList: React.FC<BalanceListProps> = ({
  selectedToken,
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
          {balances.map((balance) => {
            const protocolBalance = protocolBalances.find(
              p => p.contract_address.toLowerCase() === balance.contract_address.toLowerCase()
            );

            return (
              <Box
                key={balance.contract_address}
                onClick={() => handleTokenSelect(balance.contract_address)}
                cursor="pointer"
                transition="all 0.2s"
                borderRadius="md"
                bg={selectedToken === balance.contract_address ? `${baseColor}10` : 'transparent'}
                border="1px solid"
                borderColor={selectedToken === balance.contract_address ? baseColor : 'transparent'}
                _hover={{
                  bg: hoverColor,
                  transform: 'translateY(-1px)',
                }}
                height="100%"
                minW="200px"
                maxW="200px"
                p={3}
              >
                <TokenBalance
                  balanceItem={balance}
                  protocolBalance={protocolBalance}
                  isSelected={selectedToken === balance.contract_address}
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