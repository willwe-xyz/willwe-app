import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Box } from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";
import { useNode } from '../../contexts/NodeContext';
import { MainLayout } from './MainLayout';

interface NodeViewLayoutProps {
  chainId: string;
  nodeId: string;
  colorState: {
    contrastingColor: string;
    reverseColor: string;
    hoverColor: string;
  };
  cycleColors: () => void;
}

const NodeViewLayout: React.FC<NodeViewLayoutProps> = ({
  chainId,
  nodeId,
  colorState,
  cycleColors,
  children
}) => {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const { selectNode } = useNode();

  const handleNodeSelect = useCallback((selectedNodeId: string) => {
    selectNode(selectedNodeId, chainId);
    router.push(`/nodes/${chainId}/${selectedNodeId}`);
  }, [chainId, router, selectNode]);

  const headerProps = {
    userAddress: user?.wallet?.address,
    chainId,
    logout: logout,
    login: async () => {/* implement login */},
    selectedNodeId: nodeId,
    onNodeSelect: handleNodeSelect,
    isTransacting: false,
    contrastingColor: colorState.contrastingColor,
    reverseColor: colorState.reverseColor,
    cycleColors,
    hideConnect: !authenticated
  };

  return (
    <MainLayout headerProps={headerProps}>
      {children}
    </MainLayout>
  );
};

export default NodeViewLayout;