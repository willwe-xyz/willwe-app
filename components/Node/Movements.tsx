'use client';

import React, { useState, useMemo, Suspense, lazy, useEffect } from 'react';
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
  Th,
  TableContainer
} from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { MovementType, NodeState } from '../../types/chainData';
import { useMovements } from '../../hooks/useMovements';
import { useEndpoints } from '../../hooks/useEndpoints';
import { useNetwork } from 'wagmi';
import { useAccount } from 'wagmi';
import { LazyLoadWrapper } from '../shared/LazyLoadWrapper';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { getRPCUrl } from '../../config/deployments';
import { deployments, ABIs } from '../../config/deployments';

// Lazy load components
const MovementRow = lazy(() => import('./MovementRow'));
const CreateMovementForm = lazy(() => import('./CreateMovementForm'));

interface MovementsProps {
  nodeId: string;
  nodeData: NodeState;
}

export const Movements: React.FC<MovementsProps> = ({ nodeId, nodeData }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const { chainId } = useNetwork();
  const { address: userAddress } = useAccount();

  const {
    movements = [],
    isLoading,
    createMovement,
    signMovement,
    removeSignature,
    executeMovement
  } = useMovements({ nodeId, chainId: chainId?.toString() || '', userAddress: userAddress?.toString() }) || {};

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

  const handleSign = async (movement: any) => {
    try {
      await signMovement?.(movement);
      toast({
        title: 'Success',
        description: 'Movement signed successfully',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Movement sign error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign movement',
        status: 'error',
        duration: 5000
      });
    }
  };

  const handleRemoveSignature = async (movement: any) => {
    try {
      await removeSignature?.(movement);
      toast({
        title: 'Success',
        description: 'Signature removed successfully',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Movement remove signature error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove signature',
        status: 'error',
        duration: 5000
      });
    }
  };

  const handleExecute = async (movement: any) => {
    try {
      await executeMovement?.(movement);
      toast({
        title: 'Success',
        description: 'Movement executed successfully',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Movement execute error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to execute movement',
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
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Description</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {movements?.map((movement) => (
                <MovementRow
                  key={movement.movementHash}
                  movement={movement}
                  nodeData={nodeData}
                  chainId={chainId?.toString() || ''}
                  userAddress={userAddress?.toString()}
                  onSign={() => handleSign(movement)}
                  onRemoveSignature={() => handleRemoveSignature(movement)}
                  onExecute={() => handleExecute(movement)}
                />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
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