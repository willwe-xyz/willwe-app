
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { Box, useToast, Spinner } from '@chakra-ui/react';
import { useNode } from '../../contexts/NodeContext';
import RootNodeDetails from '../RootNodeDetails';
import { useRootNodes } from '../../hooks/useRootNodes';

interface DashboardContentProps {
  colorState: {
    contrastingColor: string;
    reverseColor: string;
    hoverColor: string;
  };
}

const DashboardContent: React.FC<DashboardContentProps> = ({ colorState }) => {
  const router = useRouter();
  const { user, ready } = usePrivy();
  const { selectedToken } = useNode();
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();
  
  const chainId = user?.wallet?.chainId?.toString() || '';
  const userAddress = user?.wallet?.address || '';

  // Fetch root nodes when a token is selected
  const { 
    data: nodes, 
    isLoading: nodesLoading,
    error: nodesError,
    refetch: refetchNodes
  } = useRootNodes(chainId, selectedToken, userAddress);

  const handleNodeSelect = useCallback((nodeId: string) => {
    router.push(`/nodes/${chainId}/${nodeId}`);
  }, [router, chainId]);

  // Handle initial loading state
  if (!ready || (nodesLoading && !nodes)) {
    return (
      <Box height="100%" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color={colorState.contrastingColor} />
      </Box>
    );
  }

  return (
    <Box flex={1} p={6}>
      <RootNodeDetails
        chainId={chainId}
        selectedToken={selectedToken}
        userAddress={userAddress}
        selectedTokenColor={colorState.contrastingColor}
        onNodeSelect={handleNodeSelect}
        nodes={nodes || []}
        isLoading={nodesLoading}
        error={nodesError}
      />
    </Box>
  );
};

export default DashboardContent;