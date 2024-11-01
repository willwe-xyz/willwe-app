import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  useToast,
  RadioGroup,
  Radio,
  Stack,
  Text,
  Box
} from '@chakra-ui/react';
import { ethers } from 'ethers';

interface OperationParams {
  amount?: string;
  membraneId?: string;
  targetNodeId?: string;
}

interface TokenOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: OperationParams) => Promise<void>;
  operation: string;
  isLoading: boolean;
  nodeId: string;
  chainId?: string;
}

export const TokenOperationModal: React.FC<TokenOperationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  operation,
  isLoading,
  nodeId,
  chainId
}) => {
  // State
  const [amount, setAmount] = useState('');
  const [membraneId, setMembraneId] = useState('');
  const [targetNodeId, setTargetNodeId] = useState('');
  const [membraneInputType, setMembraneInputType] = useState<'manual' | 'dropdown'>('manual');
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setMembraneId('');
      setTargetNodeId('');
      setError(null);
    }
  }, [isOpen]);

  // Get operation title
  const getOperationTitle = useCallback(() => {
    switch (operation) {
      case 'mint':
        return 'Mint Tokens';
      case 'burn':
        return 'Burn Tokens';
      case 'mintPath':
        return 'Mint Along Path';
      case 'burnPath':
        return 'Burn Along Path';
      case 'spawn':
        return 'Spawn Sub-Node';
      case 'spawnWithMembrane':
        return 'Spawn With Membrane';
      case 'mintMembership':
        return 'Mint Membership';
      default:
        return 'Perform Operation';
    }
  }, [operation]);

  // Validate form based on operation
  const validateForm = useCallback(() => {
    if (['mint', 'burn', 'mintPath', 'burnPath'].includes(operation)) {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return 'Please enter a valid amount';
      }
    }

    if (operation === 'spawnWithMembrane' && !membraneId) {
      return 'Please enter a membrane ID';
    }

    if (['mintPath', 'burnPath'].includes(operation) && !targetNodeId) {
      return 'Please select a target node';
    }

    return null;
  }, [operation, amount, membraneId, targetNodeId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      const params: OperationParams = {};

      // Add parameters based on operation
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

    } catch (err) {
      console.error('Operation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: 'Operation Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{getOperationTitle()}</ModalHeader>
          
          <ModalBody>
            <VStack spacing={4}>
              {/* Amount Input */}
              {['mint', 'burn', 'mintPath', 'burnPath'].includes(operation) && (
                <FormControl isRequired>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    step="any"
                    placeholder="Enter amount"
                  />
                </FormControl>
              )}

              {/* Membrane Input */}
              {operation === 'spawnWithMembrane' && (
                <>
                  <FormControl>
                    <FormLabel>Input Method</FormLabel>
                    <RadioGroup
                      onChange={(value: 'manual' | 'dropdown') => setMembraneInputType(value)}
                      value={membraneInputType}
                    >
                      <Stack direction="row">
                        <Radio value="manual">Enter ID</Radio>
                        <Radio value="dropdown" isDisabled>Select from List</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>
                      {membraneInputType === 'manual' ? 'Membrane ID' : 'Select Membrane'}
                    </FormLabel>
                    <Input
                      value={membraneId}
                      onChange={(e) => setMembraneId(e.target.value)}
                      placeholder="Enter membrane ID"
                    />
                  </FormControl>
                </>
              )}

              {/* Target Node Input */}
              {['mintPath', 'burnPath'].includes(operation) && (
                <FormControl isRequired>
                  <FormLabel>Target Node</FormLabel>
                  <Input
                    value={targetNodeId}
                    onChange={(e) => setTargetNodeId(e.target.value)}
                    placeholder="Enter target node ID"
                  />
                </FormControl>
              )}

              {error && (
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              type="submit"
              isLoading={isLoading}
              loadingText="Processing..."
              isDisabled={!!error || isLoading}
            >
              Confirm
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default TokenOperationModal;