import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Box, Spinner, useToast } from '@chakra-ui/react';
import AppLayout from '../../../components/Layout/AppLayout';
import NodeDetails from '../../../components/NodeDetails';
import { useNodeData } from '../../../hooks/useNodeData';
import { useColorManagement } from '../../../hooks/useColorManagement';

const NodePage = () => {
  const router = useRouter();
  const { colorState } = useColorManagement();
  const toast = useToast();

  const { chainId, nodeId } = router.query;

  useEffect(() => {
    if (router.isReady && (!chainId || !nodeId)) {
      toast({
        title: "Error",
        description: "Invalid node or chain ID",
        status: "error",
        duration: 5000,
      });
      router.push('/dashboard');
    }
  }, [router.isReady, chainId, nodeId, router, toast]);

  const { data: nodeData, isLoading, error } = useNodeData(
    chainId as string,
    nodeId as string
  );

  if (!router.isReady || !chainId || !nodeId) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Spinner size="xl" color={colorState.contrastingColor} />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box flex={1} overflow="auto" bg="gray.50" p={6}>
        <NodeDetails
          chainId={chainId as string}
          nodeId={nodeId.toString()}
          selectedTokenColor={colorState.contrastingColor}
        />
      </Box>
    </AppLayout>
  );
};

export default NodePage;