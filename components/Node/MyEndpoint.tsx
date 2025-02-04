import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../../contexts/TransactionContext';
import { deployments } from '../../config/deployments';
import { ABIs } from '../../config/contracts';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Input,
  Textarea,
  Heading,
  Spinner,
} from '@chakra-ui/react';

interface MyEndpointProps {
  nodeId: string;
  chainId: string;
}

export const MyEndpoint: React.FC<MyEndpointProps> = ({ nodeId, chainId }) => {
  const [endpoint, setEndpoint] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [functionInput, setFunctionInput] = useState('');
  const [encodedCall, setEncodedCall] = useState('');
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const toast = useToast();

  const fetchEndpointData = useCallback(async () => {
    try {
      setIsLoading(true);
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      const willWeContract = new ethers.Contract(
        deployments.WillWe[chainId.replace('eip155:', '')],
        ABIs.WillWe,
        signer
      );

      const membershipStatus = await willWeContract.isMember(userAddress, nodeId);
      setIsMember(membershipStatus);

      if (membershipStatus) {
        const endpointAddress = await willWeContract.endpoints(nodeId, userAddress);
        if (endpointAddress && endpointAddress !== ethers.constants.AddressZero) {
          setEndpoint(endpointAddress);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error fetching endpoint data',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [chainId, nodeId, getEthersProvider, toast]);

  const deployEndpoint = async () => {
    try {
      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            deployments.WillWe[chainId.replace('eip155:', '')],
            ABIs.WillWe,
            signer
          );
          return contract.createEndpoint(nodeId);
        },
        {
          successMessage: 'Endpoint deployed successfully',
          onSuccess: fetchEndpointData
        }
      );
    } catch (error) {
      console.error('Error deploying endpoint:', error);
      toast({
        title: 'Error',
        description: 'Failed to deploy endpoint',
        status: 'error',
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    fetchEndpointData();
  }, [fetchEndpointData]);

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner />
      </Box>
    );
  }

  if (!isMember) {
    return (
      <Box p={6}>
        <Text>You must be a member of this node to have an endpoint.</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="md">My Endpoint</Heading>
      
      {endpoint ? (
        <>
          <Text>Your endpoint address: {endpoint}</Text>
          <Box>
            <Heading size="sm" mb={2}>Mock Function Call</Heading>
            <Input
              placeholder="Enter function parameters"
              value={functionInput}
              onChange={(e) => setFunctionInput(e.target.value)}
              mb={2}
            />
            <Button onClick={() => {
              const encodedData = ethers.utils.defaultAbiCoder.encode(
                ['string'],
                [functionInput]
              );
              setEncodedCall(encodedData);
            }}>
              Encode Call
            </Button>
            
            {encodedCall && (
              <Textarea
                value={encodedCall}
                isReadOnly
                mt={2}
                placeholder="Encoded call data will appear here"
              />
            )}
          </Box>
        </>
      ) : (
        <Box>
          <Text mb={4}>You don't have an endpoint yet.</Text>
          <Button
            colorScheme="blue"
            onClick={deployEndpoint}
          >
            Plant an Endpoint
          </Button>
        </Box>
      )}
    </VStack>
  );
};

export default MyEndpoint;

