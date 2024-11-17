import React from 'react';
import {
  Box,
  Text,
  HStack,
  Input,
  FormControl,
  FormLabel,
  Progress,
  VStack,
  Badge,
  Tooltip,
  Skeleton,
} from '@chakra-ui/react';
import { Shield, Info } from 'lucide-react';
import { MembraneRequirement } from '../../../types/chainData';

interface MembraneSectionProps {
  membraneId: string;
  setMembraneId: (id: string) => void;
  membraneMetadata: any;
  membraneRequirements: MembraneRequirement[];
  isLoadingMembrane: boolean;
  isValidating: boolean;
  isProcessing: boolean;
}

export const MembraneSection: React.FC<MembraneSectionProps> = ({
  membraneId,
  setMembraneId,
  membraneMetadata,
  membraneRequirements,
  isLoadingMembrane,
  isValidating,
  isProcessing
}) => {
  return (
    <Box p={4} bg="purple.50" borderRadius="lg">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Membrane Configuration
      </Text>
      
      <FormControl>
        <FormLabel>
          <HStack>
            <Shield size={14} />
            <Text>Membrane ID</Text>
            <Tooltip label="Enter the ID of the membrane to signal for">
              <Box as="span" cursor="help">
                <Info size={14} />
              </Box>
            </Tooltip>
          </HStack>
        </FormLabel>

        <Input
          value={membraneId}
          onChange={(e) => setMembraneId(e.target.value)}
          placeholder="Enter membrane ID"
          isDisabled={isProcessing}
          bg="white"
        />

        {isValidating && (
          <Progress size="xs" isIndeterminate colorScheme="purple" mt={2} />
        )}

        {isLoadingMembrane ? (
          <Skeleton height="100px" mt={2} />
        ) : (
          membraneMetadata && (
            <Box mt={2} p={3} bg="white" borderRadius="md">
              <Text fontWeight="semibold" mb={2}>
                {membraneMetadata.name}
              </Text>
              {membraneMetadata.description && (
                <Text fontSize="sm" color="gray.600" mb={2}>
                  {membraneMetadata.description}
                </Text>
              )}
              <VStack align="start" spacing={1}>
                {membraneRequirements.map((req, idx) => (
                  <HStack key={idx} spacing={2} fontSize="sm">
                    <Badge colorScheme="purple">{req.symbol}</Badge>
                    <Text>{req.formattedBalance} tokens required</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )
        )}
      </FormControl>
    </Box>
  );
};

export default MembraneSection;