import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { Box, useToast, Spinner } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { deployments, ABIs } from '../../config/contracts';
import { useRootNodes } from '../../hooks/useRootNodes';
import { useNode } from '../../contexts/NodeContext';
import BalanceList from '../BalanceList';
import RootNodeDetails from '../RootNodeDetails';
import { useCovalentBalances } from '../../hooks/useCovalentBalances';

interface DashboardContentProps {
  colorState: {
    contrastingColor: string;
    reverseColor: string;
    hoverColor: string;
  };
}

const DashboardContent: React.FC<DashboardContentProps> = ({ colorState }) => {
  const router = useRouter();
  const { user, ready, getEthersProvider } = usePrivy();
  const { selectedToken, selectToken } = useNode();
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();
  
  const chainId = user?.wallet?.chainId?.toString() || '';
  const userAddress = user?.wallet?.address || '';
  const cleanChainId = chainId?.includes('eip155:') ? chainId.replace('eip155:', '') : chainId;

  // Fetch balances
  const { 
    balances, 
    protocolBalances, 
    isLoading: balancesLoading 
  } = useCovalentBalances(userAddress, chainId);

  // Fetch root nodes when a token is selected
  const { 
    data: nodes, 
    isLoading: nodesLoading,
    error: nodesError,
    refetch: refetchNodes
  } = useRootNodes(chainId, selectedToken, userAddress);

  const handleTokenSelect = useCallback((tokenAddress: string) => {
    selectToken(tokenAddress);
  }, [selectToken]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    router.push(`/nodes/${chainId}/${nodeId}`);
  }, [router, chainId]);

  const handleSpawnNode = useCallback(async () => {
    if (!user?.wallet?.address) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet first",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!selectedToken) {
      toast({
        title: "Token Required",
        description: "Please select a token first",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsProcessing(true);
      const provider = await getEthersProvider();
      const signer = provider.getSigner();
      
      const willWeAddress = deployments.WillWe[cleanChainId];
      if (!willWeAddress) {
        throw new Error(`No WillWe contract found for chain ${cleanChainId}`);
      }

      const contract = new ethers.Contract(
        willWeAddress,
        ABIs.WillWe,
        signer
      );

      const tx = await contract.spawnRootBranch(selectedToken);
      await tx.wait();
      
      toast({
        title: "Node spawned",
        description: "New root node created successfully",
        status: "success",
        duration: 5000,
      });

      // Refresh nodes after spawning
      await refetchNodes();
    } catch (error) {
      console.error('Failed to spawn node:', error);
      toast({
        title: "Failed to spawn node",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    user?.wallet?.address,
    selectedToken,
    cleanChainId,
    getEthersProvider,
    toast,
    refetchNodes
  ]);

  // Handle initial loading state
  if (!ready || (nodesLoading && !nodes)) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color={colorState.contrastingColor} />
      </Box>
    );
  }

  return (
    <Box flex={1} display="flex" overflow="hidden">
      <Box flex={1} overflow="auto" bg="gray.50" p={6}>
        <RootNodeDetails
          chainId={chainId}
          selectedToken={selectedToken}
          userAddress={userAddress}
          selectedTokenColor={colorState.contrastingColor}
          onNodeSelect={handleNodeSelect}
          onSpawnNode={handleSpawnNode}
          nodes={nodes || []}
          isLoading={nodesLoading}
          error={nodesError}
        />
      </Box>
    </Box>
  );
};

export default DashboardContent;