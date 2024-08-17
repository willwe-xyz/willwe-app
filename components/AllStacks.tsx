import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { VStack, Box, Spinner, Text, Grid, GridItem, Flex } from "@chakra-ui/react";
import { BalanceItem } from "@covalenthq/client-sdk";
import { sortChainBalances, evmAddressToFullIntegerString, NodeState } from "../lib/chainData";
import { User } from "@privy-io/react-auth";
import { useFetchUserData } from '../hooks/useFetchUserData';
import HeaderButtons from './HeaderButtons';
import { cols } from '../const/colors';
import { useRouter } from 'next/router';
import GridNavigation from './GridNavigation';
import BalanceList from './BalanceList';

import {ActivityLogs, NodeDetails, PaletteButton, useColorManagement, RootNodeDetails} from './AllStackComponents';

interface RootStack {
  privyData: User | null;
  ready: boolean;
  authenticated: boolean;
  logout: () => Promise<void>;
  login: () => Promise<void>;
}

export const AllStacks: React.FC<RootStack> = ({ privyData, ready, authenticated, logout, login }) => {
  const router = useRouter();
  const { userData, isLoading, error } = useFetchUserData(ready, authenticated, privyData);
  
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const [selectedToken, setSelectedToken] = useState('');
  const [filteredNodes, setFilteredNodes] = useState<NodeState[]>([]);
  const { colorState, updateColors, cycleColors } = useColorManagement();

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

  const handleNodeClick = useCallback((nodeId: string) => {
    const clickedNode = userData?.userContext.nodes.find(n => n.nodeId === nodeId);
    if (clickedNode) {
      setSelectedNode(clickedNode);
    }
  }, [userData?.userContext.nodes]);

  const handleTokenSelect = useCallback((tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    const nodeId = evmAddressToFullIntegerString(tokenAddress);
    console.log("fx() - handleTokenSelect : ", tokenAddress, nodeId);

    const filteredNodes = userData?.userContext.nodes.filter(node => 
      node.rootPath[0] === nodeId
    ) || [];
    setFilteredNodes(filteredNodes);
    if (filteredNodes.length > 0) {
      console.log("selected root node : ", filteredNodes[0]);
      setSelectedNode(filteredNodes[0]);
    } else {
      setSelectedNode(null);
    }
    updateColors(tokenAddress);
  }, [userData?.userContext.nodes, updateColors]);

  useEffect(() => {
    if (userData?.userContext.nodes) {
      setFilteredNodes(userData.userContext.nodes);
    }
  }, [userData]);

  useEffect(() => {
    if (router.pathname === '/node/undefined') {
      router.replace('/dashboard');
    }
  }, [router]);

  if (isLoading) return <Spinner />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <VStack spacing={4} align="stretch" height="100vh">
      <Flex justifyContent="space-between" alignItems="center" p={2}>
        <PaletteButton 
          cycleColors={cycleColors} 
          contrastingColor={colorState.contrastingColor} 
          reverseColor={colorState.reverseColor}
        />
        <HeaderButtons 
          logout={logout} 
          login={login}
          userAddress={privyData?.wallet?.address || ''} 
          cols={cols}
          nodes={filteredNodes}
          onNodeSelect={handleNodeClick}
        />
      </Flex>
      <Box height="2px" bg={colorState.contrastingColor} transition="background-color 0.3s" />
      <Flex direction="row" align="stretch" flex={1} overflow="hidden">
        <Box 
          width="auto"
          minWidth="80px"
          padding={0}
          borderRight="1px solid"
          borderColor="gray.200"
          position="relative"
        >
          <BalanceList 
            balances={sortedUniqueBalances} 
            selectedToken={selectedToken} 
            handleTokenSelect={handleTokenSelect} 
            willBalanceItems={userData?.WillBalanceItems || []}
            {...colorState}
          />
        </Box>
        <Box flex={1} overflowY="auto" marginLeft={2}>
          {selectedNode ? (
            <Grid templateColumns='repeat(1, 1fr)' gap={4}>
              <GridItem>
                <GridNavigation
                  nodes={filteredNodes}
                  initialNodeId={selectedNode.nodeId}
                  onNodeSelect={handleNodeClick}
                />
              </GridItem>
              <GridItem>
                <NodeDetails node={selectedNode} />
              </GridItem>
            </Grid>
          ) : selectedToken ? (
            <RootNodeDetails rootToken={selectedToken} nodes={filteredNodes} />
          ) : (
            <ActivityLogs />
          )}
        </Box>
      </Flex>
    </VStack>
  );
};

export default AllStacks;