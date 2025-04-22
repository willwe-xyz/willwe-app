import React, { useState, useEffect } from 'react';
import { ethers, Provider } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../../contexts/TransactionContext';
import { deployments } from '../../config/deployments';
import { ABIs, getRPCUrl } from '../../config/contracts';
import { NodeState } from '../../types/chainData';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Input,
  Heading,
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
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
  Select,
  FormHelperText,
} from '@chakra-ui/react';
import { addressToNodeId, formatBalance, nodeIdToAddress } from '../../utils/formatters';
import { Plus, Trash2, Play, Copy, AlertCircle } from 'lucide-react';
import { RefreshCw, Wallet } from 'lucide-react';
import { getEndpointActions, EndpointActionConfig } from '../../config/endpointActions';

interface Call {
  target: string;
  callData: string;
  value: string;
}

interface CurrentCallState extends Call {
  actionType?: string;
  params?: Record<string, any>;
}

interface MyEndpointProps {
  nodeData: NodeState;
  chainId: string;
  userAddress: string;
  onSuccess?: () => void;
}

export const MyEndpoint: React.FC<MyEndpointProps> = ({ 
  nodeData, 
  chainId,
  userAddress,
  onSuccess 
}) => {
  const { user } = usePrivy();
  const [calls, setCalls] = useState<Call[]>([]);
  const [currentCall, setCurrentCall] = useState<CurrentCallState>({
    target: '',
    callData: '',
    value: '0',
    actionType: 'tokenTransfer',
    params: {}
  });
  const [executionResult, setExecutionResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [rootTokenBalance, setRootTokenBalance] = useState<string>('0');
  const [isRedistributing, setIsRedistributing] = useState(false);
  const [endpointNodeData, setEndpointNodeData] = useState<NodeState | null>(null);
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const toast = useToast();
  const [rootTokenSymbol, setRootTokenSymbol] = useState<string>('');

  // Get endpoint address and membership status from nodeData
  const endpointAddress = nodeData.basicInfo[10];  // endpoint address is at index 10
  const endpointId = React.useMemo(() => {
    try {
      // Check if endpointAddress is "0" or empty
      if (!endpointAddress || endpointAddress === "0" || endpointAddress === ethers.ZeroAddress) {
        return null;
      }
      // Validate that it's a proper Ethereum address
      if (!/^0x[a-fA-F0-9]{40}$/.test(endpointAddress)) {
        console.warn('Invalid endpoint address format:', endpointAddress);
        return null;
      }
      return addressToNodeId(endpointAddress);
    } catch (error) {
      console.error('Error converting endpoint address to node ID:', error);
      return null;
    }
  }, [endpointAddress]);

  const isMember = nodeData.membersOfNode.some(
    member => member.toLowerCase() === user?.wallet?.address?.toLowerCase()
  );
  
  // Memoize the provider to prevent recreation on every render
  const readProvider = React.useMemo(() => {
    try {
      return new ethers.JsonRpcProvider(getRPCUrl(chainId));
    } catch (error) {
      console.error('Failed to create provider:', error);
      return null;
    }
  }, [chainId]);

  const rootTokenAddress = nodeData.rootPath[0] ? nodeIdToAddress(nodeData.rootPath[0]) : null;

  const endpointBalance = Number(ethers.formatEther(nodeData.basicInfo[2])).toFixed(4); 

  useEffect(() => {
    const fetchRootTokenBalance = async () => {
      if (!endpointAddress || endpointAddress === "0" || !rootTokenAddress || !readProvider) {
        setRootTokenBalance('0');
        return;
      }
      
      try {
        const tokenContract = new ethers.Contract(
          rootTokenAddress,
          ABIs.IERC20,
          readProvider
        );
        
        const balance = await tokenContract.balanceOf(endpointAddress);
        setRootTokenBalance(balance.toString());
      } catch (error) {
        console.error('Error fetching root token balance:', error);
        setRootTokenBalance('0');
      }
    };

    fetchRootTokenBalance();
  }, [endpointAddress, rootTokenAddress, readProvider]);

  useEffect(() => {
    const fetchEndpointData = async () => {
      if (!endpointAddress || endpointAddress === "0" || !endpointId || !readProvider) return;
      
      try {
        const willWeContract = new ethers.Contract(
          deployments.WillWe[chainId.replace('eip155:', '')],
          ABIs.WillWe,
          readProvider
        );

        const data = await willWeContract.getNodeData(endpointId, userAddress);
        setEndpointNodeData(data);
      } catch (error) {
        console.error('Error fetching endpoint data:', error);
      }
    };

    fetchEndpointData();
  }, [endpointAddress, endpointId, readProvider, userAddress]);

  useEffect(() => {
    const fetchRootTokenSymbol = async () => {
      if (!rootTokenAddress || !readProvider) return;
      
      try {
        const tokenContract = new ethers.Contract(
          rootTokenAddress,
          ABIs.IERC20,
          readProvider
        );
        
        const symbol = await tokenContract.symbol();
        setRootTokenSymbol(symbol);
      } catch (error) {
        console.error('Error fetching root token symbol:', error);
        setRootTokenSymbol('tokens');
      }
    };

    fetchRootTokenSymbol();
  }, [rootTokenAddress, readProvider]);

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
          
          const contract = new ethers.Contract(
            deployments.WillWe[chainId.replace('eip155:', '')],
            ABIs.WillWe,
            // @ts-ignore
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

  const handleBurnPath = async () => {
    if (isBurning || !rootTokenBalance || !endpointNodeData) return;
    setIsBurning(true);

    try {
      const provider = getEthersProvider();
      const signer = provider.getSigner();
      const cleanChainId = chainId.replace('eip155:', '');
      
      const proxyContract = new ethers.Contract(
        endpointAddress,
        ABIs.PowerProxy,
        // @ts-ignore
        signer
      );

      const willWeContract = new ethers.Contract(
        deployments.WillWe[cleanChainId],
        ABIs.WillWe,
        readProvider
      );

      // Use endpoint's node data for burn path
      const burnCalldata = willWeContract.interface.encodeFunctionData('burnPath', [
        nodeData.basicInfo[0],
        endpointNodeData.basicInfo[5]
      ]);

      const calls = [{
        target: deployments.WillWe[cleanChainId],
        callData: burnCalldata,
        value: '0'
      }];

      await executeTransaction(
        chainId,
        async () => {
          return proxyContract.tryAggregate(true, calls);
        },
        {
          successMessage: 'Successfully burned tokens through path',
          onSuccess: () => {
            setRootTokenBalance('0');
          }
        }
      );
    } catch (error) {
      console.error('Failed to burn tokens:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to burn tokens',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsBurning(false);
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


  const handleRedistribute = async () => {
    if (isRedistributing || !endpointNodeData) return;
    setIsRedistributing(true);
  
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const contractAddress = deployments.WillWe[cleanChainId];
      
      if (!contractAddress) {
        throw new Error(`No contract deployment found for chain ${cleanChainId}`);
      }
  
      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            ABIs.WillWe,
            signer as unknown as ethers.ContractRunner
          );
  
          return contract.redistributePath(endpointId, { gasLimit: 500000 });
        },
        {
          onSuccess: () => {
            toast({
              title: 'Redistribution complete',
              description: 'Value has been redistributed from parent node to endpoint',
              status: 'success',
              duration: 5000,
            });
          }
        }
      );
    } catch (error) {
      console.error('Failed to redistribute:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to redistribute value',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsRedistributing(false);
    }
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
            // @ts-ignore
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
          onSuccess: () => {
            setExecutionResult('Execution successful');
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
  if (!endpointAddress || endpointAddress === "0" || endpointAddress === ethers.ZeroAddress) {
    return (
      <VStack spacing={6} align="stretch">
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="medium">You don't have an endpoint yet.</Text>
            <Text fontSize="sm">
              Create a personal endpoint in the context of this node.
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

      <HStack spacing={8} justify="center">
        <Stat>
          <StatLabel>Endpoint Budget</StatLabel>
          <StatNumber>
            {endpointNodeData ? Number(ethers.formatEther(endpointNodeData.basicInfo[5])).toFixed(4) : '0'} {rootTokenSymbol}
          </StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Endpoint Balance</StatLabel>
          <StatNumber>{Number(formatBalance(rootTokenBalance)).toFixed(4)} {rootTokenSymbol}</StatNumber>
        </Stat>
      </HStack>

      <HStack justify="center">
        <Button
          leftIcon={<RefreshCw size={16} />}
          onClick={handleRedistribute}
          isLoading={isRedistributing}
          loadingText="Redistributing..."
          colorScheme="purple"
          size="md"
        >
          Redistribute to Endpoint
        </Button>
        
        {endpointNodeData && (
          <Tooltip label={parseFloat(ethers.formatEther(endpointNodeData.basicInfo[5])) <= 0 ? "No budget available to burn" : ""}>
            <Button
              leftIcon={<Wallet size={16} />}
              onClick={handleBurnPath}
              isLoading={isBurning}
              loadingText="Burning..."
              colorScheme="red"
              size="md"
              isDisabled={parseFloat(ethers.formatEther(endpointNodeData.basicInfo[5])) <= 0}
            >
              Withdraw All to Endpoint
            </Button>
          </Tooltip>
        )}
      </HStack>

      <Divider />

      <Box>
        <Heading size="sm" mb={4}>Execute Multiple Calls</Heading>
        
        <VStack spacing={4} mb={6}>
          <FormControl>
            <FormLabel>Action Type</FormLabel>
            <Select 
              value={currentCall.actionType || 'tokenTransfer'}
              onChange={(e) => {
                setCurrentCall({
                  target: '',
                  callData: '',
                  value: '0',
                  actionType: e.target.value,
                  params: {}
                });
              }}
            >
              {rootTokenAddress && getEndpointActions(rootTokenAddress, rootTokenSymbol).map(action => (
                <option key={action.id} value={action.id}>
                  {action.label}
                </option>
              ))}
            </Select>
            <FormHelperText>
              {currentCall.actionType && 
                getEndpointActions(rootTokenAddress || '', rootTokenSymbol)[
                  getEndpointActions(rootTokenAddress || '', rootTokenSymbol).findIndex(a => a.id === currentCall.actionType)
                ]?.description
              }
            </FormHelperText>
          </FormControl>

          {currentCall.actionType && getEndpointActions(rootTokenAddress || '', rootTokenSymbol).map(action => {
            if (action.id !== currentCall.actionType) return null;
            
            return (
              <React.Fragment key={action.id}>
                {action.fields.map(field => (
                  <FormControl key={field.name} isRequired={field.required}>
                    <FormLabel>{field.label}</FormLabel>
                    <Input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={currentCall.params?.[field.name] || ''}
                      onChange={(e) => setCurrentCall({
                        ...currentCall,
                        params: {
                          ...currentCall.params,
                          [field.name]: e.target.value
                        }
                      })}
                      placeholder={field.placeholder}
                    />
                  </FormControl>
                ))}
              </React.Fragment>
            );
          })}

          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => {
              const action = getEndpointActions(rootTokenAddress || '', rootTokenSymbol).find(
                a => a.id === currentCall.actionType
              );
              if (!action) return;
              
              const callData = action.getCallData(currentCall.params || {}, rootTokenAddress || '');
              setCalls([...calls, callData]);
              setCurrentCall({
                target: '',
                callData: '',
                value: '0',
                actionType: currentCall.actionType,
                params: {}
              });
            }}
            colorScheme="blue"
            size="sm"
            isDisabled={!currentCall.actionType}
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