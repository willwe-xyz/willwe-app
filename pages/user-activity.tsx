import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Input, 
  Button, 
  VStack, 
  HStack, 
  Text,
  useToast
} from '@chakra-ui/react';
import { UserActivityFeed } from '../components/UserActivityFeed';

/**
 * User Activity Page
 * This page allows testing the UserActivityFeed component with different user addresses
 */
export default function UserActivityPage() {
  const [userAddress, setUserAddress] = useState<string>('');
  const [currentUserAddress, setCurrentUserAddress] = useState<string>('');
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userAddress) {
      toast({
        title: 'Error',
        description: 'Please enter a user address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setCurrentUserAddress(userAddress);
    
    toast({
      title: 'Loading activities',
      description: `Fetching activities for ${userAddress}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleTestUser = () => {
    const testAddress = '0x8E5138617A7bf932B693E793feA8B8DF420Cf9F5';
    setUserAddress(testAddress);
    setCurrentUserAddress(testAddress);
    
    toast({
      title: 'Test User Selected',
      description: `Using test user address: ${testAddress}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl">User Activity Tester</Heading>
        
        <Box p={6} borderWidth="1px" borderRadius="lg">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold">Enter User Address:</Text>
              <Input 
                value={userAddress} 
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="0x..."
              />
              <HStack>
                <Button type="submit" colorScheme="blue">
                  Fetch Activities
                </Button>
                <Button onClick={handleTestUser} colorScheme="teal">
                  Use Test User
                </Button>
              </HStack>
            </VStack>
          </form>
        </Box>
        
        {currentUserAddress && (
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              Activities for {currentUserAddress.substring(0, 6)}...{currentUserAddress.substring(currentUserAddress.length - 4)}
            </Heading>
            <UserActivityFeed userAddress={currentUserAddress} showDebug={true} />
          </Box>
        )}
      </VStack>
    </Container>
  );
}
