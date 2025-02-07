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
  LatentMovement 
} from '../../types/chainData';
import { sign } from 'crypto';

interface FormState {
  type: MovementType;
  description: string;
  expiryDays: number;
  payload: string;
}

interface MovementProps {
  nodeId: string;
  chainId: string;
}

const processMovementData = (rawMovement: any): LatentMovement => {
  try {
    return {
      movement: {
        category: Number(rawMovement.movement.category),
        initiatior: rawMovement.movement.initiatior.toString(),
        exeAccount: rawMovement.movement.exeAccount.toString(),
        viaNode: rawMovement.movement.viaNode.toString(),
        expiresAt: rawMovement.movement.expiresAt.toString(),
        descriptionHash: rawMovement.movement.descriptionHash.toString(),
        executedPayload: rawMovement.movement.executedPayload.toString()
      },
      signatureQueue: {
        state: Number(rawMovement.signatureQueue.state),
        hash: rawMovement.signatureQueue.hash?.toString() || '',
        Action: rawMovement.signatureQueue.Action,
        Signers: Array.isArray(rawMovement.signatureQueue.Signers) 
          ? rawMovement.signatureQueue.Signers.map((s: any) => s.toString())
          : [],
        Sigs: Array.isArray(rawMovement.signatureQueue.Sigs)
          ? rawMovement.signatureQueue.Sigs.map((s: any) => s.toString())
          : []
      }
    };
  } catch (error) {
    console.error('Error processing movement data:', error);
    throw error;
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

export const Movements: React.FC<MovementProps> = ({ nodeId, chainId }) => {
  const [movements, setMovements] = useState<LatentMovement[]>([]);
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
    if (!nodeId || !chainId) return;
    
    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL_OPTIMISM_SEPOLIA);
      const executionContract = new ethers.Contract(
        deployments.Execution[chainId.replace('eip155:', '')],
        ABIs.Execution,
        provider
      );

      const rawMovements = await executionContract.getLatentMovements(nodeId);
      const processedMovements = rawMovements
        .map(processMovementData)
        .filter(m => m.signatureQueue.state !== SignatureQueueState.Stale);

      setMovements(processedMovements);
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast({
        title: 'Error fetching movements',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
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

  const handleSignMovement = async (movement: LatentMovement) => {
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const provider = await getEthersProvider();
      const signer = await provider.getSigner();
      const hash = movement.signatureQueue.hash;
      if (!hash) throw new Error('Movement hash not found');
      
      const signature = await signer.signMessage(ethers.getBytes(hash));
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
            hash,
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
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  };

  const handleExecuteMovement = async (movement: LatentMovement) => {
    try {
      const cleanChainId = chainId.replace('eip155:', '');
      const hash = movement.signatureQueue.hash;
      if (!hash) throw new Error('Movement hash not found');

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

          return contract.executeQueue(hash);
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
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
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
            {movements.map((movement) => (
              <Tr key={movement.signatureQueue.hash}>
                <Td>
                  <Badge>
                    {movement.movement.category === MovementType.AgentMajority 
                      ? 'Agent Majority' 
                      : 'Value Majority'}
                  </Badge>
                </Td>
                <Td>
                  <Tooltip label={movement.movement.descriptionHash}>
                    <Text isTruncated maxW="200px">
                      {movement.movement.descriptionHash}
                    </Text>
                  </Tooltip>
                </Td>
                <Td>
                  <HStack>
                    <Clock size={14} />
                    <Text>
                      {new Date(Number(movement.movement.expiresAt) * 1000).toLocaleDateString()}
                    </Text>
                  </HStack>
                </Td>
                <Td>
                  <HStack>
                    {getMovementStateDisplay(movement.signatureQueue.state).icon}
                    <Badge colorScheme={getMovementStateDisplay(movement.signatureQueue.state).color}>
                      {getMovementStateDisplay(movement.signatureQueue.state).label}
                    </Badge>
                  </HStack>
                </Td>
                <Td>
                  {movement.signatureQueue.Signers?.length || 0} / Required
                </Td>
                <Td>
                  <HStack>
                    <Button
                      size="sm"
                      onClick={() => handleSignMovement(movement)}
                      isDisabled={movement.signatureQueue.state !== SignatureQueueState.Initialized}
                    >
                      Sign
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleExecuteMovement(movement)}
                      isDisabled={movement.signatureQueue.state !== SignatureQueueState.Valid}
                    >
                      Execute
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
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