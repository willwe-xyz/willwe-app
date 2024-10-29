import React, { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Text,
  Divider,
  RadioGroup,
  Radio,
  Stack,
  FormErrorMessage,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Spinner,
  Link,
  useToast,
  Alert,
  AlertIcon,
  Progress
} from '@chakra-ui/react';
import {
  ExternalLink,
  Check,
  Copy,
  Info
} from 'lucide-react';
import { usePrivy } from "@privy-io/react-auth";
import { deployments, ABIs } from '../../config/contracts';

interface TokenOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: OperationParams) => Promise<void>;
  operation: string;
  isLoading: boolean;
  data?: {
    currentNode: { id: string; name: string };
    children?: Array<{ id: string; name: string }>;
  };
  nodeId: string;
  chainId?: string;
}

interface OperationParams {
  amount?: string;
  membraneId?: string;
  targetNodeId?: string;
}

interface MembraneMetadata {
  name: string;
  characteristics: Array<{
    title: string;
    link: string;
  }>;
  membershipConditions: Array<{
    tokenAddress: string;
    requiredBalance: string;
  }>;
}

interface MembraneRequirement {
  tokenAddress: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
}

interface Membrane {
  id: string;
  name: string;
}

export const TokenOperationModal: React.FC<TokenOperationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  operation,
  isLoading,
  data,
  nodeId,
  chainId: providedChainId
}) => {
  const { getEthersProvider, user } = usePrivy();
  const [amount, setAmount] = useState('');
  const [membraneId, setMembraneId] = useState('');
  const [membraneInputType, setMembraneInputType] = useState<'dropdown' | 'manual'>('dropdown');
  const [targetNodeId, setTargetNodeId] = useState('');
  const [membranes, setMembranes] = useState<Membrane[]>([]);
  const [membraneError, setMembraneError] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [requirements, setRequirements] = useState<MembraneRequirement[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const toast = useToast();
  const chainId = providedChainId || user?.wallet?.chainId?.toString();

  useEffect(() => {
    if (isOpen && nodeId) {
      setTargetNodeId(nodeId);
    }
  }, [isOpen, nodeId]);

  // Load membranes from localStorage
  useEffect(() => {
    if (operation === 'spawnWithMembrane') {
      const storedMembranes = localStorage.getItem('membranes');
      if (storedMembranes) {
        try {
          setMembranes(JSON.parse(storedMembranes));
        } catch (e) {
          console.error('Error parsing membranes from localStorage:', e);
        }
      }
    }
  }, [operation]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setMembraneId('');
      setTargetNodeId('');
      setMembraneError('');
      setIsValidating(false);
      setRequirements([]);
      setMembraneMetadata(null);
    }
  }, [isOpen]);

  const fetchTokenDetails = async (tokenAddress: string) => {
    try {
      const provider = await getEthersProvider();
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ABIs.IERC20,
        provider
      );
      
      const symbol = await tokenContract.symbol();
      return symbol;
    } catch (error) {
      console.error('Error fetching token details:', error);
      return 'Unknown';
    }
  };

  const loadMembraneRequirements = async (membraneId: string) => {
    setIsLoadingTokens(true);
    try {
      if (!chainId) throw new Error('Chain ID not available');
      
      const provider = await getEthersProvider();
      const cleanChainId = chainId?.includes('eip155:') ? 
        chainId.replace('eip155:', '') : 
        chainId;
      
      const membraneAddress = deployments.Membrane[cleanChainId];
      const membraneContract = new ethers.Contract(
        membraneAddress,
        ABIs.Membrane,
        provider
      );

      const membraneData = await membraneContract.getMembraneById(BigInt(membraneId));
      if (!membraneData) throw new Error('Membrane not found');

      // Fetch IPFS metadata
      if (membraneData.meta) {
        try {
          const response = await fetch(`https://underlying-tomato-locust.myfilebase.com/ipfs/${membraneData.meta}`);
          if (!response.ok) throw new Error('Failed to fetch IPFS data');
          const metadata = await response.json();
          setMembraneMetadata(metadata);
        } catch (error) {
          console.error('Error fetching IPFS metadata:', error);
        }
      }

      const requirements: MembraneRequirement[] = await Promise.all(
        membraneData.tokens.map(async (tokenAddress: string, index: number) => {
          const symbol = await fetchTokenDetails(tokenAddress);
          const balance = membraneData.balances[index];
          return {
            tokenAddress,
            symbol,
            requiredBalance: balance.toString(),
            formattedBalance: ethers.formatEther(balance)
          };
        })
      );

      setRequirements(requirements);
      setMembraneError('');
    } catch (error) {
      console.error('Error loading membrane requirements:', error);
      setMembraneError('Failed to load membrane requirements');
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const handleMembraneIdChange = useCallback(async (value: string) => {
    setMembraneId(value);
    if (membraneInputType === 'manual' && value) {
      loadMembraneRequirements(value);
    }
  }, [membraneInputType]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      toast({
        title: "Copied to clipboard",
        status: "success",
        duration: 2000,
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually",
        status: "error",
        duration: 2000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const params: OperationParams = {};
      
      if (['mint', 'burn', 'mintPath', 'burnPath'].includes(operation)) {
        params.amount = amount;
      }
      
      if (operation === 'spawnWithMembrane') {
        params.membraneId = membraneId;
      }
      
      if (['mintPath', 'burnPath'].includes(operation)) {
        params.targetNodeId = targetNodeId;
      }

      await onSubmit(params);
      onClose();
    } catch (error) {
      console.error('Operation failed:', error);
      setMembraneError(error.message || 'Operation failed');
      toast({
        title: "Operation Failed",
        description: error.message || "Failed to execute operation",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {operation === 'spawn' ? 'Spawn Sub-Node' : 
           operation === 'spawnWithMembrane' ? 'Spawn With Membrane' :
           operation.charAt(0).toUpperCase() + operation.slice(1)}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={6}>
              {/* Amount Input for mint/burn operations */}
              {['mint', 'burn', 'mintPath', 'burnPath'].includes(operation) && (
                <FormControl isRequired>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    type="number"
                    step="0.000000000000000001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </FormControl>
              )}

              {/* Membrane Input for spawnWithMembrane */}
              {operation === 'spawnWithMembrane' && (
                <>
                  <FormControl>
                    <FormLabel>Select Input Method</FormLabel>
                    <RadioGroup
                      onChange={(value) => {
                        setMembraneInputType(value as 'dropdown' | 'manual');
                        setMembraneError('');
                        setMembraneId('');
                        setRequirements([]);
                      }}
                      value={membraneInputType}
                    >
                      <Stack direction="row">
                        <Radio value="dropdown">Select from List</Radio>
                        <Radio value="manual">Enter Membrane ID</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!membraneError}>
                    <FormLabel>
                      {membraneInputType === 'dropdown' ? 'Select Membrane' : 'Enter Membrane ID'}
                    </FormLabel>
                    {membraneInputType === 'dropdown' ? (
                      <Select
                        value={membraneId}
                        onChange={(e) => handleMembraneIdChange(e.target.value)}
                        placeholder="Select membrane"
                      >
                        {membranes.map(membrane => (
                          <option key={membrane.id} value={membrane.id}>
                            {membrane.name} ({membrane.id})
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        value={membraneId}
                        onChange={(e) => handleMembraneIdChange(e.target.value)}
                        placeholder="Enter membrane ID"
                      />
                    )}
                    {membraneError && (
                      <FormErrorMessage>{membraneError}</FormErrorMessage>
                    )}
                  </FormControl>

                  {isLoadingTokens ? (
                    <Box p={8} textAlign="center">
                      <Spinner size="md" />
                      <Text mt={2}>Loading membrane requirements...</Text>
                    </Box>
                  ) : requirements.length > 0 && (
                    <Box w="100%" borderRadius="md" borderWidth="1px" p={4}>
                      {membraneMetadata?.name && (
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                          {membraneMetadata.name}
                        </Text>
                      )}

                      {membraneMetadata?.characteristics && membraneMetadata.characteristics.length > 0 && (
                        <Box mb={4}>
                          <Text fontWeight="semibold" mb={2}>Characteristics:</Text>
                          <VStack align="stretch" spacing={2}>
                            {membraneMetadata.characteristics.map((char, idx) => (
                              <HStack key={idx} justify="space-between">
                                <Text>{char.title}</Text>
                                <Link
                                  href={char.link}
                                  isExternal
                                  color="blue.500"
                                  display="flex"
                                  alignItems="center"
                                >
                                  View <ExternalLink size={14} className="ml-1" />
                                </Link>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      <Text fontWeight="semibold" mb={4}>Membership Requirements</Text>
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Token</Th>
                            <Th isNumeric>Required Amount</Th>
                            <Th></Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {requirements.map((req, idx) => (
                            <Tr key={idx}>
                              <Td>
                                <HStack spacing={2}>
                                  <Text>{req.symbol}</Text>
                                  <Badge colorScheme="gray" fontSize="xs">
                                    {`${req.tokenAddress.slice(0, 6)}...${req.tokenAddress.slice(-4)}`}
                                  </Badge>
                                </HStack>
                              </Td>
                              <Td isNumeric>{req.formattedBalance}</Td>
                              <Td>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(req.tokenAddress)}
                                >
                                  <Copy size={14} />
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </>
              )}

              {/* Target Node Selection for path operations */}
              {['mintPath', 'burnPath'].includes(operation) && data && (
                <FormControl isRequired>
                  <FormLabel>Target Node</FormLabel>
                  <Select
                    value={targetNodeId}
                    onChange={(e) => setTargetNodeId(e.target.value)}
                    placeholder="Select target node"
                  >
                    <option value={nodeId}>
                      Current Node ({nodeId.slice(-6)})
                    </option>
                    
                    {data.children && data.children.length > 0 && (
                      <>
                        <Divider my={2} />
                        {data.children.map(child => (
                          <option key={child.id} value={child.id}>
                            Child: {child.name || `Node ${child.id.slice(-6)}`}
                          </option>
                        ))}
                      </>
                    )}
                  </Select>
                </FormControl>
              )}

              {/* Path Operations Info */}
              {['mintPath', 'burnPath'].includes(operation) && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    This operation will affect all nodes along the path from the current node to the target node.
                  </Text>
                </Alert>
              )}

              {/* Operation Summary */}
              {operation === 'spawnWithMembrane' && membraneMetadata && (
                <Box 
                  p={4} 
                  bg="gray.50" 
                  borderRadius="md" 
                  w="100%"
                >
                  <VStack align="start" spacing={3}>
                    <HStack justify="space-between" w="100%">
                      <Text fontWeight="semibold">Operation Summary:</Text>
                      {membraneId && (
                        <Badge colorScheme="purple">
                          ID: {membraneId.slice(0, 8)}...{membraneId.slice(-6)}
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="sm">
                      • Creating sub-node with membrane restrictions
                    </Text>
                    <Text fontSize="sm">
                      • Token requirements: {requirements.length}
                    </Text>
                    {membraneMetadata.characteristics?.length > 0 && (
                      <Text fontSize="sm">
                        • Characteristics: {membraneMetadata.characteristics.length}
                      </Text>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Loading State */}
              {(isValidating || isLoadingTokens) && (
                <Box w="100%">
                  <Progress 
                    size="xs" 
                    isIndeterminate 
                    colorScheme="purple" 
                    borderRadius="full"
                  />
                  <Text 
                    mt={2} 
                    fontSize="sm" 
                    color="gray.600" 
                    textAlign="center"
                  >
                    {isValidating ? 'Validating membrane...' : 'Loading token details...'}
                  </Text>
                </Box>
              )}

              {/* Error Display */}
              {membraneError && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">{membraneError}</Text>
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onClose}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              colorScheme={operation.includes('burn') ? 'red' : 'purple'}
              isLoading={isLoading || isLoadingTokens || isValidating}
              loadingText={
                isLoadingTokens ? 'Loading tokens...' :
                isValidating ? 'Validating...' :
                'Processing...'
              }
              isDisabled={
                (operation === 'spawnWithMembrane' && (!!membraneError || isValidating || !membraneId)) ||
                (['mint', 'burn', 'mintPath', 'burnPath'].includes(operation) && !amount) ||
                (['mintPath', 'burnPath'].includes(operation) && !targetNodeId) ||
                isLoading ||
                isLoadingTokens
              }
            >
              {operation === 'spawn' ? 'Spawn Sub-Node' : 
               operation === 'spawnWithMembrane' ? 'Spawn With Membrane' :
               operation.charAt(0).toUpperCase() + operation.slice(1)}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default TokenOperationModal;