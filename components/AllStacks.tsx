import React, { useState, useCallback, useMemo, useEffect } from 'react';
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

  useEffect(() => {
    console.log("userData:", userData);
  }, [userData]);

  const sortedUniqueBalances = useMemo(() => {
    console.log("Computing sortedUniqueBalances");
    if (userData && Array.isArray(userData.balanceItems)) {
      console.log("balanceItems:", userData.balanceItems);
      // Create a map to store unique balances by contract address
      const balanceMap = new Map<string, BalanceItem>();
      
      userData.balanceItems.forEach(item => {
        if (item && item.contract_address) {
          balanceMap.set(item.contract_address, item);
        }
      });

      // Convert map back to array and sort
      const uniqueBalances = Array.from(balanceMap.values());
      const sortedBalances = sortChainBalances(uniqueBalances, []);
      console.log("Sorted balances:", sortedBalances);
      return sortedBalances;
    }
    console.log("No valid balanceItems found");
    return [];
  }, [userData]);

  const nodeStack = useMemo(() => {
    return userData?.userContext?.nodes || [];
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

  const getProtocolBalance = useCallback((contractAddress: string) => {
    // Since we don't have WillBalanceItems in this structure, we'll return null
    // You may need to adjust this based on where the protocol balance is stored
    return null;
  }, [userData]);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (!userData || !Array.isArray(userData.balanceItems) || userData.balanceItems.length === 0) {
    return <Text>No user balance data available.</Text>;
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
          {sortedUniqueBalances.length > 0 ? (
            sortedUniqueBalances.map((balance) => {
              const protocolBalance = getProtocolBalance(balance.contract_address);
              return (
                <Box key={balance.contract_address} onClick={() => handleNodeClick(balance.contract_address)}>
                  <TokenBalance
                    balanceItem={balance}
                    isSelected={selectedToken === balance.contract_address}
                    protocolDeposit={userData.WillBalanceItems.find(
                      (item) => item.contract_address === balance.contract_address
                    )}
                  />
                  <hr />
                  {protocolBalance && (
                    <Text fontSize="xs" mt={1}>
                      Protocol Balance: {protocolBalance.pretty_quote}
                    </Text>
                  )}
                </Box>
              );
            })
          ) : (
            <Text>No balance items to display</Text>
          )}
        </HStack>
      </Box>
    
      <NodeStacks stack={activeStack} nodeClick={handleNodeClick} />
    </VStack>
  );
};