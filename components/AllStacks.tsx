import React, { useState, useMemo, useEffect } from 'react';
import { VStack, Box, Spinner, Text, Grid, GridItem, Flex, useBreakpointValue } from "@chakra-ui/react";
import { BalanceItem } from "@covalenthq/client-sdk";
import { sortChainBalances, evmAddressToFullIntegerString, NodeState, UserContext } from "../lib/chainData";
import { User } from "@privy-io/react-auth";
import { useFetchUserData } from '../hooks/useFetchUserData';
import HeaderButtons from './HeaderButtons';
import { cols } from '../const/colors';
import { useRouter } from 'next/router';
import GridNavigation from './GridNavigation';
import BalanceList from './BalanceList';
import { getDistinguishableColor, getReverseColor } from "../const/colors";

interface RootStack {
  privyData: User | null;
  ready: boolean;
  authenticated: boolean;
  logout: () => Promise<void>;
  login: () => Promise<void>;
}

export const AllStacks: React.FC<RootStack> = ({ privyData, ready, authenticated, logout, login }) => {
  const router = useRouter();
  const { nodeId } = router.query;
  const { userData, isLoading, error } = useFetchUserData(ready, authenticated, privyData);
  
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const [selectedToken, setSelectedToken] = useState('');
  const [filteredNodes, setFilteredNodes] = useState<NodeState[]>([]);
  const [contrastingColor, setContrastingColor] = useState<string>('#000000');
  const [reverseColor, setReverseColor] = useState<string>('#ffffff');

  const balanceListWidth = useBreakpointValue({ base: "100%", sm: "33%", md: "25%" });

  const sortedUniqueBalances = useMemo(() => {
    if (userData?.balanceItems) {
      const balanceMap = new Map<string, BalanceItem>();
      userData.balanceItems.forEach(item => {
        if (item?.contract_address) {
          balanceMap.set(item.contract_address, item);
        }
      });
      return sortChainBalances(Array.from(balanceMap.values()), []);
    }
    return [];
  }, [userData]);

  const handleNodeClick = (nodeId: string) => {
    if (nodeId.includes('0x')) {
      setSelectedToken(nodeId);
      nodeId = evmAddressToFullIntegerString(nodeId);
    }
     
    const clickedNode = userData?.userContext.nodes.find(n => n.nodeId === nodeId);
    setSelectedNode(clickedNode || null);
  };

  const handleTokenSelect = (tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    const nodeId = evmAddressToFullIntegerString(tokenAddress);
    const filteredNodes = userData?.userContext.nodes.filter(node => 
      node.rootPath.includes(nodeId) || node.nodeId === nodeId
    ) || [];
    setFilteredNodes(filteredNodes);
    if (filteredNodes.length > 0) {
      setSelectedNode(filteredNodes[0]);
    }

    // Update colors
    const newContrastingColor = getDistinguishableColor(`#${tokenAddress.slice(2, 8)}`, '#e2e8f0');
    setContrastingColor(newContrastingColor);
    setReverseColor(getReverseColor(newContrastingColor));
  };

  useEffect(() => {
    if (userData?.userContext.nodes) {
      setFilteredNodes(userData.userContext.nodes);
    }
  }, [userData]);

  if (isLoading) return <Spinner />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <VStack spacing={4} align="stretch" height="100vh">
      <HeaderButtons 
        logout={logout} 
        login={login}
        userAddress={privyData?.wallet?.address || ''} 
        cols={cols}
        nodes={filteredNodes}
        onNodeSelect={handleNodeClick}
      />
      <Flex direction={{ base: "column", sm: "row" }} align="stretch" flex={1} overflow="hidden">
        <Box 
          width={balanceListWidth} 
          minWidth="80px" 
          maxWidth="13%"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              width: '8px',
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: contrastingColor,
              borderRadius: '24px',
              transition: 'background-color 0.2s',
            },
            '&:hover::-webkit-scrollbar-thumb': {
              background: reverseColor,
            },
            'scrollbarWidth': 'thin',
            'scrollbarColor': `${contrastingColor} transparent`,
            '&:hover': {
              scrollbarColor: `${reverseColor} transparent`,
            },
            'transition': 'scrollbar-color 0.2s',
          }}
        >
          <BalanceList 
            balances={sortedUniqueBalances} 
            selectedToken={selectedToken} 
            handleTokenSelect={handleTokenSelect} 
            willBalanceItems={userData?.WillBalanceItems || []}
            contrastingColor={contrastingColor}
            reverseColor={reverseColor}
          />
        </Box>
        <Box flex={1} minWidth={{ base: "100%", sm: "60%" }} overflowY="auto">
          <Grid templateColumns='repeat(1, 1fr)' gap={4}>
            <GridItem>
              {filteredNodes.length > 0 && (
                <GridNavigation
                  nodes={filteredNodes}
                  initialNodeId={(nodeId as string) || (filteredNodes[0]?.nodeId || '')}
                  onNodeSelect={handleNodeClick}
                />
              )}
            </GridItem>
            {selectedNode && (
              <GridItem>
                <NodeDetails node={selectedNode} />
              </GridItem>
            )}
          </Grid>
        </Box>
      </Flex>
    </VStack>
  );
};

const NodeDetails: React.FC<{ node: NodeState }> = ({ node }) => (
  <Box p={4} borderWidth={1} borderRadius="lg">
    <Text fontWeight="bold" fontSize="xl">{node.nodeId}</Text>
    <Text>Inflation: {node.inflation}</Text>
    <Text>Balance Anchor: {node.balanceAnchor}</Text>
    <Text>Balance Budget: {node.balanceBudget}</Text>
    <Text>Value: {node.value}</Text>
    <Text>Membrane ID: {node.membraneId}</Text>
    <Text>Members: {node.membersOfNode.join(', ')}</Text>
    <Text>Children: {node.childrenNodes.join(', ')}</Text>
    <Text>Root Path: {node.rootPath.join(' > ')}</Text>
  </Box>
);

export default AllStacks;