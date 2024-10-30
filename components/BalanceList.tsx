import React from 'react';
import { VStack, Box, Text, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import TokenBalance from './TokenBalance';

interface BalanceListProps {
  selectedToken: string;
  handleTokenSelect: (tokenAddress: string) => void;
  contrastingColor: string;
  reverseColor: string;
  hoverColor: string;
  userAddress: string;
  chainId: string;
  balances: any[];
  protocolBalances: any[];
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
  const router = useRouter();

  const onTokenSelect = (tokenAddress: string) => {
    // First update the URL
    router.push({
      pathname: '/dashboard',
      query: { token: tokenAddress }
    }, undefined, { shallow: true });
  
    // Then call the handler
    handleTokenSelect(tokenAddress);
  };
  if (isLoading) {
    return (
      <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Spinner size="sm" color={contrastingColor} />
      </Box>
    );
  }

  if (!balances.length) {
    return (
      <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Text color="gray.500" fontSize="sm">No balances found</Text>
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
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': {
          background: contrastingColor,
          borderRadius: '4px',
          opacity: 0.5,
        },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
      }}
    >
      {balances.map((balance) => {
        const protocolBalance = protocolBalances.find(
          p => p.contract_address.toLowerCase() === balance.contract_address.toLowerCase()
        );

        return (
          <Box
            key={balance.contract_address}
            onClick={() => onTokenSelect(balance.contract_address)}
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