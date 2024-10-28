import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { Spinner, Box, Alert, AlertIcon } from '@chakra-ui/react';
import { useNode } from '../../contexts/NodeContext';
import { useFetchUserData } from '../../hooks/useFetchUserData';
import { useCovalentBalances } from '../../hooks/useCovalentBalances';
import { useNodeData } from '../../hooks/useNodeData';
import MainLayout from '../Layout/MainLayout';
import ContentLayout from '../Layout/ContentLayout';
import RootNodeDetails from '../RootNodeDetails';
import NodeDetails from '../NodeDetails';
import ActivityLogs from '../ActivityLogs';

interface NodeViewContainerProps {
  chainId?: string;
  nodeId?: string;
  colorState: {
    contrastingColor: string;
    reverseColor: string;
    hoverColor: string;
  };
  cycleColors: () => void;
}

const NodeViewContainer: React.FC<NodeViewContainerProps> = ({
  chainId: initialChainId,
  nodeId: initialNodeId,
  colorState,
  cycleColors
}) => {
  const { user, authenticated, logout, login } = usePrivy();
  const router = useRouter();
  const { selectedToken, selectToken, selectedNodeId, selectNode } = useNode();

  const [currentToken, setCurrentToken] = useState<string>(selectedToken || '');

  const chainId = (router.query.chainId as string) || initialChainId || user?.wallet?.chainId;
  const userAddress = user?.wallet?.address;

  const { balances, protocolBalances, isLoading, error } = useCovalentBalances(
    userAddress || '',
    chainId || ''
  );

  const handleTokenSelect = useCallback((tokenAddress: string) => {
    setCurrentToken(tokenAddress);
    selectToken(tokenAddress);
  }, [selectToken]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    selectNode(nodeId, chainId || '');
    router.push(`/nodes/${chainId}/${nodeId}`);
  }, [chainId, router, selectNode]);

  const renderContent = () => {
    if (!chainId || !userAddress) {
      return (
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to continue
        </Alert>
      );
    }

    if (isLoading) {
      return <Spinner size="xl" />;
    }

    if (error) {
      return (
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      );
    }

    // Show NodeDetails if we have a selected node
    if (selectedNodeId) {
      return (
        <NodeDetails 
          chainId={chainId} 
          nodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
        />
      );
    }

    // Show RootNodeDetails if we have a selected token
    if (currentToken) {
      return (
        <RootNodeDetails
          chainId={chainId}
          rootToken={currentToken}
          userAddress={userAddress}
          selectedTokenColor={colorState.contrastingColor}
          onNodeSelect={handleNodeSelect}
        />
      );
    }

    // Show ActivityLogs as fallback
    return <ActivityLogs />;
  };

  return (
    <MainLayout
      headerProps={{
        userAddress,
        chainId: chainId || '',
        logout,
        login,
        selectedNodeId: initialNodeId,
        onNodeSelect: handleNodeSelect,
        isTransacting: false,
        contrastingColor: colorState.contrastingColor,
        reverseColor: colorState.reverseColor,
        cycleColors
      }}
    >
      <ContentLayout
        sidebarProps={{
          selectedToken: currentToken,
          handleTokenSelect,
          ...colorState,
          userAddress: userAddress || '',
          chainId: chainId || '',
          balances,
          protocolBalances,
          isLoading
        }}
      >
        {renderContent()}
      </ContentLayout>
    </MainLayout>
  );
};

export default NodeViewContainer;