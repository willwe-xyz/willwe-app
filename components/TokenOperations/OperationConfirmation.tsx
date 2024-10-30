import React from 'react';
import {
  Box,
  Text,
  Badge,
  VStack,
} from '@chakra-ui/react';
import { MembraneMetadata } from './types';

interface OperationConfirmationProps {
  membraneMetadata: MembraneMetadata | null;
  membraneId: string;
  requirementsCount: number;
}

export const OperationConfirmation: React.FC<OperationConfirmationProps> = ({
  membraneMetadata,
  membraneId,
  requirementsCount,
}) => {
  return (
    <Box 
      p={4} 
      bg="gray.50" 
      borderRadius="md" 
      w="100%"
    >
      <VStack align="start" spacing={3}>
        <Box display="flex" justifyContent="space-between" w="100%">
          <Text fontWeight="semibold">Operation Summary:</Text>
          {membraneId && (
            <Badge colorScheme="purple">
              ID: {membraneId.slice(0, 8)}...{membraneId.slice(-6)}
            </Badge>
          )}
        </Box>
        <Text fontSize="sm">
          • Creating sub-node with membrane restrictions
        </Text>
        <Text fontSize="sm">
          • Token requirements: {requirementsCount}
        </Text>
        {membraneMetadata?.characteristics?.length > 0 && (
          <Text fontSize="sm">
            • Characteristics: {membraneMetadata.characteristics.length}
          </Text>
        )}
      </VStack>
    </Box>
  );
};