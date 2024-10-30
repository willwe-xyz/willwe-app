import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { Spinner, Box, Alert, AlertIcon, Button, HStack } from '@chakra-ui/react';
import { Palette, LogOut, Plus } from 'lucide-react';
import { useCovalentBalances } from '../hooks/useCovalentBalances';
import { useColorManagement } from '../hooks/useColorManagement';
import { useNodeData } from '../hooks/useNodeData';
import BalanceList from '../components/BalanceList';
import RootNodeDetails from '../components/RootNodeDetails';
import { useNode } from '../contexts/NodeContext';

const DashboardPage = () => {
  const router = useRouter();
  const { user, ready, authenticated, logout } = usePrivy();
  const { colorState, cycleColors } = useColorManagement();
  const { selectedToken, selectToken } = useNode();
  
  // Get chain ID
  const rawChainId = user?.wallet?.chainId?.toString() || '';
  const chainId = rawChainId.includes('eip') ? rawChainId.replace('eip155:', '') : rawChainId;

  // Fetch balances
  const { balances, protocolBalances, isLoading: balancesLoading } = useCovalentBalances(
    authenticated ? user?.wallet?.address || '' : '',
    chainId
  );

  // Fetch node data when a token is selected
  const { data: nodeData, isLoading: nodesLoading } = useNodeData(chainId, selectedToken);

  console.log('Dashboard state:', {
    selectedToken,
    chainId,
    nodeData,
    balances: balances?.length
  });

  const handleTokenSelect = useCallback((tokenAddress) => {
    console.log('Token selected:', tokenAddress);
    selectToken(tokenAddress);
  }, [selectToken]);

  const isLoading = balancesLoading || nodesLoading;

  // Loading state
  if (!ready || isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color={colorState.contrastingColor} />
      </Box>
    );
  }

  return (
    <Box height="100vh" display="flex" flexDirection="column" overflow="hidden">
      {/* Header */}
      <Box 
        py={4} 
        px={6} 
        borderBottom="1px solid" 
        borderColor="gray.200"
        bg="white"
      >
        <HStack justify="space-between">
          {/* Left side */}
          <Button
            leftIcon={<Palette />}
            variant="ghost"
            onClick={cycleColors}
            color={colorState.contrastingColor}
          >
            Theme
          </Button>

          {/* Right side */}
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
                {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
              </Button>
            ) : (
              <Button
                onClick={() => login()}
                colorScheme="purple"
              >
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
            userAddress={user?.wallet?.address}
            chainId={chainId}
            balances={balances || []}
            protocolBalances={protocolBalances || []}
            isLoading={balancesLoading}
          />
        </Box>

        {/* Content Area */}
        <Box 
          flex={1} 
          overflow="auto"
          bg="gray.50"
          p={6}
        >
          {selectedToken ? (
            <RootNodeDetails
              nodes={nodeData?.nodes || []}
              totalValue={nodeData?.totalValue || BigInt(0)}
              selectedTokenColor={colorState.contrastingColor}
              onNodeSelect={(nodeId) => {
                router.push(`/nodes/${chainId}/${nodeId}`);
              }}
              onSpawnNode={async () => {
                // Implement spawn logic
                console.log('Spawning node for token:', selectedToken);
              }}
            />
          ) : (
            <Box
              p={8}
              textAlign="center"
              color="gray.500"
            >
              Select a token from the sidebar to view details
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;