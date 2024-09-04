import React, { useState, useCallback, useEffect } from 'react';
import { Box, Flex, VStack, useBreakpointValue } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import HeaderButtons from './HeaderButtons';
import BalanceList from './BalanceList';
import NodeDetails from './NodeDetails';
import RootNodeDetails from './RootNodeDetails';
import { useColorManagement, PaletteButton, ActivityLogs } from './AllStackComponents';
import { NodeState } from '../types/chainData';
import { useRouter } from 'next/router';

interface NodeViewLayoutProps {
  chainId?: string;
  nodeId?: string;
  nodeError: Error | null;
  nodeData: NodeState | null;
}

const NodeViewLayout: React.FC<NodeViewLayoutProps> = ({
  chainId,
  nodeId,
}) => {
  const { user, authenticated, logout, login } = usePrivy();
  const { colorState, cycleColors, updateColors } = useColorManagement();
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [urlChainId, setUrlChainId] = useState<string | null>(chainId || '');
  const [urlNodeId, setUrlNodeId] = useState<string | null>(nodeId || '');

  const router = useRouter();
  const { query } = router;

  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleTokenSelect = useCallback((tokenAddress: string) => {
    setUrlChainId(null);
    setSelectedToken(tokenAddress);
    updateColors(tokenAddress);
  }, [updateColors]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedToken(null);
    setUrlChainId(router.query.chainId as string || '');
    setUrlNodeId(nodeId);
    router.push(`/nodes/${chainId}/${nodeId}`, undefined, { shallow: true });
  }, [chainId, router]);

  console.log("rendered NodeViewLayout with selectedToken", selectedToken);

  useEffect(() => {
    if (chainId && nodeId) {
      setUrlChainId(chainId);
      setUrlNodeId(nodeId);
    }
  }, [chainId, nodeId]);

  const renderContent = () => {
    if (chainId && urlChainId) {
      return <NodeDetails nodeId={urlNodeId || nodeId || ''} chainId={urlChainId || wallet?.chainId || ''} onNodeSelect={handleNodeSelect} />
    } 
    else if (selectedToken) {
      return (
        <RootNodeDetails
          chainId={urlChainId || user?.wallet?.chainId || ''}
          rootToken={selectedToken}
          selectedTokenColor={colorState.contrastingColor}
          onNodeSelect={handleNodeSelect}
        />
      );
    }
    else {
      return <ActivityLogs />;
    }
  };

  return (
    <Flex direction="column" height="100vh">
      <Flex 
        justify="space-between" 
        p={4} 
        borderBottom="1px solid" 
        borderColor="gray.200"
      >
        <PaletteButton 
          cycleColors={cycleColors} 
          contrastingColor={colorState.contrastingColor} 
          reverseColor={colorState.reverseColor}
        />
        <HeaderButtons 
          logout={logout} 
          login={login}
          userAddress={user?.wallet?.address || ''} 
          nodes={[]} 
          onNodeSelect={handleNodeSelect}
        />
      </Flex>

      <Flex flex={1} direction={{ base: 'column', md: 'row' }}>
        <Box 
          width={{ base: '100%', md: '12%' }} 
          maxWidth={{ md: '110px' }}
          borderRight={{ md: '1px solid' }}
          borderColor={{ md: 'gray.200' }}
          overflowY="auto"
        >
          <BalanceList 
            selectedToken={selectedToken || ''}
            handleTokenSelect={handleTokenSelect}
            contrastingColor={colorState.contrastingColor}
            reverseColor={colorState.reverseColor}
            hoverColor={colorState.hoverColor}
            chainId={chainId}
            userAddress={user?.wallet?.address || ''}
          />
        </Box>
        <Box flex={1} p={4} overflowY="auto">
          {renderContent()}
        </Box>
      </Flex>
    </Flex>
  );
};

export default NodeViewLayout;