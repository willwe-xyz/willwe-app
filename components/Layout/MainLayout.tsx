import React from 'react';
import { 
  Box, 
  Flex, 
  Grid,
  Container,
  Spinner,
  useColorModeValue 
} from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { useBalances } from '../../hooks/useBalances';
import { useColorManagement } from '../../hooks/useColorManagement';
import HeaderButtons from '../HeaderButtons';
import BalanceList from '../BalanceList';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, ready, authenticated, logout, login } = usePrivy();
  const { colorState, cycleColors } = useColorManagement();

  // Get chain and user info
  const chainId = user?.wallet?.chainId?.toString() || '';
  const userAddress = user?.wallet?.address || '';

  // Fetch balances for sidebar
  const { 
    balances, 
    protocolBalances, 
    isLoading: isBalancesLoading 
  } = useBalances(userAddress, chainId);

  // Navigation handlers
  const handleNodeSelect = (nodeId: string) => {
    if (!nodeId) {
      router.push('/dashboard');
    } else {
      router.push(`/nodes/${chainId}/${nodeId}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Loading state
  if (!ready) {
    return (
      <Flex height="100vh" align="center" justify="center">
        <Spinner size="xl" color={colorState.contrastingColor} />
      </Flex>
    );
  }

  return (
    <Flex direction="column" height="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Header */}
      <Box 
        py={4} 
        px={6} 
        bg={useColorModeValue('white', 'gray.800')}
        borderBottom="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Flex justify="space-between" align="center">
          {/* Logo/Theme Control */}
          <Box cursor="pointer" onClick={cycleColors}>
            <Box
              w="40px"
              h="40px"
              borderRadius="md"
              bg={colorState.contrastingColor}
              transition="all 0.2s"
              _hover={{ transform: 'scale(1.05)' }}
            />
          </Box>

          {/* Header Buttons */}
          <HeaderButtons
            userAddress={userAddress}
            chainId={chainId}
            logout={handleLogout}
            login={login}
            selectedNodeId={router.query.nodeId as string}
            onNodeSelect={handleNodeSelect}
            isTransacting={false}
            buttonHoverBg={`${colorState.contrastingColor}15`}
          />
        </Flex>
      </Box>

      {/* Main Content Area */}
      <Flex flex={1} overflow="hidden">
        {/* Sidebar */}
        <Box
          w="240px"
          borderRight="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          bg={useColorModeValue('white', 'gray.800')}
          overflow="auto"
        >
          <BalanceList
            selectedToken={router.query.tokenAddress as string}
            handleTokenSelect={(address) => {
              router.push(`/dashboard?token=${address}`);
            }}
            contrastingColor={colorState.contrastingColor}
            reverseColor={colorState.reverseColor}
            hoverColor={`${colorState.contrastingColor}15`}
            userAddress={userAddress}
            chainId={chainId}
            balances={balances || []}
            protocolBalances={protocolBalances || []}
            isLoading={isBalancesLoading}
          />
        </Box>

        {/* Content Area */}
        <Box 
          flex={1} 
          overflow="auto" 
          p={6}
          bg={useColorModeValue('gray.50', 'gray.900')}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};