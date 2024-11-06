import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
  Button,
  Link,
  IconButton,
  Code,
  Tooltip,
} from '@chakra-ui/react';
import {
  Shield,
  Info,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { MembraneMetadata } from '../../types/chainData';

interface OperationConfirmationProps {
  membraneMetadata: MembraneMetadata;
  membraneId: string;
  requirementsCount: number;
}

export const OperationConfirmation: React.FC<OperationConfirmationProps> = ({
  membraneMetadata,
  membraneId,
  requirementsCount
}) => {
  return (
    <Box 
      p={4} 
      bg="gray.50" 
      borderRadius="md" 
      border="1px solid"
      borderColor="gray.200"
    >
      <VStack align="start" spacing={3}>
        <HStack justify="space-between" width="100%">
          <Text fontWeight="semibold">Operation Summary:</Text>
          <Button
            size="sm"
            variant="ghost"
            rightIcon={<Info size={14} />}
            colorScheme="purple"
          >
            {membraneId.slice(0, 6)}...{membraneId.slice(-4)}
          </Button>
        </HStack>

        <VStack align="start" spacing={2}>
          <HStack>
            <Shield size={14} />
            <Text fontSize="sm">
              Creating sub-node with membrane restrictions
            </Text>
          </HStack>

          <HStack>
            <Info size={14} />
            <Text fontSize="sm">
              {requirementsCount} token requirement{requirementsCount !== 1 ? 's' : ''}
            </Text>
          </HStack>

          {membraneMetadata.characteristics?.length > 0 && (
            <HStack>
              <Info size={14} />
              <Text fontSize="sm">
                {membraneMetadata.characteristics.length} characteristic{membraneMetadata.characteristics.length !== 1 ? 's' : ''}
              </Text>
            </HStack>
          )}

          {/* Links Section */}
          {membraneMetadata.characteristics.map((char, idx) => (
            char.link && (
              <Box 
                key={idx}
                w="100%"
                p={2}
                bg="white"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">{char.title}</Text>
                  <Link
                    href={char.link}
                    isExternal
                    color="purple.500"
                    fontSize="sm"
                  >
                    <HStack spacing={1}>
                      <LinkIcon size={12} />
                      <Text>Open</Text>
                      <ExternalLink size={12} />
                    </HStack>
                  </Link>
                </HStack>
              </Box>
            )
          ))}
        </VStack>

        {/* Verification Note */}
        <Box 
          mt={2}
          p={3}
          bg="purple.50"
          borderRadius="md"
          width="100%"
        >
          <HStack spacing={2}>
            <Info size={14} color="purple.500" />
            <Text fontSize="sm" color="purple.700">
              Membrane configuration will be verified on-chain during deployment
            </Text>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default OperationConfirmation;