// File: ./pages/dashboard.tsx

import { useRouter } from 'next/router';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { 
  Box, 
  Text, 
  Spinner, 
  Alert, 
  AlertIcon, 
  useToast,
  Grid,
  GridItem,
  Button
} from '@chakra-ui/react';
import { MainLayout } from '../components/Layout/MainLayout';
import { RootNodeDetails } from '../components/RootNodeDetails';
import { UserActivityFeed } from '../components/UserActivityFeed';
import { RootActivityFeed } from '../components/RootActivityFeed';
import { useColorManagement } from '../hooks/useColorManagement';
import { useRootNodes } from '../hooks/useRootNodes';
import { useState, useEffect } from 'react';
import { deployments } from '../config/deployments';
import { ethers } from 'ethers';

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const [selectedToken, setSelectedToken] = useState<string>('');
  
  // Hooks
  const { colorState, cycleColors, setColorState, getContrastColor } = useColorManagement();

  const { user, ready, authenticated, logout, login } = usePrivy();
  const { wallets } = useWallets();
  const userAddress = user?.wallet?.address;

  // Get token from URL or context
  const tokenAddress = router.query.token as string || selectedToken;
  
  // Set initial color based on token address
  useEffect(() => {
    if (tokenAddress) {
      const newColor = `#${tokenAddress.slice(2, 8)}`;
      setColorState({
        contrastingColor: newColor,
        reverseColor: getContrastColor(newColor),
        hoverColor: `${newColor}20`
      });
    }
  }, [tokenAddress, setColorState, getContrastColor]);

  // Find supported networks from deployments
  const supportedChainIds = Object.keys(deployments.WillWe);
  
  // Default to Base mainnet chain ID
  const defaultChainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN || '8453';
  
  // Get chain ID from URL, wallet, or default to a supported chain
  let chainId = router.query.chainId as string || wallets[0]?.chainId?.replace('eip155:', '');
  
  // Validate the chain ID is supported
  const cleanChainId = chainId?.replace('eip155:', '') || '';
  const isValidChain = supportedChainIds.includes(cleanChainId);
  
  // If the current chain is not supported, default to Base (8453)
  const effectiveChainId = isValidChain ? cleanChainId : defaultChainId;
  
  // Handle chain changes and update URL accordingly
  useEffect(() => {
    if (!ready || !router.isReady || !wallets[0]?.provider) return;
    
    const wallet = wallets[0];
    const provider = wallet.provider;
    
    const handleChainChanged = (chainId: string) => {
      if (!chainId) return;
      
      const cleanChainId = typeof chainId === 'string' ? chainId.replace('eip155:', '') : String(chainId);
      
      // Update URL to reflect the current chain
      router.replace(
        {
          pathname: router.pathname,
          query: { 
            ...router.query,
            chainId: cleanChainId 
          }
        },
        undefined,
        { shallow: true }
      );
      
      // If chain is unsupported, prompt to switch to Base
      if (!supportedChainIds.includes(cleanChainId)) {
        toast.closeAll(); // Close any existing toasts
        toast({
          title: "Unsupported Network",
          description: (
            <>
              <Text>Please switch to Base Network (Chain ID: {defaultChainId})</Text>
              <Button 
                size="sm" 
                colorScheme="blue" 
                mt={2}
                onClick={() => handleSwitchNetwork()}
              >
                Switch to Base
              </Button>
            </>
          ),
          status: "warning",
          duration: null, // Don't auto-dismiss
          isClosable: true,
          position: "top"
        });
      } else {
        // Close any existing network warning toasts when switching to a supported chain
        toast.closeAll();
      }
    };
    
    // Initial check
    if (wallet.chainId) {
      handleChainChanged(wallet.chainId);
    }
    
    // Set up event listener for chain changes if provider supports it
    if (provider && typeof provider.on === 'function') {
      provider.on('chainChanged', handleChainChanged);
      
      // Cleanup
      return () => {
        if (provider && typeof provider.removeListener === 'function') {
          provider.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [ready, router, wallets, supportedChainIds, defaultChainId, toast]);

  // Handle network switch
  const handleSwitchNetwork = async () => {
    if (!wallets[0]) return;
    
    try {
      await wallets[0].switchChain(Number(defaultChainId));
      toast({
        title: "Network Switched",
        description: `Successfully switched to Chain ID: ${defaultChainId}`,
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Network Switch Failed",
        description: error instanceof Error ? error.message : "Failed to switch network",
        status: "error",
        duration: 5000,
      });
    }
  };

  // Fetch nodes data (using the validated chainId)
  const { 
    data: nodes, 
    isLoading: nodesLoading, 
    error: nodesError, 
    refetch: refreshNodes 
  } = useRootNodes(
    effectiveChainId,
    tokenAddress,
    userAddress
  );

  // Handle token selection
  const handleTokenSelect = (tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    // Generate a new color based on the token address
    const newColor = `#${tokenAddress.slice(2, 8)}`; // Use first 6 chars of token address as color
    setColorState({
      contrastingColor: newColor,
      reverseColor: getContrastColor(newColor),
      hoverColor: `${newColor}20`
    });
    router.push({
      pathname: '/dashboard',
      query: { 
        token: tokenAddress,
        chainId: effectiveChainId 
      }
    }, undefined, { shallow: true });
  };

  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    router.push(`/nodes/${effectiveChainId}/${nodeId}`);
  };

  // Prepare header props
  const headerProps = {
    userAddress: user?.wallet?.address,
    chainId: effectiveChainId,
    logout,
    login,
    isTransacting: false,
    contrastingColor: colorState.contrastingColor,
    reverseColor: colorState.reverseColor,
    cycleColors,
    onNodeSelect: (nodeId: string) => {
      handleNodeSelect(nodeId);
    },
  };

  // Empty dashboard state
  const renderEmptyDashboard = () => (
    <Box className="flex flex-col mx-auto w-full p-1">
      <UserActivityFeed 
        userAddress={userAddress || ''} 
        chainId={effectiveChainId} 
      />
    </Box>
  );

  // Display notification when using an unsupported network
  const renderChainMismatchWarning = () => {
    const walletChainId = wallets[0]?.chainId?.replace('eip155:', '');
    if (walletChainId && !supportedChainIds.includes(walletChainId)) {
      return (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          <Box flex="1">
            <Text>
              Your wallet is connected to an unsupported network (Chain ID: {walletChainId}). 
              Please switch to a supported network to continue.
            </Text>
            <Button
              size="sm"
              colorScheme="yellow"
              variant="outline"
              ml={4}
              mt={2}
              onClick={handleSwitchNetwork}
            >
              Switch to Base (Chain ID: {defaultChainId})
            </Button>
          </Box>
        </Alert>
      );
    }
    return null;
  };

  // Loading state
  if (!ready || nodesLoading) {
    return (
      <MainLayout headerProps={headerProps}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Spinner size="xl" color={colorState.contrastingColor} />
        </Box>
      </MainLayout>
    );
  }


  return (
    <MainLayout 
      headerProps={headerProps} 
      rootToken={tokenAddress}
      onTokenSelect={(tokenAddress) => {
        // Generate a new color based on the token address
        const newColor = `#${tokenAddress.slice(2, 8)}`; // Use first 6 chars of token address as color
        setColorState({
          contrastingColor: newColor,
          reverseColor: getContrastColor(newColor),
          hoverColor: `${newColor}20`
        });
      }}
    >
      <Box flex={1} overflow="auto" bg="gray.50" p={4}>
        {renderChainMismatchWarning()}
        
        {!tokenAddress ? (
          renderEmptyDashboard()
        ) : (
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={3}>
            <GridItem>
              <RootNodeDetails 
                nodes={nodes || []}
                isLoading={nodesLoading}
                error={nodesError}
                onRefresh={refreshNodes}
                selectedTokenColor={colorState.contrastingColor}
                chainId={effectiveChainId}
                selectedToken={tokenAddress}
                onNodeSelect={headerProps.onNodeSelect}
              />
            </GridItem>
            <GridItem>
              <RootActivityFeed 
                tokenAddress={tokenAddress}
                chainId={effectiveChainId}
                showDebug={process.env.NODE_ENV === 'development'}
                selectedTokenColor={colorState.contrastingColor}
              />
            </GridItem>
          </Grid>
        )}
      </Box>
    </MainLayout>
  );
}