import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Box, Spinner, useToast, Heading, Text, Button, VStack } from '@chakra-ui/react';
import AppLayout from '../../../components/Layout/AppLayout';
import NodeDetails from '../../../components/NodeDetails';
import { useNodeData } from '../../../hooks/useNodeData';
import { useColorManagement } from '../../../hooks/useColorManagement';
import { useAppKit } from '@/hooks/useAppKit';
import { MainLayout } from '../../../components/Layout/MainLayout';
import { ethers } from 'ethers';
import { nodeIdToAddress } from '../../../utils/formatters';

const NodePage = () => {
  const router = useRouter();
  const { colorState, cycleColors, setColorState, getContrastColor } = useColorManagement();
  const toast = useToast();
  const { user, isInitializing } = useAppKit();
  
  const { chainId, nodeId } = router.query;

  const userAddress = user?.wallet?.address || ethers.ZeroAddress;
  
  const { data: nodeData, isLoading, error } = useNodeData(
    chainId as string,
    userAddress,
    nodeId as string
  );

  // Update color when root token is available
  useEffect(() => {
    if (nodeData?.rootPath?.[0]) {
      // Convert root node ID to address before using it for color
      const rootTokenAddress = nodeIdToAddress(nodeData.rootPath[0]);
      const newColor = `#${rootTokenAddress.slice(2, 8)}`;
      setColorState({
        contrastingColor: newColor,
        reverseColor: getContrastColor(newColor),
        hoverColor: `${newColor}20`
      });
    }
  }, [nodeData?.rootPath, setColorState, getContrastColor]);

  if (!router.isReady || !chainId || !nodeId) {
    return (
      <MainLayout 
        headerProps={{
          userAddress: user?.wallet?.address,
          chainId: chainId as string,
          isTransacting: false,
          contrastingColor: colorState.contrastingColor,
          reverseColor: colorState.reverseColor,
          cycleColors,
          onNodeSelect: (nodeId: string) => {
            router.push(`/nodes/${chainId}/${nodeId}`);
          },
          selectedTokenColor: colorState.contrastingColor,
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Spinner size="xl" color={colorState.contrastingColor} />
        </Box>
      </MainLayout>
    );
  }

  // Show 404 page if node doesn't exist or isn't initialized
  if (error?.message?.includes('BAD_DATA') || error?.message?.includes('getNodeData')) {
    return (
      <MainLayout 
        headerProps={{
          userAddress: user?.wallet?.address,
          chainId: chainId as string,
          isTransacting: false,
          contrastingColor: colorState.contrastingColor,
          reverseColor: colorState.reverseColor,
          cycleColors,
          onNodeSelect: (nodeId: string) => {
            router.push(`/nodes/${chainId}/${nodeId}`);
          },
          selectedTokenColor: colorState.contrastingColor,
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <VStack spacing={6}>
            <Heading size="2xl" color={colorState.contrastingColor}>404</Heading>
            <Text fontSize="xl">Node not found or not initialized</Text>
            <Button 
              onClick={() => router.push('/')}
              colorScheme="blue"
              variant="outline"
            >
              Return to Home
            </Button>
          </VStack>
        </Box>
      </MainLayout>
    );
  }

  // Get the root token from the node's rootPath and convert to address
  const rootToken = nodeData?.rootPath?.[0] ? nodeIdToAddress(nodeData.rootPath[0]) : undefined;

  const headerProps = {
    userAddress: user?.wallet?.address,
    chainId: chainId as string,
    isTransacting: false,
    contrastingColor: colorState.contrastingColor,
    reverseColor: colorState.reverseColor,
    cycleColors,
    onNodeSelect: (nodeId: string) => {
      router.push(`/nodes/${chainId}/${nodeId}`);
    },
    selectedTokenColor: colorState.contrastingColor,
  };

  return (
    <MainLayout headerProps={headerProps} rootToken={rootToken}>
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