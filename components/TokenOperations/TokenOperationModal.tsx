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
  TabList,
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import {
  Shield,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  ExternalLink,
  Link as LinkIcon,
  Coins,
} from 'lucide-react';
import { ethers } from 'ethers';
import { usePrivy } from "@privy-io/react-auth";
import { RequirementsTable } from './RequirementsTable';
import { OperationConfirmation } from './OperationConfirmation';
import { StatusIndicator } from './StatusIndicator';
import { deployments, ABIs } from '../../config/contracts';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface TokenOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: OperationParams) => Promise<void>;
  operation: string;
  isLoading: boolean;
  nodeId: string;
  chainId: string;
}

interface OperationParams {
  amount?: string;
  membraneId?: string;
  targetNodeId?: string;
}

interface ValueOperationForm {
  amount: string;
  targetNodeId?: string;
  operation: 'mint' | 'burn' | 'mintPath' | 'burnPath';
}

export const TokenOperationModal: React.FC<TokenOperationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  operation,
  isLoading,
  nodeId,
  chainId,
}) => {
  // State for membrane operations
  const [membraneId, setMembraneId] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isValidInput, setIsValidInput] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [membraneMetadata, setMembraneMetadata] = useState<MembraneMetadata | null>(null);
  const [requirements, setRequirements] = useState<MembraneRequirement[]>([]);
  const [error, setError] = useState<string | null>(null);

  // State for value operations
  const [valueOperation, setValueOperation] = useState<ValueOperationForm>({
    amount: '',
    operation: 'mint'
  });

  const { getEthersProvider } = usePrivy();
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setMembraneId('');
    setMembraneMetadata(null);
    setRequirements([]);
    setError(null);
    setInputError(null);
    setIsValidInput(false);
    setValueOperation({
      amount: '',
      operation: 'mint'
    });
  };

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
    } catch {
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
    } catch (err) {
      console.error('Error fetching membrane data:', err);
      throw err;
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
    try {
      if (operation === 'spawnBranchWithMembrane') {
        if (!isValidInput || !membraneId) {
          setError('Please enter a valid membrane ID');
          return;
        }
        await onSubmit({ membraneId });
      } else {
        const { amount, targetNodeId } = valueOperation;
        if (!amount) {
          setError('Please enter a valid amount');
          return;
        }
        await onSubmit({ amount, targetNodeId });
      }
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

  const handleValueOperationChange = (field: keyof ValueOperationForm, value: string) => {
    setValueOperation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderValueOperationsForm = () => (
    <VStack spacing={4} align="stretch">
      <FormControl isRequired>
        <FormLabel>Amount</FormLabel>
        <InputGroup>
          <Input
            value={valueOperation.amount}
            onChange={(e) => handleValueOperationChange('amount', e.target.value)}
            placeholder="Enter amount"
            type="number"
            step="0.000000000000000001"
          />
          <InputRightElement>
            <Coins size={16} />
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {(operation === 'mintPath' || operation === 'burnPath') && (
        <FormControl isRequired>
          <FormLabel>Target Node</FormLabel>
          <Input
            value={valueOperation.targetNodeId || ''}
            onChange={(e) => handleValueOperationChange('targetNodeId', e.target.value)}
            placeholder="Enter target node ID"
          />
        </FormControl>
      )}
    </VStack>
  );

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
            <Tabs isFitted colorScheme="purple">
              <TabList mb={4}>
                <Tab>Value Operations</Tab>
                <Tab>Membrane Operations</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  {renderValueOperationsForm()}
                </TabPanel>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
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
                          isDisabled={isValidating || isLoading}
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
                        <Alert status="error" mt={2}>
                          <AlertIcon />
                          {inputError}
                        </Alert>
                      )}
                    </FormControl>

                    {membraneMetadata && !error && (
                      <>
                        <RequirementsTable
                          requirements={requirements}
                          membraneMetadata={membraneMetadata}
                        />
                        <OperationConfirmation
                          membraneMetadata={membraneMetadata}
                          membraneId={membraneId}
                          requirementsCount={requirements.length}
                        />
                      </>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <StatusIndicator
              isValidating={isValidating}
              isLoadingTokens={isLoadingTokens}
              error={error}
            />

            <Box 
              borderTopWidth="1px" 
              pt={4}
              mt={4}
              bg="white"
            >
              <Button
                colorScheme="purple"
                onClick={handleSubmit}
                isLoading={isLoading}
                loadingText="Processing..."
                width="100%"
                size="lg"
              >
                Confirm Operation
              </Button>
            </Box>
          </VStack>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default TokenOperationModal;