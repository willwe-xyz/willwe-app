import React from 'react';
import { VStack, Box, Text, Spinner } from '@chakra-ui/react';
import TokenBalance from './TokenBalance';

const BalanceList = ({
  selectedToken,
  handleTokenSelect,
  contrastingColor,
  reverseColor,
  hoverColor,
  userAddress,
  chainId,
  balances = [],
  protocolBalances = [],
  isLoading
}) => {
  // Loading state
  if (isLoading) {
    return (
      <Box 
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Spinner size="sm" color={contrastingColor} />
      </Box>
    );
  }

  // No balances state
  if (!balances || balances.length === 0) {
    return (
      <Box 
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Text color="gray.500" fontSize="sm">
          No balances found
        </Text>
      </Box>
    );
  }

  return (
    <VStack
      spacing={2}
      align="stretch"
      width="100%"
      height="100%"
      overflow="auto"
      py={2}
      px={3}
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: contrastingColor,
          borderRadius: '4px',
          opacity: 0.5,
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
      }}
    >
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
            _hover={{
              bg: hoverColor,
              transform: 'translateY(-1px)',
            }}
            bg={selectedToken === balance.contract_address ? `${contrastingColor}10` : 'transparent'}
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
    </VStack>
  );
};

export default BalanceList;