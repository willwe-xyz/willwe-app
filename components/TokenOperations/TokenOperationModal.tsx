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
  Alert,
  AlertIcon,
  Progress,
  useToast,
} from '@chakra-ui/react';
import { usePrivy } from "@privy-io/react-auth";
import { deployments, ABIs } from '../../config/contracts';
import { OperationConfirmation } from './components/OperationConfirmation';

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

export const TokenOperationModal: React.FC<TokenOperationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  operation,
  isLoading,
  data,
  nodeId,
  chainId: providedChainId,
}) => {
  // State
  const [amount, setAmount] = useState('');
  const [membraneId, setMembraneId] = useState('');
  const [membraneInputType, setMembraneInputType] = useState<'dropdown' | 'manual'>('manual');
  const [targetNodeId, setTargetNodeId] = useState('');
  const [membranes, setMembranes] = useState<Array<{ id: string; name: string }>>([]);
  const [membraneError, setMembraneError] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [requirements, setRequirements] = useState<MembraneRequirement[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [ipfsCid, setIpfsCid] = useState<string>('');

  const { user, getEthersProvider } = usePrivy();
  const toast = useToast();
  const chainId = providedChainId || user?.wallet?.chainId?.toString();

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

  // Token details fetching
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

  // Load membrane requirements
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
          setIpfsCid(membraneData.meta);
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
      setMembraneMetadata(null);
      setRequirements([]);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // Handle membrane ID changes
  const handleMembraneIdChange = useCallback(async (value: string) => {
    setMembraneId(value);
    if (membraneInputType === 'manual' && value) {
      loadMembraneRequirements(value);
    }
  }, [membraneInputType]);

  // Form submission
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
      setMembraneError(error instanceof Error ? error.message : 'Operation failed');
      toast({
        title: "Operation Failed",
        description: error instanceof Error ? error.message : "Failed to execute operation",
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
            <VStack spacing={6} align="stretch">
              {/* Input Method Selection */}
              <FormControl>
                <FormLabel>Select Input Method</FormLabel>
                <RadioGroup
                  onChange={(value) => setMembraneInputType(value as 'dropdown' | 'manual')}
                  value={membraneInputType}
                >
                  <Stack direction="row">
                    <Radio value="dropdown">Select from List</Radio>
                    <Radio value="manual">Enter Membrane ID</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Membrane ID Input */}
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

              {/* Loading State */}
              {isLoadingTokens && (
                <Box p={4} textAlign="center">
                  <Progress size="xs" isIndeterminate colorScheme="purple" />
                  <Text mt={2}>Loading membrane requirements...</Text>
                </Box>
              )}

              {/* Operation Confirmation */}
              {membraneMetadata && (
                <OperationConfirmation
                  membraneMetadata={membraneMetadata}
                  membraneId={membraneId}
                  requirementsCount={requirements.length}
                  ipfsCid={ipfsCid}
                />
              )}

              {/* Path Operation Info */}
              {['mintPath', 'burnPath'].includes(operation) && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    This operation will affect all nodes along the path from the current node to the target node.
                  </Text>
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