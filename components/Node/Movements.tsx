import React, { useState, useMemo, Suspense, lazy } from 'react';
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
  useToast,
  Alert,
  AlertIcon,
  Skeleton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th
} from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { MovementType, NodeState } from '../../types/chainData';
import { useMovements } from '../../hooks/useMovements';
import { useEndpoints } from '../../hooks/useEndpoints';
import { LazyLoadWrapper } from '../shared/LazyLoadWrapper';
import { ErrorBoundary } from '../shared/ErrorBoundary';

// Lazy load components
const MovementRow = lazy(() => import('./MovementRow'));
const CreateMovementForm = lazy(() => import('./CreateMovementForm'));

interface MovementsProps {
  nodeId: string;
  chainId: string;
  nodeData: NodeState;
}

export const Movements: React.FC<MovementsProps> = ({ nodeId, chainId, nodeData }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const {
    movements,
    descriptions,
    signatures,
    isLoading,
    createMovement,
    signMovement,
    executeMovement
  } = useMovements({ nodeId, chainId });
  
  // Load endpoint data in parallel
  const { endpoints, isLoading: isLoadingEndpoints } = useEndpoints(nodeData, chainId);

  const handleCreateMovement = async (formData: any) => {
    try {
      await createMovement(formData);
      toast({
        title: 'Success',
        description: 'Movement created successfully',
        status: 'success',
        duration: 3000
      });
      onClose();
    } catch (error) {
      console.error('Movement creation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create movement',
        status: 'error',
        duration: 5000
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
          isLoading={isLoadingEndpoints}
        >
          Create Movement
        </Button>
      </HStack>

      {isLoading ? (
        <VStack spacing={4}>
          <Skeleton height="50px" width="100%" />
          <Skeleton height="50px" width="100%" />
          <Skeleton height="50px" width="100%" />
        </VStack>
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
              <LazyLoadWrapper key={movement.movementHash} height="80px">
                <MovementRow
                  movement={movement}
                  description={descriptions[movement.movement.descriptionHash] || ''}
                  signatures={signatures[movement.movementHash] || { current: 0, required: 0 }}
                  onSign={() => signMovement(movement)}
                  onExecute={() => executeMovement(movement)}
                />
              </LazyLoadWrapper>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Movement</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <LazyLoadWrapper height="400px">
              <ErrorBoundary>
                <CreateMovementForm
                  nodeData={{
                    ...nodeData,
                    endpoints,
                    isLoadingEndpoints
                  }}
                  onSubmit={handleCreateMovement}
                  onClose={onClose}
                />
              </ErrorBoundary>
            </LazyLoadWrapper>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Movements;