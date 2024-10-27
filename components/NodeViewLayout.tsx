import React from 'react';
import { Box, Flex, useBreakpointValue, useToast } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import HeaderButtons from './HeaderButtons';
import BalanceList from './BalanceList';
import NodeDetails from './NodeDetails';
import RootNodeDetails from './RootNodeDetails';
import ActivityLogs from './ActivityLogs';
import { useColorManagement, PaletteButton } from '../components/AllStackComponents';
import { useNode } from '../contexts/NodeContext';
import { useTransaction } from '../contexts/TransactionContext';
import { useBalances } from '../hooks/useBalances';

interface NodeViewLayoutProps {
  chainId?: string;
  nodeId?: string;
}

const NodeViewLayout: React.FC<NodeViewLayoutProps> = ({
  chainId: initialChainId,
  nodeId: initialNodeId,
}) => {
  const { user, authenticated, logout, login } = usePrivy();
  const { colorState, cycleColors, updateColors } = useColorManagement();
  const toast = useToast();
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Context hooks
  const { 
    selectedNodeId,
    selectedToken,
    selectNode,
    selectToken,
    clearNodeSelection 
  } = useNode();

  const { isTransacting } = useTransaction();

  // Get chain ID from router or props
  const chainId = (router.query.chainId as string) || initialChainId || user?.wallet?.chainId;
  const userAddress = user?.wallet?.address;

  // Fetch balances
  const { 
    balances, 
    protocolBalances,
    isLoading: isBalancesLoading,
    error: balancesError 
  } = useBalances(userAddress, chainId);

  // Handle token selection
  const handleTokenSelect = async (tokenAddress: string) => {
    if (isTransacting) return;
    
    updateColors(tokenAddress);
    selectToken(tokenAddress);
    router.push('/dashboard', undefined, { shallow: true });
  };

  // Handle node selection
  const handleNodeSelect = async (nodeId: string) => {
    if (isTransacting) return;
    
    selectNode(nodeId, chainId || '');
  };

  // Render the main content based on selection state
  const renderContent = () => {
    if (selectedNodeId) {
      return (
        <NodeDetails 
          nodeId={selectedNodeId} 
          chainId={chainId || ''} 
          onNodeSelect={handleNodeSelect}
        />
      );
    }
    
    if (selectedToken) {
      return (
        <RootNodeDetails
          chainId={chainId || ''}
          rootToken={selectedToken}
          userAddress={userAddress || ''}
          selectedTokenColor={colorState.contrastingColor}
          onNodeSelect={handleNodeSelect}
        />
      );
    }

    return <ActivityLogs />;
  };

  if (balancesError) {
    toast({
      title: "Error loading balances",
      description: balancesError.message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }

  return (
    <Flex direction="column" height="100vh">
      {/* Header */}
      <Flex 
        justify="space-between" 
        p={4} 
        borderBottom="1px solid" 
        borderColor="gray.200"
        bg="white"
      >
        <PaletteButton 
          cycleColors={cycleColors} 
          contrastingColor={colorState.contrastingColor} 
          reverseColor={colorState.reverseColor}
        />
        <HeaderButtons 
          logout={logout} 
          login={login}
          userAddress={userAddress || ''} 
          chainId={chainId || ''}
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
          isTransacting={isTransacting}
        />
      </Flex>

      {/* Main Content */}
      <Flex flex={1} direction={{ base: 'column', md: 'row' }}>
        {/* Balance List Sidebar */}
        <Box 
          width={{ base: '100%', md: '12%' }} 
          maxWidth={{ md: '110px' }}
          borderRight={{ md: '1px solid' }}
          borderColor={{ md: 'gray.200' }}
          overflowY="auto"
          bg="white"
        >
          <BalanceList 
            selectedToken={selectedToken || ''}
            handleTokenSelect={handleTokenSelect}
            contrastingColor={colorState.contrastingColor}
            reverseColor={colorState.reverseColor}
            hoverColor={colorState.hoverColor}
            userAddress={userAddress || ''}
            chainId={chainId || ''}
            balances={balances}
            protocolBalances={protocolBalances}
            isLoading={isBalancesLoading}
          />
        </Box>

        {/* Main Content Area */}
        <Box 
          flex={1} 
          p={4} 
          overflowY="auto"
          bg="gray.50"
        >
          {renderContent()}
        </Box>
      </Flex>
    </Flex>
  );
};

export default NodeViewLayout;