import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Box,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Text,
  Badge,
  InputGroup,
  InputRightElement,
  Tooltip,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from '@chakra-ui/react';
import {
  Shield,
  Info,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import { usePrivy } from "@privy-io/react-auth";
import { RequirementsTable } from './RequirementsTable';
import { StatusIndicator } from './StatusIndicator';
import { useContractOperations } from '../../hooks/useContractOperations';
import { useTransactionContext } from '../../contexts/TransactionContext';
import { MembraneMetadata, MembraneRequirement } from '../../types/chainData';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface TokenOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: OperationParams) => Promise<void>;
  operation: string;
  nodeId: string;
  chainId: string;
}

interface OperationParams {
  membraneId?: string;
}

export const TokenOperationModal: React.FC<TokenOperationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  operation,
  nodeId,
  chainId,
}) => {
  // State
  const [membraneId, setMembraneId] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isValidInput, setIsValidInput] = useState(false);
  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [requirements, setRequirements] = useState<MembraneRequirement[]>([]);

  // Hooks
  const { isTransacting } = useTransactionContext();
  const { getMembraneData, getTokenInfo } = useContractOperations(chainId);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setMembraneId('');
      setMembraneMetadata(null);
      setRequirements([]);
      setInputError(null);
      setIsValidInput(false);
    }
  }, [isOpen]);

  // Validate membrane ID format
  const validateMembraneIdFormat = useCallback((value: string) => {
    setInputError(null);
    setIsValidInput(false);

    if (!value) {
      setInputError('Membrane ID is required');
      return false;
    }

    try {
      BigInt(value);
      setIsValidInput(true);
      return true;
    } catch {
      setInputError('Invalid numeric format');
      return false;
    }
  }, []);

  // Fetch membrane data
  const fetchMembraneData = useCallback(async (membraneId: string) => {
    try {
      // Get membrane data
      const { membrane, metadata } = await getMembraneData(membraneId);
      if (!membrane) throw new Error('Membrane not found');

      // Set metadata
      setMembraneMetadata(metadata);

      // Get token requirements
      const requirementsData = await Promise.all(
        membrane.tokens.map(async (tokenAddress: string, index: number) => {
          const tokenInfo = await getTokenInfo(tokenAddress);
          return {
            tokenAddress,
            symbol: tokenInfo.symbol,
            requiredBalance: membrane.balances[index].toString(),
            formattedBalance: tokenInfo.formatBalance(membrane.balances[index])
          };
        })
      );

      setRequirements(requirementsData);
      setInputError(null);

    } catch (error) {
      console.error('Error fetching membrane data:', error);
      setInputError(error instanceof Error ? error.message : 'Failed to fetch membrane data');
      setMembraneMetadata(null);
      setRequirements([]);
    }
  }, [getMembraneData, getTokenInfo]);

  // Handle membrane ID changes
  const handleMembraneIdChange = useCallback((value: string) => {
    setMembraneId(value);
    if (validateMembraneIdFormat(value)) {
      fetchMembraneData(value);
    }
  }, [validateMembraneIdFormat, fetchMembraneData]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidInput || !membraneId) {
      setInputError('Please enter a valid membrane ID');
      return;
    }

    await onSubmit({ membraneId });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <Box maxH="85vh" overflowY="auto" p={6}>
          <VStack spacing={6} align="stretch" width="100%">
            {/* Title Section */}
            <Box borderBottomWidth="1px" pb={4}>
              <Text fontSize="2xl" fontWeight="bold">Configure Membrane</Text>
              <Text fontSize="sm" color="gray.600">Set membrane requirements for node access</Text>
            </Box>

            {/* Input Section */}
            <FormControl isRequired isInvalid={!!inputError}>
              <FormLabel>
                <HStack>
                  <Text>Membrane ID</Text>
                  <Tooltip label="Enter a numeric membrane identifier">
                    <span><Info size={14} /></span>
                  </Tooltip>
                </HStack>
              </FormLabel>
              
              <InputGroup>
                <Input
                  value={membraneId}
                  onChange={(e) => handleMembraneIdChange(e.target.value)}
                  placeholder="Enter membrane ID"
                  isDisabled={isTransacting}
                  pattern="\d*"
                  inputMode="numeric"
                />
                <InputRightElement>
                  {membraneId && (
                    isValidInput ? 
                      <CheckCircle size={18} color="green" /> : 
                      <XCircle size={18} color="red" />
                  )}
                </InputRightElement>
              </InputGroup>

              {inputError && (
                <Alert status="error" mt={2} size="sm">
                  <AlertIcon />
                  {inputError}
                </Alert>
              )}
            </FormControl>

            {/* Membrane Data Display */}
            {membraneMetadata && !inputError && (
              <VStack spacing={4} align="stretch">
                <Card variant="outline" bg="purple.50" mb={4}>
                  <CardHeader pb={2}>
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="bold">{membraneMetadata.name}</Text>
                      <Badge colorScheme="purple">ID: {membraneId}</Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <RequirementsTable
                      requirements={requirements}
                      membraneMetadata={membraneMetadata}
                    />
                  </CardBody>
                </Card>
              </VStack>
            )}

            {/* Action Buttons */}
            <Box 
              borderTopWidth="1px" 
              pt={4} 
              mt={4}
              background="white"
            >
              <HStack justify="flex-end" spacing={3}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="purple"
                  onClick={handleSubmit}
                  isLoading={isTransacting}
                  loadingText="Processing..."
                  isDisabled={!!inputError || !membraneMetadata || !isValidInput}
                  leftIcon={<Shield size={16} />}
                >
                  Apply Membrane
                </Button>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default TokenOperationModal;