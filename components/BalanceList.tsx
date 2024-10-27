import React from 'react';
import { VStack, Box, Text, Spinner, useColorModeValue } from "@chakra-ui/react";
import { TokenBalance } from "./TokenBalance";
import { BalanceItem } from '@covalenthq/client-sdk';
import { formatBalance } from '../hooks/useBalances';

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
  balances,
  protocolBalances,
  isLoading
}) => {
  const scrollbarBg = useColorModeValue('gray.100', 'gray.700');
  const scrollbarHoverBg = useColorModeValue('gray.300', 'gray.500');

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="sm" color={contrastingColor} />
      </Box>
    );
  }

  return (
    <VStack 
      align="stretch" 
      spacing={0} 
      width="100%"
      height="100%"
      overflowY="auto"
      overflowX="hidden"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '4px',
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: scrollbarBg,
          borderRadius: '2px',
        },
        '&:hover::-webkit-scrollbar-thumb': {
          background: scrollbarHoverBg,
        },
        'scrollbarWidth': 'thin',
        'scrollbarColor': `${scrollbarBg} transparent`,
      }}
    >
      {balances.length > 0 ? balances.map((balance) => {
        const protocolBalance = protocolBalances.find(
          p => p.contract_address === balance.contract_address
        );
        
        return (
          <Box 
            key={balance.contract_address}
            onClick={() => handleTokenSelect(balance.contract_address)}
            cursor="pointer"
            opacity={selectedToken && selectedToken !== balance.contract_address ? 0.5 : 1}
            transition="opacity 0.2s, background-color 0.2s"
            _hover={{
              opacity: 1,
              backgroundColor: hoverColor,
            }}
            width="100%"
            padding={1}
          >
            <TokenBalance
              balanceItem={balance}
              protocolBalance={protocolBalance?.balance}
              isSelected={selectedToken === balance.contract_address}
              contrastingColor={contrastingColor}
              reverseColor={reverseColor}
              formattedBalance={formatBalance(balance.balance)}
              formattedProtocolBalance={protocolBalance ? formatBalance(protocolBalance.balance) : undefined}
            />
          </Box>
        );
      }) : (
        <Box p={4} textAlign="center">
          <Text color={contrastingColor}>No balances found</Text>
        </Box>
      )}
    </VStack>
  );
};

export default BalanceList;