import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from "@privy-io/react-auth";
import { Spinner, Box, Alert, AlertIcon } from '@chakra-ui/react';
import NodeViewLayout from '../components/NodeViewLayout';
import { useFetchUserData } from '../hooks/useFetchUserData';
import { useCovalentBalances } from '../hooks/useCovalentBalances';
import { useNodeData } from '../hooks/useNodeData';
import { NodeState } from '../types/chainData';

export default function DashboardPage() {
  const router = useRouter();
  const { user, ready, authenticated } = usePrivy();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { userData, isLoading: isUserDataLoading, error: userDataError } = useFetchUserData(ready, authenticated, user);
  
  const chainId = user?.wallet?.chainId?.toString() || '';
  
  const { balances, isLoading: isBalancesLoading, error: balancesError } = useCovalentBalances(
    authenticated ? user?.wallet?.address || '' : '',
    chainId
  );

  const { nodeData, isLoading: isNodeLoading, error: nodeError } = useNodeData(
    chainId,
    selectedNodeId || ''
  );

  useEffect(() => {
    if (userData?.userContext?.nodes && userData.userContext.nodes.length > 0) {
      setSelectedNodeId(userData.userContext.nodes[0].basicInfo[0]);
    }
  }, [userData]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    router.push(`/nodes/${chainId}/${nodeId}`, undefined, { shallow: true });
  }, [chainId, router]);

  if (!ready || isUserDataLoading) {
    return <Spinner size="xl" />;
  }

  if (userDataError) {
    return (
      <Box p={4}>
        <Alert status="error">
          <AlertIcon />
          {userDataError.message || 'Error loading user data'}
        </Alert>
      </Box>
    );
  }

  return (
    <NodeViewLayout
      chainId={chainId}
      nodeId={selectedNodeId || undefined}
      balances={balances}
      isBalancesLoading={isBalancesLoading}
      balancesError={balancesError}
      nodeData={nodeData as NodeState | null}
      isNodeLoading={isNodeLoading}
      nodeError={nodeError}
      onNodeSelect={handleNodeSelect}
    />
  );
}