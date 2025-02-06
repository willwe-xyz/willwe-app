import React, { useState } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../../contexts/TransactionContext';
import { deployments } from '../../config/deployments';
import { ABIs } from '../../config/contracts';
import { NodeState } from '../../types/chainData';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Input,
  Heading,
  Spinner,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Divider,
  Code,
  IconButton,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { Plus, Trash2, Play, Copy, AlertCircle } from 'lucide-react';

interface Call {
  target: string;
  callData: string;
  value: string;
}

interface MyEndpointProps {
  nodeData: NodeState;
  chainId: string;
  onSuccess?: () => void;
}

export const MyEndpoint: React.FC<MyEndpointProps> = ({ 
  nodeData, 
  chainId,
  onSuccess 
}) => {

  console.log('NodeData:', nodeData);

  const [calls, setCalls] = useState<Call[]>([]);
  const [currentCall, setCurrentCall] = useState<Call>({
    target: '',
    callData: '',
    value: '0'
  });
  const [executionResult, setExecutionResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const toast = useToast();

  // Get endpoint address and membership status from nodeData
  const endpointAddress = nodeData.basicInfo[10];
  const isMember = nodeData.membersOfNode.some(
    member => member.toLowerCase() === window.ethereum?.selectedAddress?.toLowerCase()
  );

  const deployEndpoint = async () => {
    if (!isMember) {
      toast({
        title: 'Error',
        description: 'You must be a member to create an endpoint',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    setIsProcessing(true);
    try {
      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();
          
          const contract = new ethers.Contract(
            deployments.WillWe[chainId.replace('eip155:', '')],
            ABIs.WillWe,
            signer
          );
          
          return contract.createEndpointForOwner(nodeData.basicInfo[0], userAddress);
        },
        {
          successMessage: 'Endpoint created successfully',
          onSuccess: () => {
            onSuccess?.();
            toast({
              title: 'Success',
              description: 'Your endpoint has been created',
              status: 'success',
              duration: 5000,
            });
          }
        }
      );
    } catch (error) {
      console.error('Error creating endpoint:', error);
      toast({
        title: 'Error',
        description: 'Failed to create endpoint',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addCall = () => {
    if (!currentCall.target || !currentCall.callData) {
      toast({
        title: 'Invalid call',
        description: 'Target and call data are required',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    setCalls([...calls, currentCall]);
    setCurrentCall({ target: '', callData: '', value: '0' });
  };

  const removeCall = (index: number) => {
    setCalls(calls.filter((_, i) => i !== index));
  };

  const executeAggregatedCalls = async () => {
    if (!endpointAddress || calls.length === 0) return;

    setIsProcessing(true);
    try {
      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const endpointContract = new ethers.Contract(
            endpointAddress,
            ABIs.PowerProxy,
            signer
          );

          const formattedCalls = calls.map(call => ({
            target: call.target,
            callData: call.callData,
            value: ethers.parseEther(call.value || '0')
          }));

          return endpointContract.tryAggregate(true, formattedCalls);
        },
        {
          successMessage: 'Calls executed successfully',
          onSuccess: (result) => {
            setExecutionResult(JSON.stringify(result, null, 2));
            setCalls([]);
          }
        }
      );
    } catch (error) {
      console.error('Error executing calls:', error);
      toast({
        title: 'Error',
        description: 'Failed to execute calls',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // If not a member, show membership required message
  if (!isMember) {
    return (
      <Alert 
        status="warning" 
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="lg"
      >
        <AlertCircle size={40} />
        <Text mt={4} fontSize="lg" fontWeight="medium">
          Membership Required
        </Text>
        <Text mt={2}>
          You need to be a member of this node to create and manage an endpoint.
        </Text>
      </Alert>
    );
  }

  // If no endpoint exists, show creation option
  if (!endpointAddress || endpointAddress === ethers.ZeroAddress) {
    return (
      <VStack spacing={6} align="stretch">
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="medium">No Endpoint Found</Text>
            <Text fontSize="sm">
              Create an endpoint to execute transactions on behalf of this node.
            </Text>
          </VStack>
        </Alert>

        <Button
          colorScheme="blue"
          onClick={deployEndpoint}
          isLoading={isProcessing}
          loadingText="Creating..."
        >
          Create Endpoint
        </Button>
      </VStack>
    );
  }

  // Main endpoint management interface
  return (
    <VStack spacing={6} align="stretch">
      <Box 
        p={4} 
        borderRadius="md" 
        bg="gray.50" 
        border="1px" 
        borderColor="gray.200"
      >
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="gray.600">Your Endpoint Address</Text>
            <Code fontSize="sm">{endpointAddress}</Code>
          </VStack>
          <IconButton
            aria-label="Copy endpoint address"
            icon={<Copy size={16} />}
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(endpointAddress);
              toast({
                title: 'Copied',
                status: 'success',
                duration: 2000,
              });
            }}
          />
        </HStack>
      </Box>

      <Divider />

      <Box>
        <Heading size="sm" mb={4}>Execute Multiple Calls</Heading>
        
        <VStack spacing={4} mb={6}>
          <FormControl>
            <FormLabel>Target Address</FormLabel>
            <Input
              value={currentCall.target}
              onChange={(e) => setCurrentCall({...currentCall, target: e.target.value})}
              placeholder="0x..."
            />
          </FormControl>

          <FormControl>
            <FormLabel>Call Data</FormLabel>
            <Input
              value={currentCall.callData}
              onChange={(e) => setCurrentCall({...currentCall, callData: e.target.value})}
              placeholder="0x..."
            />
          </FormControl>

          <FormControl>
            <FormLabel>Value (ETH)</FormLabel>
            <Input
              type="number"
              value={currentCall.value}
              onChange={(e) => setCurrentCall({...currentCall, value: e.target.value})}
              placeholder="0"
            />
          </FormControl>

          <Button
            leftIcon={<Plus size={16} />}
            onClick={addCall}
            colorScheme="blue"
            size="sm"
          >
            Add Call
          </Button>
        </VStack>

        {calls.length > 0 && (
          <Box overflowX="auto">
            <Table size="sm" mb={4}>
              <Thead>
                <Tr>
                  <Th>Target</Th>
                  <Th>Call Data</Th>
                  <Th>Value</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {calls.map((call, index) => (
                  <Tr key={index}>
                    <Td><Code fontSize="xs">{call.target.slice(0, 10)}...</Code></Td>
                    <Td><Code fontSize="xs">{call.callData.slice(0, 10)}...</Code></Td>
                    <Td>{call.value} ETH</Td>
                    <Td>
                      <IconButton
                        aria-label="Remove call"
                        icon={<Trash2 size={14} />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeCall(index)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Button
              leftIcon={<Play size={16} />}
              onClick={executeAggregatedCalls}
              colorScheme="green"
              isLoading={isProcessing}
              loadingText="Executing..."
              isDisabled={calls.length === 0}
            >
              Execute All Calls
            </Button>
          </Box>
        )}

        {executionResult && (
          <Box mt={4}>
            <Heading size="sm" mb={2}>Execution Result</Heading>
            <Code display="block" whiteSpace="pre" p={4} borderRadius="md" bg="gray.50">
              {executionResult}
            </Code>
          </Box>
        )}
      </Box>
    </VStack>
  );
};

export default MyEndpoint;