// File: ./components/TokenBalance.tsx

import React, { useMemo } from 'react';
import { Box, Text, VStack, HStack, Tooltip } from '@chakra-ui/react';
import { Activity, Wallet } from 'lucide-react';
import { BalanceItem } from '@covalenthq/client-sdk';
import { formatBalance } from '../utils/formatters';

interface TokenBalanceProps {
  balanceItem: BalanceItem;
  protocolBalance?: BalanceItem | null;
  isSelected: boolean;
  contrastingColor: string;
  reverseColor: string;
  isCompact?: boolean;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({
  balanceItem,
  protocolBalance,
  isSelected,
  contrastingColor,
  reverseColor,
  isCompact = false
}) => {
  const formattedAmounts = useMemo(() => {
    return {
      user: formatBalance(balanceItem?.balance || '0'),
      protocol: formatBalance(protocolBalance?.balance || '0')
    };
  }, [balanceItem?.balance, protocolBalance?.balance]);

  const percentages = useMemo(() => {
    const userBalance = BigInt(balanceItem?.balance || '0');
    const protocolBal = BigInt(protocolBalance?.balance || '0');
    const total = userBalance + protocolBal;

    if (total === BigInt(0)) return { user: 0, protocol: 0 };

    const userPercentage = Number((userBalance * BigInt(100)) / total);
    return {
      user: userPercentage,
      protocol: 100 - userPercentage
    };
  }, [balanceItem?.balance, protocolBalance?.balance]);

  return (
    <Box position="relative">
      {/* Token Header */}
      <VStack align="start" spacing={isCompact ? 0.5 : 1}>
        <Text 
          fontWeight="medium" 
          fontSize={isCompact ? "xs" : "sm"}
          lineHeight={isCompact ? "1.2" : "normal"}
        >
          {balanceItem.contract_ticker_symbol || 'Unknown Token'}
        </Text>
        <Text 
          fontSize={isCompact ? "2xs" : "xs"} 
          color="gray.500"
          lineHeight={isCompact ? "1" : "normal"}
        >
          {balanceItem.contract_name || 'Unknown Name'}
        </Text>
      </VStack>

      {/* Balance Display */}
      <VStack align="start" spacing={isCompact ? 0.5 : 1} mt={isCompact ? 1 : 2}>
        <Tooltip label="Your wallet balance">
          <HStack spacing={1}>
            <Wallet size={isCompact ? 12 : 14} />
            <Text 
              fontSize={isCompact ? "2xs" : "sm"} 
              fontWeight="medium"
              lineHeight={isCompact ? "1" : "normal"}
            >
              {formattedAmounts.user.split('.')[0]}
              <Text 
                as="span" 
                fontSize={isCompact ? "3xs" : "xs"} 
                color="gray.500"
              >
                .{formattedAmounts.user.split('.')[1]}
              </Text>
            </Text>
          </HStack>
        </Tooltip>
      </VStack>

      {/* Progress Bar */}
      <Box 
        mt={isCompact ? 1 : 2} 
        h={isCompact ? "1px" : "2px"} 
        bg={`${contrastingColor}20`} 
        borderRadius="full" 
        overflow="hidden"
      >
        <Box
          h="100%"
          w={`${percentages.user}%`}
          bg={contrastingColor}
          transition="width 0.3s ease"
        />
      </Box>
    </Box>
  );
};

export default React.memo(TokenBalance);