import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { VStack, Box, Spinner, Text, Grid, GridItem, Flex, Button, HStack } from "@chakra-ui/react";
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
import { Palette } from 'lucide-react';

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
  const [hoverColor, setHoverColor] = useState<string>('#e2e8f0');
  const [isHovering, setIsHovering] = useState(false);

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

    updateColors(tokenAddress);
  };

  const updateColors = useCallback((baseColor: string) => {
    const newContrastingColor = getDistinguishableColor(`#${baseColor.slice(-6)}`, '#e2e8f0');
    setContrastingColor(newContrastingColor);
    setReverseColor(getReverseColor(newContrastingColor));
    setHoverColor(getReverseColor(newContrastingColor, 0.2));
  }, []);

  const cycleColors = useCallback(() => {
    const currentHue = parseInt(contrastingColor.slice(1), 16);
    const newHue = (currentHue + 0.08 * 16777215) % 16777215; // 8% shift on the spectrum
    const noise = Math.floor(Math.random() * 1000); // Add some noise
    const newColor = Math.floor(newHue + noise).toString(16).padStart(6, '0');
    updateColors(newColor);
  }, [contrastingColor, updateColors]);

  useEffect(() => {
    if (userData?.userContext.nodes) {
      setFilteredNodes(userData.userContext.nodes);
    }
  }, [userData]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isHovering) {
      intervalId = setInterval(cycleColors, 100); // Cycle every 100ms while hovering
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isHovering, cycleColors]);

  if (isLoading) return <Spinner />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <VStack spacing={4} align="stretch" height="100vh">
      <Flex justifyContent="space-between" alignItems="center" p={2}>
        <Button
          leftIcon={<Palette size={18} />}
          onClick={cycleColors}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          size="sm"
          variant="outline"
          color="black"
          _hover={{ bg: 'purple.500', color: 'white' }}
        >
          Cycle
        </Button>
        <HeaderButtons 
          logout={logout} 
          login={login}
          userAddress={privyData?.wallet?.address || ''} 
          cols={cols}
          nodes={filteredNodes}
          onNodeSelect={handleNodeClick}
        />
      </Flex>
      <Box height="2px" bg={contrastingColor} transition="background-color 0.3s" />
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
            contrastingColor={contrastingColor}
            reverseColor={reverseColor}
            hoverColor={hoverColor}
          />
        </Box>
        <Box flex={1} overflowY="auto" marginLeft={2}>
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