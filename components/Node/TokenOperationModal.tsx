import React, { useState, useCallback, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { ethers } from 'ethers';
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
  currentNodeId: string;
  chainId: string;
}

interface OperationParams {
  amount?: string;
  membraneId?: string;
  targetNodeId?: string;
}

export const TokenOperationModal: React.FC<TokenOperationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  operation,
  isLoading,
  data,
  currentNodeId,
  chainId
}) => {
  const { getEthersProvider } = usePrivy();
  const [amount, setAmount] = useState('');
  const [membraneId, setMembraneId] = useState('');
  const [membraneInputType, setMembraneInputType] = useState<'dropdown' | 'manual'>('dropdown');
  const [targetNodeId, setTargetNodeId] = useState('');
  const [membranes, setMembranes] = useState<Array<{ id: string; name: string }>>([]);
  const [membraneError, setMembraneError] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);

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
    }
  }, [isOpen]);

  // Validate membrane ID
  const validateMembraneId = useCallback(async (id: string): Promise<boolean> => {
    if (!id) {
      setMembraneError('Membrane ID is required');
      return false;
    }

    setIsValidating(true);
    setMembraneError('');

    try {
      // Convert to number and validate
      const membraneIdNum = parseInt(id);
      if (isNaN(membraneIdNum)) {
        setMembraneError('Invalid membrane ID format');
        return false;
      }

      const provider = await getEthersProvider();
      if (!provider) {
        throw new Error('Provider not available');
      }

      const cleanChainId = chainId.replace('eip155:', '');
      const membraneAddress = deployments.Membrane[cleanChainId];
      
      if (!membraneAddress) {
        throw new Error(`No membrane contract found for chain ${chainId}`);
      }

      const membraneContract = new ethers.Contract(
        membraneAddress,
        ABIs.Membrane,
        provider
      );

      console.log('Validating membrane:', id, 'at address:', membraneAddress);

      // Try to fetch the membrane data
      const membraneData = await membraneContract.getMembraneById(membraneIdNum);
      console.log('Membrane data:', membraneData);

      // Check if membrane data is valid (adjust based on your contract's return structure)
      if (!membraneData || !membraneData.tokens) {
        setMembraneError('Invalid membrane or membrane does not exist');
        return false;
      }

      setMembraneError('');
      return true;
    } catch (error) {
      console.error('Membrane validation error:', error);
      setMembraneError(error.message || 'Failed to validate membrane');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [chainId, getEthersProvider]);

  // Handle membrane ID change with debounce
  const handleMembraneIdChange = useCallback(async (value: string) => {
    setMembraneId(value);
    if (membraneInputType === 'manual' && value) {
      setMembraneError('');
      // Add a small delay before validation to avoid too many calls
      setTimeout(async () => {
        await validateMembraneId(value);
      }, 500);
    }
  }, [membraneInputType, validateMembraneId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const params: OperationParams = {};
      
      if (['mint', 'burn', 'mintPath', 'burnPath'].includes(operation)) {
        params.amount = amount;
      }
      
      if (operation === 'spawnWithMembrane') {
        if (membraneInputType === 'manual') {
          const isValid = await validateMembraneId(membraneId);
          if (!isValid) return;
        }
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
    }
  }, [operation, amount, membraneId, targetNodeId, membraneInputType, validateMembraneId, onSubmit, onClose]);

  // ... rest of your component remains the same ...

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
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
            <VStack spacing={4}>
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

              {/* Membrane Input for spawn operations */}
              {operation === 'spawnWithMembrane' && (
                <>
                  <FormControl>
                    <FormLabel>Select Input Method</FormLabel>
                    <RadioGroup
                      onChange={(value) => {
                        setMembraneInputType(value as 'dropdown' | 'manual');
                        setMembraneError('');
                        setMembraneId('');
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
                        onChange={(e) => setMembraneId(e.target.value)}
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
                        type="number"
                      />
                    )}
                    {membraneError && (
                      <FormErrorMessage>{membraneError}</FormErrorMessage>
                    )}
                  </FormControl>
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
                    <option value={currentNodeId}>
                      Current Node ({currentNodeId.slice(-6)})
                    </option>
                    
                    {data.children && data.children.length > 0 && (
                      <>
                        <Divider my={2} />
                        {data.children.map(child => (
                          <option key={child.id} value={child.id}>
                            Child: {child.name}
                          </option>
                        ))}
                      </>
                    )}
                  </Select>
                </FormControl>
              )}

              {/* Info text for path operations */}
              {['mintPath', 'burnPath'].includes(operation) && (
                <Text fontSize="sm" color="gray.600">
                  This operation will affect all nodes along the path.
                </Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme={operation.includes('burn') ? 'red' : 'green'}
              isLoading={isLoading || isValidating}
              isDisabled={
                (operation === 'spawnWithMembrane' && (!!membraneError || isValidating)) ||
                (['mint', 'burn', 'mintPath', 'burnPath'].includes(operation) && !amount) ||
                (['mintPath', 'burnPath'].includes(operation) && !targetNodeId)
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