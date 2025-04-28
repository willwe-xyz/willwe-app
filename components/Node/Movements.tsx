'use client';

import React, { useState, useMemo, Suspense, lazy, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Alert,
  AlertIcon,
  Button,
  Text,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { MovementType, NodeState } from '../../types/chainData';
import MovementRow from './MovementRow';
import CreateMovementForm from './CreateMovementForm';
import { useEndpoints } from '../../hooks/useEndpoints';
import { useMovements } from '../../hooks/useMovements';
import { LazyLoadWrapper } from '../shared/LazyLoadWrapper';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { getRPCUrl } from '../../config/deployments';
import { usePrivy } from '@privy-io/react-auth';

interface MovementsProps {
  nodeId: string;
  nodeData: NodeState;
  chainId: string;
  userAddress?: string;
}

export const Movements: React.FC<MovementsProps> = ({ nodeId, nodeData, chainId, userAddress: propsUserAddress }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = usePrivy();
  const userAddress = propsUserAddress || user?.wallet?.address;

  const {
    movements = [],
    isLoading,
    signMovement,
    removeSignature,
    executeMovement,
    createMovement
  } = useMovements({ 
    nodeId, 
    chainId, 
    userAddress
  }) || {};

  // Add error state
  const [error, setError] = useState<Error | null>(null);
  const { endpoints, error: endpointsError } = useEndpoints(nodeId, chainId);

  const handleSign = async (movement: any) => {
    try {
      await signMovement?.(movement);
    } catch (error) {
      console.error('Movement sign error:', error);
    }
  };

  const handleRemoveSignature = async (movement: any) => {
    try {
      await removeSignature?.(movement);
    } catch (error) {
      console.error('Movement remove signature error:', error);
    }
  };

  const handleExecute = async (movement: any) => {
    try {
      await executeMovement?.(movement);
    } catch (error) {
      console.error('Movement execute error:', error);
    }
  };

  if (error || endpointsError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>Error: {error ? (typeof error === 'object' && error !== null && 'message' in error ? (error as {message: string}).message : String(error)) : endpointsError ? (typeof endpointsError === 'object' && endpointsError !== null && 'message' in endpointsError ? (endpointsError as {message: string}).message : String(endpointsError)) : "Unknown error"}</Text>
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
          isDisabled={!nodeData?.membersOfNode?.includes(userAddress || '')}
        >
          Create Movement
        </Button>
      </HStack>

      {isLoading ? (
        <Alert status="info">
          <AlertIcon />
          <Text>Loading movements...</Text>
        </Alert>
      ) : movements?.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          <Text>No active movements found. Start a new movement for this node.</Text>
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
                  chainId={chainId}
                  onSign={() => handleSign(movement)}
                  onRemoveSignature={() => handleRemoveSignature(movement)}
                  onExecute={() => handleExecute(movement)}
                />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Movement</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <CreateMovementForm
              nodeData={nodeData}
              onSubmit={async (formData) => {
                try {
                  await createMovement?.(formData);
                  onClose();
                } catch (error) {
                  console.error('Error creating movement:', error);
                }
              }}
              onClose={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};