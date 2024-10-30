import React, { useMemo } from 'react';
import { Box, Text, VStack, HStack, Tooltip } from '@chakra-ui/react';
import { Activity, Wallet, Clock } from 'lucide-react';
import { BalanceItem } from '@covalenthq/client-sdk';

interface TokenBalanceProps {
  balanceItem: BalanceItem;
  protocolBalance?: BalanceItem | null;
  isSelected: boolean;
  contrastingColor: string;
  reverseColor: string;
}

const formatTokenAmount = (rawAmount: string | number | undefined | null): { digits: string; decimals: string } => {
  if (!rawAmount) return { digits: '0', decimals: '00' };
  
  // Convert to string and handle scientific notation
  const stringAmount = typeof rawAmount === 'number' ? 
    rawAmount.toLocaleString('fullwide', { useGrouping: false }) : 
    String(rawAmount);

  // Format balance to show 18 decimals max
  const value = Number(stringAmount) / 1e18;
  const formatted = value.toFixed(4);
  const [whole, fraction] = formatted.split('.');

  return {
    digits: whole || '0',
    decimals: fraction || '00'
  };
};

export const TokenBalance: React.FC<TokenBalanceProps> = ({
  balanceItem,
  protocolBalance,
  isSelected,
  contrastingColor,
  reverseColor,
}) => {
  const formattedAmounts = useMemo(() => {
    console.log('Formatting amounts:', {
      userBalance: balanceItem?.balance,
      protocolBalance: protocolBalance?.balance
    });

    return {
      user: formatTokenAmount(balanceItem?.balance),
      protocol: formatTokenAmount(protocolBalance?.balance)
    };
  }, [balanceItem?.balance, protocolBalance?.balance]);

  // Calculate percentages safely
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
    <Box
      position="relative"
      p={3}
      borderRadius="md"
      borderWidth={1}
      borderColor={isSelected ? contrastingColor : 'transparent'}
      bg={isSelected ? `${contrastingColor}10` : 'transparent'}
      transition="all 0.2s"
      _hover={{ borderColor: contrastingColor }}
    >
      {/* Token Header */}
      <HStack justify="space-between" mb={2}>
        <VStack align="start" spacing={0}>
          <Text fontWeight="medium" fontSize="sm">
            {balanceItem.contract_ticker_symbol || 'Unknown Token'}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {balanceItem.contract_name || 'Unknown Name'}
          </Text>
        </VStack>
      </HStack>

      {/* Balance Display */}
      <VStack align="start" spacing={2}>
        {/* User Balance */}
        <Tooltip label="Your wallet balance">
          <HStack spacing={2}>
            <Wallet size={14} />
            <Text fontSize="sm" fontWeight="medium">
              {formattedAmounts.user.digits}
              <Text as="span" fontSize="xs" color="gray.500">
                .{formattedAmounts.user.decimals}
              </Text>
            </Text>
          </HStack>
        </Tooltip>

        {/* Protocol Balance */}
        {protocolBalance && (
          <Tooltip label="Protocol balance">
            <HStack spacing={2}>
              <Clock size={14} />
              <Text fontSize="sm" fontWeight="medium">
                {formattedAmounts.protocol.digits}
                <Text as="span" fontSize="xs" color="gray.500">
                  .{formattedAmounts.protocol.decimals}
                </Text>
              </Text>
            </HStack>
          </Tooltip>
        )}
      </VStack>

      {/* Progress Bar */}
      <Box mt={3} h="2px" bg={`${contrastingColor}20`} borderRadius="full" overflow="hidden">
        <Box
          h="100%"
          w={`${percentages.user}%`}
          bg={contrastingColor}
          transition="width 0.3s ease"
        />
      </Box>

      {/* Activity Indicator */}
      {protocolBalance && percentages.protocol > 0 && (
        <Box
          position="absolute"
          top={2}
          right={2}
          w="2"
          h="2"
          borderRadius="full"
          bg={contrastingColor}
          opacity={0.6}
          animation="pulse 2s infinite"
        />
      )}

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
};

export default TokenBalance;