// File: /pages/dashboard.tsx
import { useRouter } from 'next/router';
import { usePrivy } from "@privy-io/react-auth";
import { Box, useToast } from '@chakra-ui/react';
import AppLayout from '../components/Layout/AppLayout';
import RootNodeDetails from '../components/RootNodeDetails';
import { useNode } from '../contexts/NodeContext';
import { useColorManagement } from '../hooks/useColorManagement';
import { useRootNodes } from '../hooks/useRootNodes';
import { useChainId } from '../hooks/useChainId';

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  
  // Hooks
  const { colorState, cycleColors } = useColorManagement();
  const { user, ready, authenticated } = usePrivy();
  const { selectedToken, selectToken } = useNode();
  const { chainId } = useChainId();

  // Get token from URL or context
  const tokenAddress = router.query.token as string || selectedToken;

  // Fetch nodes data
  const { 
    data: nodes, 
    isLoading, 
    error, 
    refetch: refreshNodes 
  } = useRootNodes(
    chainId,
    tokenAddress,
    user?.wallet?.address || ''
  );

  return (
    <AppLayout>
      <Box flex={1} overflow="auto" bg="gray.50" p={6}>
        {!tokenAddress ? (
          <Box className="flex flex-col items-center justify-center h-full">
            {/* Empty state UI */}
          </Box>
        ) : (
          <RootNodeDetails 
            nodes={nodes || []}
            isLoading={isLoading}
            error={error}
            onRefresh={refreshNodes}
            selectedTokenColor={colorState.contrastingColor}
            chainId={chainId}
            selectedToken={tokenAddress}
          />
        )}
      </Box>
    </AppLayout>
  );
}