import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useDisclosure,
  Alert,
  AlertIcon,
  Tooltip
} from '@chakra-ui/react';
import { Plus, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useTransaction } from '../../contexts/TransactionContext';
import { deployments, ABIs } from '../../config/contracts';
import { 
  Movement, 
  MovementType, 
  SignatureQueue, 
  SignatureQueueState, 
  MovementData 
} from '../../types/chainData';

interface FormState {
  type: MovementType;
  description: string;
  expiryDays: number;
  payload: string;
}

export const Movements = ({ nodeId, chainId }: { nodeId: string; chainId: string }) => {
  const [movements, setMovements] = useState<MovementData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { getEthersProvider } = usePrivy();
  const { executeTransaction } = useTransaction();
  const toast = useToast();

  const [formData, setFormData] = useState<FormState>({
    type: MovementType.AgentMajority,
    description: '',
    expiryDays: 7,
    payload: ''
  });

  const fetchMovements = async () => {
    try {
      const provider = await getEthersProvider();
      const executionContract = new ethers.Contract(
        deployments.Execution[chainId.replace('eip155:', '')],
        ABIs.Execution,
        provider
      );

      const latentMovements = await executionContract.getLatentMovements(nodeId);
      setMovements(latentMovements.filter(m => m.state !== SignatureQueueState.Stale));
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast({
        title: 'Error fetching movements',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (nodeId && chainId) {
      fetchMovements();
    }
  }, [nodeId, chainId]);

  const handleCreateMovement = async () => {
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            deployments.WillWe[cleanChainId],
            ABIs.WillWe,
            signer
          );

          const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(formData.description));
          
          return contract.startMovement(
            formData.type,
            nodeId,
            formData.expiryDays,
            ethers.ZeroAddress,
            descriptionHash,
            formData.payload || '0x'
          );
        },
        {
          successMessage: 'Movement created successfully',
          onSuccess: () => {
            onClose();
            fetchMovements();
          }
        }
      );
    } catch (error) {
      console.error('Error creating movement:', error);
      toast({
        title: 'Error creating movement',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const handleSignMovement = async (movement: MovementData) => {
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(ethers.getBytes(movement.hash));
      const address = await signer.getAddress();

      await executeTransaction(
        chainId,
        async () => {
          const contract = new ethers.Contract(
            deployments.WillWe[cleanChainId],
            ABIs.WillWe,
            signer
          );

          return contract.submitSignatures(
            movement.hash,
            [address],
            [signature]
          );
        },
        {
          successMessage: 'Movement signed successfully',
          onSuccess: fetchMovements
        }
      );
    } catch (error) {
      console.error('Error signing movement:', error);
      toast({
        title: 'Error signing movement',
        status: 'error'
      });
    }
  };

  const handleExecuteMovement = async (movement: MovementData) => {
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      await executeTransaction(
        chainId,
        async () => {
          const provider = await getEthersProvider();
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            deployments.WillWe[cleanChainId],
            ABIs.WillWe,
            signer
          );

          return contract.executeQueue(movement.hash);
        },
        {
          successMessage: 'Movement executed successfully',
          onSuccess: fetchMovements
        }
      );
    } catch (error) {
      console.error('Error executing movement:', error);
      toast({
        title: 'Error executing movement',
        status: 'error'
      });
    }
  };

  const getMovementStateDisplay = (state: SignatureQueueState) => {
    switch (state) {
      case SignatureQueueState.Valid:
        return {
          label: 'Valid',
          color: 'green',
          icon: <CheckCircle size={14} />
        };
      case SignatureQueueState.Initialized:
        return {
          label: 'Pending Signatures',
          color: 'yellow',
          icon: <Clock size={14} />
        };
      case SignatureQueueState.Executed:
        return {
          label: 'Executed',
          color: 'blue',
          icon: <CheckCircle size={14} />
        };
      case SignatureQueueState.Stale:
        return {
          label: 'Expired',
          color: 'red',
          icon: <XCircle size={14} />
        };
      default:
        return {
          label: 'Unknown',
          color: 'gray',
          icon: <AlertTriangle size={14} />
        };
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="lg" fontWeight="bold">Movements</Text>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={onOpen}
          colorScheme="purple"
          size="sm"
        >
          Create Movement
        </Button>
      </HStack>

      {isLoading ? (
        <Text>Loading movements...</Text>
      ) : movements.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          <Text>No active movements found</Text>
        </Alert>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Description</Th>
              <Th>Expiry</Th>
              <Th>Status</Th>
              <Th>Signatures</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {movements.map((movement) => {
              const stateDisplay = getMovementStateDisplay(movement.state);
              return (
                <Tr key={movement.hash}>
                  <Td>
                    <Badge>
                      {movement.Action.category === MovementType.AgentMajority 
                        ? 'Agent Majority' 
                        : 'Value Majority'}
                    </Badge>
                  </Td>
                  <Td>
                    <Tooltip label={movement.Action.descriptionHash}>
                      <Text isTruncated maxW="200px">
                        {movement.Action.descriptionHash}
                      </Text>
                    </Tooltip>
                  </Td>
                  <Td>
                    <HStack>
                      <Clock size={14} />
                      <Text>
                        {new Date(Number(movement.Action.expiresAt) * 1000).toLocaleDateString()}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack>
                      {stateDisplay.icon}
                      <Badge colorScheme={stateDisplay.color}>
                        {stateDisplay.label}
                      </Badge>
                    </HStack>
                  </Td>
                  <Td>
                    {movement.Signers?.length || 0} / Required
                  </Td>
                  <Td>
                    <HStack>
                      <Button
                        size="sm"
                        onClick={() => handleSignMovement(movement)}
                        isDisabled={movement.state !== SignatureQueueState.Initialized}
                      >
                        Sign
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => handleExecuteMovement(movement)}
                        isDisabled={movement.state !== SignatureQueueState.Valid}
                      >
                        Execute
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Movement</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Movement Type</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    type: Number(e.target.value) as MovementType
                  })}
                >
                  <option value={MovementType.AgentMajority}>Agent Majority</option>
                  <option value={MovementType.EnergeticMajority}>Value Majority</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: e.target.value
                  })}
                  placeholder="Movement description..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Expires In (Days)</FormLabel>
                <Input
                  type="number"
                  value={formData.expiryDays}
                  onChange={(e) => setFormData({
                    ...formData,
                    expiryDays: Number(e.target.value)
                  })}
                  min={1}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Execution Payload (Optional)</FormLabel>
                <Input
                  value={formData.payload}
                  onChange={(e) => setFormData({
                    ...formData,
                    payload: e.target.value
                  })}
                  placeholder="0x..."
                />
              </FormControl>

              <Button 
                colorScheme="purple" 
                onClick={handleCreateMovement}
                width="100%"
              >
                Create Movement
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Movements;