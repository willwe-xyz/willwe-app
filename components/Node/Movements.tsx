'use client';

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
  userAddress?: string;
}

export const Movements: React.FC<MovementsProps> = ({ nodeId, chainId, nodeData, userAddress }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const {
    movements = [],
    signatures = {},
    isLoading,
    createMovement,
    signMovement,
    executeMovement
  } = useMovements({ nodeId, chainId, userAddress }) || {};

  // Add error state
  const [error, setError] = useState<Error | null>(null);

  // Load endpoint data in parallel with error handling
  const { endpoints, isLoading: isLoadingEndpoints, error: endpointsError } = useEndpoints(nodeData, chainId);

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

  if (error || endpointsError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>{error?.message || endpointsError || 'An error occurred loading movements'}</Text>
      </Alert>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6} mt={4} ml={2} mr={2}>
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
      ) : movements?.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          <Text>No active movements found</Text>
        </Alert>
      ) : (
        <Table variant="simple" width="100%">
          <Thead>
            <Tr>
              <Th width="15%">Type</Th>
              <Th width="30%">Description</Th>
              <Th width="15%">Expiry</Th>
              <Th width="15%">Status</Th>
              <Th width="10%">Signatures</Th>
              <Th width="15%">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {movements?.map((movement, index) => (
              movement && (
                <LazyLoadWrapper key={index} height="80px" isTableRow colSpan={6}>
                  <MovementRow
                    movement={movement}
                    signatures={signatures?.[movement?.movementHash] || { current: 0, required: 0 }}
                    onSign={() => signMovement?.(movement)}
                    onExecute={() => executeMovement?.(movement)}
                  />
                </LazyLoadWrapper>
              )
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