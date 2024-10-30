import React from 'react';
import { Box, HStack, Button } from '@chakra-ui/react';
import { Palette, LogOut, Plus } from 'lucide-react';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { useColorManagement } from '../hooks/useColorManagement';
import DashboardContent from '../components/Layout/DashboardContent';

const DashboardPage = () => {
  const router = useRouter();
  const { authenticated, user, logout } = usePrivy();
  const { colorState, cycleColors } = useColorManagement();
  
  const userAddress = user?.wallet?.address || '';

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
              <Button 
                onClick={() => {/* implement login */}} 
                colorScheme="purple"
              >
                Connect Wallet
              </Button>
            )}
          </HStack>
        </HStack>
      </Box>

      {/* Dashboard Content */}
      <DashboardContent colorState={colorState} />
    </Box>
  );
};

export default DashboardPage;