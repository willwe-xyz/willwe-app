import React, { useState, useCallback, useMemo } from 'react';
import { HStack, VStack, Box, Spinner, Text } from "@chakra-ui/react";
import { TokenBalance } from "./TokenBalance";
import { BalanceItem } from "@covalenthq/client-sdk";
import { sortChainBalances, evmAddressToFullIntegerString, NodeState } from "../lib/chainData";
import { NodeStacks } from "./NodeStacks";
import { User } from "@privy-io/react-auth";
import { useFetchUserData, FetchedUserData } from '../hooks/useFetchUserData';
import HeaderButtons from './HeaderButtons';
import { cols } from '../const/colors';

interface RootStack {
  privyData: User | null;
  ready: boolean;
  authenticated: boolean;
  logout: () => Promise<void>;
}

export const AllStacks: React.FC<RootStack> = ({ privyData, ready, authenticated, logout }) => {
  const { userData, isLoading, error } = useFetchUserData(ready, authenticated, privyData);
  
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const [activeStack, setActiveStack] = useState<NodeState[]>([]);
  const [selectedToken, setSelectedToken] = useState('');

  const sortedUniqueBalances = useMemo(() => {
    if (userData) {
      // Create a map to store unique balances by contract address
      const balanceMap = new Map<string, BalanceItem>();
      
      userData.balanceItems.forEach(item => {
        const existingItem = balanceMap.get(item.contract_address);
        if (!existingItem || (item.type === 'protocol' && existingItem.type !== 'protocol')) {
          balanceMap.set(item.contract_address, item);
        }
      });

      // Convert map back to array and sort
      const uniqueBalances = Array.from(balanceMap.values());
      return sortChainBalances(uniqueBalances, []);
    }
    return [];
  }, [userData]);

  const nodeStack = useMemo(() => {
    return userData?.userContext.nodes || [];
  }, [userData]);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (nodeId.includes('0x')) {
      setSelectedToken(nodeId);
      nodeId = evmAddressToFullIntegerString(nodeId);
    } 
     
    const selectedNode = nodeStack.find(n => n.nodeId === nodeId);
    const path = selectedNode ? selectedNode.rootPath : [nodeId]; 
    const newStack = nodeStack.filter(n => path.includes(n.nodeId));
    setActiveStack(newStack);
    setSelectedNode(selectedNode || null);
  }, [nodeStack]);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (!userData) {
    return <Text>No user data available.</Text>;
  }

  return (
    <VStack align="stretch" spacing={2}>
      <HeaderButtons logout={logout} userAddress={privyData?.wallet?.address} cols={cols} />

      <Box
        width="100%"
        overflowX="auto"
        overflowY="hidden"
        css={{
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(0, 0, 0, 0.4)',
          },
        }}
      >
        <HStack spacing={1} py={1} px={1}>
          {sortedUniqueBalances.map((balance, index) => (
            <Box key={balance.contract_address} onClick={() => handleNodeClick(balance.contract_address)}>
              <TokenBalance
                balanceItem={balance}
                protocolDeposit={balance.type === 'protocol' ? balance : undefined}
                isSelected={selectedToken === balance.contract_address}
              />
            </Box>
          ))}
        </HStack>
      </Box>
    
      <NodeStacks stack={activeStack} nodeClick={handleNodeClick} />
    </VStack>
  );
};