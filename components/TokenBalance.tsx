import React, { useMemo } from "react";
import { Box, Text, VStack, Tooltip, HStack } from "@chakra-ui/react";
import { BalanceItem } from "@covalenthq/client-sdk";
import { ArrowUpRight, Wallet, Clock } from 'lucide-react';

interface TokenBalanceProps {
  balanceItem: BalanceItem;
  protocolBalance?: string;
  isSelected: boolean;
  contrastingColor: string;
  reverseColor: string;
  formattedBalance: string;
  formattedProtocolBalance?: string;
}

const formatTokenAmount = (amount: string): { digits: string; decimals: string } => {
  const parts = amount.split('.');
  return {
    digits: parts[0],
    decimals: parts[1] || '0'
  };
};

export const TokenBalance: React.FC<TokenBalanceProps> = ({
  balanceItem,
  protocolBalance,
  isSelected,
  contrastingColor,
  reverseColor,
  formattedBalance,
  formattedProtocolBalance
}) => {
  const formattedAmounts = useMemo(() => ({
    user: formatTokenAmount(formattedBalance),
    protocol: formattedProtocolBalance ? formatTokenAmount(formattedProtocolBalance) : null
  }), [formattedBalance, formattedProtocolBalance]);

  // Calculate token percentages for visual indicators
  const percentages = useMemo(() => {
    if (!protocolBalance) return { user: 100, protocol: 0 };
    
    const total = BigInt(balanceItem.balance) + BigInt(protocolBalance);
    if (total === BigInt(0)) return { user: 0, protocol: 0 };
    
    const userPercentage = Number((BigInt(balanceItem.balance) * BigInt(100)) / total);
    return {
      user: userPercentage,
      protocol: 100 - userPercentage
    };
  }, [balanceItem.balance, protocolBalance]);

  return (
    <Box
      position="relative"
      borderWidth={2}
      borderColor={isSelected ? contrastingColor : 'transparent'}
      color={isSelected ? reverseColor : contrastingColor}
      backgroundColor={isSelected ? contrastingColor : 'transparent'}
      p={2}
      borderRadius="md"
      width="100%"
      height="auto"
      minHeight="90px"
      transition="all 0.2s ease"
      overflow="hidden"
    >
      {/* Token Header */}
      <VStack align="start" spacing={0.5}>
        <HStack justify="space-between" width="100%">
          <Text 
            fontSize="sm" 
            fontWeight="bold" 
            isTruncated 
            maxWidth="70%"
          >
            {balanceItem.contract_ticker_symbol}
          </Text>
          <Text fontSize="xs" opacity={0.8}>
            {percentages.user}%
          </Text>
        </HStack>
        
        <Text 
          fontSize="xs" 
          opacity={0.7} 
          isTruncated 
          width="100%"
        >
          {balanceItem.contract_name}
        </Text>
      </VStack>

      {/* Balance Display */}
      <VStack align="start" spacing={1} mt={2}>
        <Tooltip
          label={`Your wallet balance: ${formattedBalance} ${balanceItem.contract_ticker_symbol}`}
          placement="top"
        >
          <HStack spacing={1}>
            <Wallet size={12} />
            <Text fontSize="sm">
              {formattedAmounts.user.digits}
              <Text as="span" fontSize="xs">
                .{formattedAmounts.user.decimals}
              </Text>
            </Text>
          </HStack>
        </Tooltip>

        {protocolBalance && (
          <Tooltip
            label={`Protocol balance: ${formattedProtocolBalance} ${balanceItem.contract_ticker_symbol}`}
            placement="bottom"
          >
            <HStack spacing={1}>
              <Clock size={12} />
              <Text fontSize="sm">
                {formattedAmounts.protocol?.digits}
                <Text as="span" fontSize="xs">
                  .{formattedAmounts.protocol?.decimals}
                </Text>
              </Text>
            </HStack>
          </Tooltip>
        )}
      </VStack>

      {/* Progress Bar */}
      <Box 
        position="absolute" 
        bottom={0} 
        left={0} 
        width="100%" 
        height="2px" 
        backgroundColor={isSelected ? reverseColor : contrastingColor}
        opacity={0.2}
      >
        <Box
          height="100%"
          width={`${percentages.user}%`}
          backgroundColor={isSelected ? reverseColor : contrastingColor}
          opacity={1}
          transition="width 0.3s ease"
        />
      </Box>

      {/* Activity Indicator */}
      {protocolBalance && percentages.protocol > 0 && (
        <Box
          position="absolute"
          top={2}
          right={2}
          width="6px"
          height="6px"
          borderRadius="full"
          backgroundColor={isSelected ? reverseColor : contrastingColor}
          animation="pulse 2s infinite"
        />
      )}

      {/* Hover State Elements */}
      <Box
        position="absolute"
        top={0}
        right={0}
        p={2}
        opacity={0}
        transition="opacity 0.2s ease"
        _groupHover={{ opacity: 1 }}
      >
        <ArrowUpRight size={16} />
      </Box>

      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.5;
          }
        }
      `}</style>
    </Box>
  );
};

export default React.memo(TokenBalance, (prevProps, nextProps) => {
  return (
    prevProps.balanceItem.balance === nextProps.balanceItem.balance &&
    prevProps.protocolBalance === nextProps.protocolBalance &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.contrastingColor === nextProps.contrastingColor &&
    prevProps.reverseColor === nextProps.reverseColor
  );
});