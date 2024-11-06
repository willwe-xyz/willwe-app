import React, { useState, useCallback, useEffect } from 'react';
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
  Progress,
  Text,
  Badge,
  InputGroup,
  InputRightElement,
  Tooltip,
  HStack,
  Link,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useToast,
} from '@chakra-ui/react';
import {
  Shield,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';
import { ethers } from 'ethers';
import { usePrivy } from "@privy-io/react-auth";
import { RequirementsTable } from './RequirementsTable';
import { OperationConfirmation } from './OperationConfirmation';
import { StatusIndicator } from './StatusIndicator';
import { deployments, ABIs } from '../../config/contracts';
import { NodeState, MembraneMetadata, MembraneRequirement } from '../../types/chainData';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface TokenOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: OperationParams) => Promise<void>;
  operation: string;
  isLoading: boolean;
  nodeId: string;
  chainId: string;
  node: NodeState;
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
  nodeId,
  chainId,
  node,
}) => {
  const [membraneId, setMembraneId] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isValidInput, setIsValidInput] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [requirements, setRequirements] = useState<MembraneRequirement[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { getEthersProvider } = usePrivy();
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) {
      setMembraneId('');
      setMembraneMetadata(null);
      setRequirements([]);
      setError(null);
      setInputError(null);
      setIsValidInput(false);
    }
  }, [isOpen]);

  const validateMembraneIdFormat = useCallback((value: string) => {
    setInputError(null);
    setIsValidInput(false);

    if (!value) {
      setInputError('Membrane ID is required');
      return false;
    }

    try {
      ethers.getBigInt(value);
      setIsValidInput(true);
      return true;
    } catch (error) {
      setInputError('Invalid numeric format');
      return false;
    }
  }, []);

  const fetchMembraneMetadata = useCallback(async (membraneId: string) => {
    try {
      const provider = await getEthersProvider();
      const contract = new ethers.Contract(
        deployments.Membrane[chainId.replace('eip155:', '')],
        ABIs.Membrane,
        provider
      );

      const membrane = await contract.getMembraneById(membraneId);
      if (!membrane) throw new Error('Membrane not found');

      const response = await fetch(`${IPFS_GATEWAY}${membrane.meta}`);
      if (!response.ok) throw new Error('Failed to fetch membrane metadata');
      
      const metadata = await response.json();
      setMembraneMetadata(metadata);

      setIsLoadingTokens(true);
      const requirements = await Promise.all(
        membrane.tokens.map(async (tokenAddress: string, index: number) => {
          const tokenContract = new ethers.Contract(
            tokenAddress,
            ['function symbol() view returns (string)', 'function decimals() view returns (uint8)'],
            provider
          );

          const [symbol, decimals] = await Promise.all([
            tokenContract.symbol(),
            tokenContract.decimals()
          ]);

          return {
            tokenAddress,
            symbol,
            requiredBalance: membrane.balances[index].toString(),
            formattedBalance: ethers.formatUnits(membrane.balances[index], decimals)
          };
        })
      );

      setRequirements(requirements);
    } catch (error) {
      console.error('Error fetching membrane data:', error);
      throw error;
    } finally {
      setIsLoadingTokens(false);
    }
  }, [chainId, getEthersProvider]);

  const handleMembraneIdChange = useCallback((value: string) => {
    setMembraneId(value);
    if (validateMembraneIdFormat(value)) {
      setIsValidating(true);
      fetchMembraneMetadata(value)
        .catch(error => {
          setError(error.message);
          setMembraneMetadata(null);
          setRequirements([]);
        })
        .finally(() => setIsValidating(false));
    }
  }, [validateMembraneIdFormat, fetchMembraneMetadata]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidInput || !membraneId) {
      setError('Please enter a valid membrane ID');
      return;
    }

    try {
      await onSubmit({ membraneId });
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Operation Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl"
    >
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <Box maxH="85vh" overflowY="auto" p={6}>
          <VStack spacing={6} align="stretch" width="100%">
            {/* Title Section */}
            <Box borderBottomWidth="1px" pb={4}>
              <Text fontSize="2xl" fontWeight="bold">Design Cornerm</Text>
              <Text fontSize="sm" color="gray.600">Configure membrane requirements</Text>
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
                  placeholder="Enter numeric membrane ID"
                  isDisabled={isValidating || isLoading}
                  pattern="\d*"
                  inputMode="numeric"
                />
                <InputRightElement>
                  {membraneId && (
                    isValidInput ? (
                      <CheckCircle size={18} color="green" />
                    ) : (
                      <XCircle size={18} color="red" />
                    )
                  )}
                </InputRightElement>
              </InputGroup>

              {inputError && (
                <Alert status="error" mt={2} size="sm">
                  <AlertIcon as={AlertTriangle} size={14} />
                  {inputError}
                </Alert>
              )}
            </FormControl>

            {/* Loading Indicator */}
            {(isValidating || isLoadingTokens) && (
              <Box>
                <Progress size="xs" isIndeterminate colorScheme="purple" />
                <Text mt={2} textAlign="center" fontSize="sm" color="gray.600">
                  {isValidating ? 'Validating membrane...' : 'Loading token details...'}
                </Text>
              </Box>
            )}

            {/* Error Display */}
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {/* Membrane Data Display */}
            {membraneMetadata && !error && (
              <VStack spacing={4} align="stretch">
                <Card variant="outline" bg="purple.50" mb={4}>
                  <CardHeader pb={2}>
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="bold">{membraneMetadata.name}</Text>
                      <Badge colorScheme="purple">ID: {membraneId.slice(0, 6)}...</Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      {membraneMetadata.characteristics?.map((char, idx) => (
                        <Box
                          key={idx}
                          p={3}
                          bg="white"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="purple.100"
                        >
                          <HStack justify="space-between">
                            <Text>{char.title}</Text>
                            {char.link && (
                              <Link 
                                href={char.link} 
                                isExternal 
                                color="purple.500"
                                fontSize="sm"
                              >
                                <HStack spacing={1}>
                                  <LinkIcon size={14} />
                                  <ExternalLink size={14} />
                                </HStack>
                              </Link>
                            )}
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                <RequirementsTable
                  requirements={requirements}
                  membraneMetadata={membraneMetadata}
                />

                <OperationConfirmation
                  membraneMetadata={membraneMetadata}
                  membraneId={membraneId}
                  requirementsCount={requirements.length}
                />
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
                  isLoading={isLoading || isValidating || isLoadingTokens}
                  loadingText="Processing..."
                  isDisabled={!!error || !membraneMetadata || !isValidInput}
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