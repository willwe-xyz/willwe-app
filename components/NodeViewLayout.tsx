
import React, { useState, useCallback, useEffect } from 'react';
import { Box, VStack, HStack, Spinner, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import HeaderButtons from './HeaderButtons';
import BalanceList from './BalanceList';
import NodeDetails from './NodeDetails';
import RootNodeDetails from './RootNodeDetails';
import { useColorManagement, PaletteButton, ActivityLogs } from './AllStackComponents';
import { NodeState } from '../types/chainData';
import {useNodeData} from '../hooks/useNodeData';
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



  const handleTokenSelect = useCallback((tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    setUrlChainId('');
    setUrlNodeId('');
    updateColors(tokenAddress);
  }, []);

  const handleNodeSelect = useCallback((nodeId: string) => {
    setUrlChainId(router.query.chainId as string);
    setUrlNodeId(router.query.nodeId as string);
    router.push(`/nodes/${chainId}/${nodeId}`, undefined, { shallow: true });
  }, [chainId, router]);


  console.log("rendered NodeViewLayout with selectedToken", selectedToken);
  const renderContent = () => {

 
    if (urlNodeId && urlChainId) {
      return <NodeDetails nodeId={urlNodeId} chainId={urlChainId} onNodeSelect={handleNodeSelect} />
     } 
    else if (selectedToken) {
      return (
        <RootNodeDetails
          chainId={urlChainId || chainId as string}
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
    <VStack spacing={4} align="stretch" height="100vh">
      <HStack justify="space-between" p={2}>
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
      </HStack>

      <HStack align="stretch" spacing={0}>
        <BalanceList 
          selectedToken={selectedToken || ''}
          handleTokenSelect={handleTokenSelect}
          contrastingColor={colorState.contrastingColor}
          reverseColor={colorState.reverseColor}
          hoverColor={colorState.hoverColor}
          chainId={chainId}
          userAddress={user?.wallet?.address || ''}
        />
        <Box flex={1} p={4}>
          {renderContent()}
        </Box>
      </HStack>
    </VStack>
  );
};

export default NodeViewLayout;