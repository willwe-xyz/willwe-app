// pages/dashboard.tsx
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { Spinner, Box, Alert, AlertIcon, Button, HStack } from '@chakra-ui/react';
import { Palette, LogOut, Plus } from 'lucide-react';
import { useCovalentBalances } from '../hooks/useCovalentBalances';
import { useColorManagement } from '../hooks/useColorManagement';
import { useRootNodes } from '../hooks/useRootNodes';
import BalanceList from '../components/BalanceList';
import RootNodeDetails from '../components/RootNodeDetails';
import { useNode } from '../contexts/NodeContext';

const DashboardPage = () => {
  const router = useRouter();
  const { user, ready, authenticated, logout } = usePrivy();
  const { colorState, cycleColors } = useColorManagement();
  const { selectedToken, selectToken } = useNode();
  
  const chainId = user?.wallet?.chainId?.toString() || '';
  const userAddress = user?.wallet?.address || '';

  // Fetch balances
  const { balances, protocolBalances, isLoading: balancesLoading } = useCovalentBalances(
    authenticated ? userAddress : '',
    chainId
  );

  // Fetch root nodes when a token is selected
  const { 
    data: nodes, 
    isLoading: nodesLoading,
    error: nodesError,
    refetch: refetchNodes
  } = useRootNodes(chainId, selectedToken, userAddress);

  const handleTokenSelect = useCallback((tokenAddress: string) => {
    selectToken(tokenAddress);
  }, [selectToken]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    router.push(`/nodes/${chainId}/${nodeId}`);
  }, [router, chainId]);

  const handleSpawnNode = useCallback(async () => {
    try {
      // Implement spawn logic
      console.log('Spawning node for token:', selectedToken);
      await refetchNodes();
    } catch (error) {
      console.error('Error spawning node:', error);
    }
  }, [selectedToken, refetchNodes]);

  // Loading state
  if (!ready || (balancesLoading && !nodes)) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color={colorState.contrastingColor} />
      </Box>
    );
  }

  return (
    <Box height="100vh" display="flex" flexDirection="column" overflow="hidden">
      {/* Header */}
      <Box py={4} px={6} borderBottom="1px solid" borderColor="gray.200" bg="white">
        <HStack justify="space-between">
          <Button
            leftIcon={<Palette />}
            variant="ghost"
            onClick={cycleColors}
            color={colorState.contrastingColor}
          >
            Theme
          </Button>

          <HStack spacing={4}>
            <Button
              leftIcon={<Plus />}
              onClick={() => router.push('/compose')}
              colorScheme="purple"
              variant="outline"
            >
              Compose
            </Button>
            
            {authenticated ? (
              <Button
                leftIcon={<LogOut />}
                onClick={() => logout()}
                variant="outline"
              >
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </Button>
            ) : (
              <Button onClick={() => {/* implement login */}} colorScheme="purple">
                Connect Wallet
              </Button>
            )}
          </HStack>
        </HStack>
      </Box>

      {/* Main Content */}
      <Box flex={1} display="flex" overflow="hidden">
        {/* Sidebar */}
        <Box 
          width="240px" 
          borderRight="1px solid" 
          borderColor="gray.200"
          height="100%"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          bg="white"
        >
          <BalanceList
            selectedToken={selectedToken}
            handleTokenSelect={handleTokenSelect}
            contrastingColor={colorState.contrastingColor}
            reverseColor={colorState.reverseColor}
            hoverColor={colorState.hoverColor}
            userAddress={userAddress}
            chainId={chainId}
            balances={balances || []}
            protocolBalances={protocolBalances || []}
            isLoading={balancesLoading}
          />
        </Box>

        {/* Content Area */}
        <Box flex={1} overflow="auto" bg="gray.50" p={6}>
          {selectedToken ? (
            <RootNodeDetails
              chainId={chainId}
              selectedToken={selectedToken}
              userAddress={userAddress}
              selectedTokenColor={colorState.contrastingColor}
              onNodeSelect={handleNodeSelect}
              onSpawnNode={handleSpawnNode}
              nodes={nodes || []}
              isLoading={nodesLoading}
              error={nodesError}
            />
          ) : (
            <Box p={8} textAlign="center" color="gray.500">
              Select a token from the sidebar to view details
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;