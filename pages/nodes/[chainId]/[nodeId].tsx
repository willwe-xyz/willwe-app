import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Box, Spinner, useToast } from '@chakra-ui/react';
import AppLayout from '../../../components/Layout/AppLayout';
import NodeDetails from '../../../components/NodeDetails';
import { useNodeData } from '../../../hooks/useNodeData';
import { useColorManagement } from '../../../hooks/useColorManagement';
import { usePrivy } from '@privy-io/react-auth';
import { useActivityFeed } from '../../../hooks/useActivityFeed';
import { MainLayout } from '../../../components/Layout/MainLayout';

const NodePage = () => {
  const router = useRouter();
  const { colorState, cycleColors } = useColorManagement();
  const toast = useToast();
  const { user, ready, authenticated, logout, login } = usePrivy();
  
  const { chainId, nodeId } = router.query;

  // Prepare header props - matching the dashboard implementation
  const headerProps = {
    userAddress: user?.wallet?.address,
    chainId: chainId as string,
    logout,
    login,
    isTransacting: false,
    contrastingColor: colorState.contrastingColor,
    reverseColor: colorState.reverseColor,
    cycleColors,
    onNodeSelect: (nodeId: string) => {
      router.push(`/nodes/${chainId}/${nodeId}`);
    },
  };

  const { data: nodeData, isLoading, error } = useNodeData(
    chainId as string,
    nodeId as string
  );

  if (!router.isReady || !chainId || !nodeId) {
    return (
      <MainLayout headerProps={headerProps}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Spinner size="xl" color={colorState.contrastingColor} />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout headerProps={headerProps}>
      <Box flex={1} bg="gray.50" p={0}>
        <NodeDetails
          chainId={chainId as string}
          nodeId={nodeId.toString()}
          selectedTokenColor={colorState.contrastingColor}
        />
      </Box>
    </MainLayout>
  );
};

export default NodePage;