import React, { useState, useCallback } from 'react';
import { Box, VStack, HStack, Spinner, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import HeaderButtons from './HeaderButtons';
import BalanceList from './BalanceList';
import NodeDetails from './NodeDetails';
import RootNodeDetails from './RootNodeDetails';
import { useColorManagement, PaletteButton } from './AllStackComponents';
import { NodeState } from '../types/chainData';

interface NodeViewLayoutProps {
  chainId: string;
  nodeId?: string;
  balances: any[];
  isBalancesLoading: boolean;
  balancesError: Error | null;
  nodeData: NodeState | null;
  isNodeLoading: boolean;
  nodeError: Error | null;
  onNodeSelect: (nodeId: string) => void;
}

const NodeViewLayout: React.FC<NodeViewLayoutProps> = ({
  chainId,
  nodeId,
  balances,
  isBalancesLoading,
  balancesError,
  nodeData,
  isNodeLoading,
  nodeError,
  onNodeSelect,
}) => {
  const { user, authenticated, logout, login } = usePrivy();
  const { colorState, cycleColors } = useColorManagement();
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  const handleTokenSelect = useCallback((tokenAddress: string) => {
    setSelectedToken(tokenAddress);
  }, []);

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
          nodes={[]} // We don't have user nodes here, so passing an empty array
          onNodeSelect={onNodeSelect}
        />
      </HStack>
      
      <HStack align="stretch" spacing={0}>
        {authenticated && (
          <Box width="80px" borderRight="1px solid" borderColor="gray.200">
            {isBalancesLoading ? (
              <Spinner size="sm" />
            ) : balancesError ? (
              <Text color="red.500">Error loading balances</Text>
            ) : (
              <BalanceList 
                balances={balances} 
                selectedToken={selectedToken || nodeData?.basicInfo[0] || ''}
                handleTokenSelect={handleTokenSelect}
                willBalanceItems={[]} // We don't have this data here, so passing an empty array
                {...colorState}
              />
            )}
          </Box>
        )}
        <Box flex={1} p={4}>
          {isNodeLoading ? (
            <Spinner size="xl" />
          ) : nodeError ? (
            <Alert status="error">
              <AlertIcon />
              {nodeError.message || 'Error loading node data'}
            </Alert>
          ) : selectedToken ? (
            <RootNodeDetails
              chainId={chainId}
              rootToken={selectedToken}
              selectedTokenColor={colorState.contrastingColor}
              onNodeSelect={onNodeSelect}
            />
          ) : nodeData ? (
            <NodeDetails
              node={nodeData}
              chainId={chainId}
              onNodeSelect={onNodeSelect}
            />
          ) : (
            <Text>No data available for this node.</Text>
          )}
        </Box>
      </HStack>
    </VStack>
  );
};

export default NodeViewLayout;