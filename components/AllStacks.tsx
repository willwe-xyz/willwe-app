import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { VStack, Box, Spinner, Text, Flex, useBreakpointValue } from "@chakra-ui/react";
import { BalanceItem } from "@covalenthq/client-sdk";
import { sortChainBalances, NodeState } from "../lib/chainData";
import { User } from "@privy-io/react-auth";
import { useFetchUserData } from '../hooks/useFetchUserData';
import HeaderButtons from './HeaderButtons';
import { cols } from '../const/colors';
import { useRouter } from 'next/router';
import { PaletteButton, useColorManagement } from './AllStackComponents';
import MainContent from './MainContent';

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
  const { colorState, updateColors, cycleColors } = useColorManagement();

  const chainId = useMemo(() => privyData?.wallet?.chainId?.toString() || '', [privyData]);

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
  }, [userData?.balanceItems]);

  const handleNodeClick = useCallback((nodeId: string) => {
    const clickedNode = userData?.userContext.nodes.find(n => n.nodeId === nodeId);
    if (clickedNode) {
      setSelectedNode(clickedNode);
    }
  }, [userData?.userContext.nodes]);

  const handleTokenSelect = useCallback((tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    setSelectedNode(null);
    updateColors(tokenAddress);
    console.log("Selected token:", tokenAddress, "Chain ID:", chainId);
  }, [updateColors, chainId]);

  useEffect(() => {
    if (router.pathname === '/node/undefined') {
      router.replace('/dashboard');
    }
  }, [router]);

  const isMobile = useBreakpointValue({ base: true, md: false });

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
          nodes={userData?.userContext.nodes || []}
          onNodeSelect={handleNodeClick}
        />
      </Flex>
      <Box height="2px" bg={colorState.contrastingColor} transition="background-color 0.3s" />
      <MainContent
        isMobile={isMobile}
        sortedUniqueBalances={sortedUniqueBalances}
        selectedToken={selectedToken}
        handleTokenSelect={handleTokenSelect}
        willBalanceItems={userData?.WillBalanceItems || []}
        colorState={colorState}
        selectedNode={selectedNode}
        userData={userData}
        handleNodeClick={handleNodeClick}
        chainId={chainId}
      />
    </VStack>
  );
};

export default AllStacks;