// pages/nodes/[chainId]/[nodeId].tsx
import React from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import NodeViewLayout from '../../../components/Layout/NodeViewLayout';
import { useColorManagement } from '../../../hooks/useColorManagement';

const NodePage = () => {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { colorState, cycleColors } = useColorManagement();
  
  // Get chainId and nodeId from router
  const { chainId, nodeId } = router.query;

  // Handle loading state
  if (!router.isReady || !ready) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  // Handle authentication
  if (!authenticated) {
    router.push('/');
    return null;
  }

  // Validate params
  if (typeof chainId !== 'string' || typeof nodeId !== 'string') {
    router.push('/dashboard');
    return null;
  }

  return (
    <NodeViewLayout
      chainId={chainId}
      nodeId={nodeId}
      colorState={colorState}
      cycleColors={cycleColors}
    />
  );
};

export default NodePage;