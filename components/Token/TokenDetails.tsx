// File: ./components/Token/TokenDetails.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, VStack, Text, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useTransaction } from '../../contexts/TransactionContext';
import { deployments, ABIs } from '../../config/contracts';

interface TokenDetailsProps {
  tokenAddress: string;
  chainId: string;
}

export const TokenDetails: React.FC<TokenDetailsProps> = ({ tokenAddress, chainId }) => {
  const { getEthersProvider } = usePrivy();

  // Fetch token data using React Query
  const { data: tokenData, isLoading, error } = useQuery({
    queryKey: ['token', tokenAddress, chainId],
    queryFn: async () => {
      if (!tokenAddress || !chainId) return null;

      const provider = await getEthersProvider();
      const contract = new ethers.Contract(
        tokenAddress, 
        ABIs.IERC20, 
        //@ts-ignore
        provider
      );

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals)
      };
    },
    enabled: !!tokenAddress && !!chainId,
    staleTime: 30000 // Cache for 30 seconds
  });

  if (isLoading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to load token details
      </Alert>
    );
  }

  if (!tokenData) {
    return (
      <Alert status="info">
        <AlertIcon />
        No token data available
      </Alert>
    );
  }

  return (
    <Box borderWidth="1px" borderRadius="lg" p={6}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontSize="sm" color="gray.500">Name</Text>
          <Text fontSize="lg" fontWeight="semibold">{tokenData.name}</Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Symbol</Text>
          <Text fontSize="lg" fontWeight="semibold">{tokenData.symbol}</Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Total Supply</Text>
          <Text fontSize="lg" fontWeight="semibold">
            {Number(tokenData.totalSupply).toLocaleString()} {tokenData.symbol}
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Decimals</Text>
          <Text fontSize="lg" fontWeight="semibold">{tokenData.decimals}</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default TokenDetails;