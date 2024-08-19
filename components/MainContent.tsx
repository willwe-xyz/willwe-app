import React from 'react';
import { Flex, Box, Alert, AlertIcon } from "@chakra-ui/react";
import { BalanceItem } from "@covalenthq/client-sdk";
import { NodeState } from "../lib/chainData";
import BalanceList from './BalanceList';
import GridNavigation from './GridNavigation';
import NodeDetails from './NodeDetails';
import { ActivityLogs } from './AllStackComponents';
import RootNodeDetails from './RootNodeDetails';

interface MainContentProps {
  isMobile: boolean | undefined;
  sortedUniqueBalances: BalanceItem[];
  selectedToken: string;
  handleTokenSelect: (tokenAddress: string) => void;
  willBalanceItems: any[];
  colorState: any;
  selectedNode: NodeState | null;
  userData: any;
  handleNodeClick: (nodeId: string) => void;
  chainId: string;
}

const MainContent: React.FC<MainContentProps> = ({
  isMobile,
  sortedUniqueBalances,
  selectedToken,
  handleTokenSelect,
  willBalanceItems,
  colorState,
  selectedNode,
  userData,
  handleNodeClick,
  chainId
}) => (
  <Flex direction={isMobile ? "column" : "row"} align="stretch" flex={1} overflow="hidden">
    <BalanceListContainer isMobile={isMobile}>
      <BalanceList 
        balances={sortedUniqueBalances} 
        selectedToken={selectedToken} 
        handleTokenSelect={handleTokenSelect} 
        willBalanceItems={willBalanceItems}
        {...colorState}
      />
    </BalanceListContainer>
    <ContentArea isMobile={isMobile}>
      {selectedNode ? (
        <SelectedNodeView
          nodes={userData?.userContext.nodes || []}
          selectedNode={selectedNode}
          handleNodeClick={handleNodeClick}
        />
      ) : selectedToken && chainId ? (
        <RootNodeDetails chainId={chainId} rootToken={selectedToken}     selectedTokenColor={colorState.backgroundColor} />
      ) : selectedToken ? (
        <NoChainIdWarning />
      ) : (
        <ActivityLogs />
      )}
    </ContentArea>
  </Flex>
);

const BalanceListContainer: React.FC<{ isMobile: boolean | undefined; children: React.ReactNode }> = ({ isMobile, children }) => (
  <Box 
    width={isMobile ? "100%" : "auto"}
    minWidth={isMobile ? "100%" : "80px"}
    maxHeight={isMobile ? "200px" : "auto"}
    padding={0}
    borderRight={isMobile ? "none" : "1px solid"}
    borderBottom={isMobile ? "1px solid" : "none"}
    borderColor="gray.200"
    position="relative"
    overflowY="auto"
  >
    {children}
  </Box>
);

const ContentArea: React.FC<{ isMobile: boolean | undefined; children: React.ReactNode }> = ({ isMobile, children }) => (
  <Box flex={1} overflowY="auto" marginLeft={isMobile ? 0 : 2} marginTop={isMobile ? 2 : 0}>
    {children}
  </Box>
);

const SelectedNodeView: React.FC<{
  nodes: NodeState[];
  selectedNode: NodeState;
  handleNodeClick: (nodeId: string) => void;
}> = ({ nodes, selectedNode, handleNodeClick }) => (
  <>
    <GridNavigation
      nodes={nodes}
      initialNodeId={selectedNode.nodeId}
      onNodeSelect={handleNodeClick}
    />
    <NodeDetails node={selectedNode} />
  </>
);

const NoChainIdWarning: React.FC = () => (
  <Alert status="warning">
    <AlertIcon />
    No chain ID available. Please ensure you're connected to a supported network.
  </Alert>
);

export default MainContent;