import { useRouter } from 'next/router';
import { usePrivy } from "@privy-io/react-auth";
import { MainLayout } from '../../../components/Layout/MainLayout';
import ContentLayout from '../../../components/Layout/ContentLayout';
import { NodeContentView } from '../../../components/Node/NodeContentView';
import { useColorManagement } from '../../../hooks/useColorManagement';
import { useNode } from '../../../contexts/NodeContext';
import { Box, Spinner } from '@chakra-ui/react';

export default function NodePage() {
  const router = useRouter();
  const { colorState, cycleColors } = useColorManagement();
  const { ready, authenticated, user, logout, login } = usePrivy();
  const { selectNode, selectedToken } = useNode();
  const { chainId, nodeId } = router.query;

  // Handle navigation to different nodes
  const handleNodeSelect = (selectedNodeId: string) => {
    if (chainId) {
      selectNode(selectedNodeId, chainId as string);
      router.push(`/nodes/${chainId}/${selectedNodeId}`);
    }
  };

  // Handle compose panel submission
  const handleComposeSubmit = async (data: any) => {
    // Handle token creation or entity definition
    // This will be handled by the ComposePanel component in MainLayout
  };

  // Handle loading state
  if (!router.isReady || !ready) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color={colorState.contrastingColor} />
      </Box>
    );
  }

  // Prepare header props
  const headerProps = {
    userAddress: user?.wallet?.address,
    chainId: chainId as string,
    logout,
    login,
    selectedNodeId: nodeId as string,
    onNodeSelect: handleNodeSelect,
    isTransacting: false,
    contrastingColor: colorState.contrastingColor,
    reverseColor: colorState.reverseColor,
    cycleColors,
    onComposeSubmit: handleComposeSubmit
  };

  // Prepare sidebar props
  const sidebarProps = {
    selectedToken,
    handleTokenSelect: (tokenAddress: string) => {
      router.push('/dashboard?token=' + tokenAddress);
    },
    ...colorState,
    userAddress: user?.wallet?.address || '',
    chainId: chainId as string,
  };

  return (
    <MainLayout headerProps={headerProps}>
      <ContentLayout sidebarProps={sidebarProps}>
        <NodeContentView
          nodeId={nodeId as string}
          chainId={chainId as string}
          colorState={colorState}
          onNodeSelect={handleNodeSelect}
        />
      </ContentLayout>
    </MainLayout>
  );
}