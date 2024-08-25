import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Spinner, Box, Alert, AlertIcon } from '@chakra-ui/react';
import { useNodeData } from '../../../hooks/useNodeData';
import { useCovalentBalances } from '../../../hooks/useCovalentBalances';
import NodeViewLayout from '../../../components/NodeViewLayout';
import { usePrivy } from '@privy-io/react-auth';

const NodePage: React.FC = () => {
  const router = useRouter();
  const { user, ready, authenticated } = usePrivy();
  const { chainId, nodeid } = router.query;

  const { nodeData, isLoading: isNodeLoading, error: nodeError, refetch: refetchNodeData } = useNodeData(
    chainId as string,
    nodeid as string
  );

  const { balances, isLoading: isBalancesLoading, error: balancesError, refetch: refetchBalances } = useCovalentBalances(
    authenticated ? user?.wallet?.address || '' : '',
    chainId as string
  );

  useEffect(() => {
    if (chainId && nodeid) {
      refetchNodeData();
      if (authenticated && refetchBalances) {
        refetchBalances();
      }
    }
  }, [chainId, nodeid, authenticated, refetchNodeData, refetchBalances]);

  const handleNodeSelect = useCallback((selectedNodeId: string) => {
    if (chainId) {
      router.push(`/nodes/${chainId}/${selectedNodeId}`);
    }
  }, [chainId, router]);

  if (!router.isReady || !chainId || !nodeid) {
    return <Spinner size="xl" />;
  }

  if (typeof chainId !== 'string' || typeof nodeid !== 'string') {
    return (
      <Box p={4}>
        <Alert status="error">
          <AlertIcon />
          Invalid chainID or nodeId in URL
        </Alert>
      </Box>
    );
  }

  return (
    <NodeViewLayout
      chainId={chainId}
      nodeId={nodeid}
      balances={balances}
      isBalancesLoading={isBalancesLoading}
      balancesError={balancesError}
      nodeData={nodeData}
      isNodeLoading={isNodeLoading}
      nodeError={nodeError}
      onNodeSelect={handleNodeSelect}
    />
  );
};

export default NodePage;