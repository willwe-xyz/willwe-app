// File: components/TokenOperations/components/OperationConfirmation.tsx
import React from 'react';
import {
  Box,
  Text,
  Badge,
  VStack,
  HStack,
  Button,
  Divider,
  Flex,
  Stack,
  Icon,
} from '@chakra-ui/react';
import { 
  ExternalLink,
  FileText,
  Users,
  Link2,
  Bookmark
} from 'lucide-react';
import { MembraneMetadata } from '../types';

interface OperationConfirmationProps {
  membraneMetadata: MembraneMetadata | null;
  membraneId: string;
  requirementsCount: number;
  ipfsCid?: string;
}

export const OperationConfirmation: React.FC<OperationConfirmationProps> = ({
  membraneMetadata,
  membraneId,
  requirementsCount,
  ipfsCid
}) => {
  const characteristicsCount = membraneMetadata?.characteristics?.length || 0;
  
  return (
    <Box 
      p={6}
      bg="gray.50" 
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      w="100%"
    >
      {/* Membrane ID Badge */}
      <Flex justifyContent="flex-end" mb={4}>
        <Badge 
          colorScheme="purple" 
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={Bookmark} size={14} />
          {membraneId.slice(0, 8)}...{membraneId.slice(-6)}
        </Badge>
      </Flex>

      {/* Summary Stats */}
      <Stack spacing={4}>
        <Box>
          <HStack spacing={3} mb={2}>
            <Icon as={Users} size={16} color="purple.500" />
            <Text fontSize="sm" color="gray.700">
              {requirementsCount} token requirement{requirementsCount !== 1 ? 's' : ''}
            </Text>
          </HStack>

          {characteristicsCount > 0 && (
            <HStack spacing={3} mb={2}>
              <Icon as={FileText} size={16} color="purple.500" />
              <Text fontSize="sm" color="gray.700">
                {characteristicsCount} characteristic{characteristicsCount !== 1 ? 's' : ''}
              </Text>
            </HStack>
          )}

          {membraneMetadata?.characteristics?.map((char, index) => (
            <Box
              key={index}
              ml={8}
              mt={2}
              p={2}
              borderLeft="2px"
              borderColor="purple.200"
            >
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                {char.title}
              </Text>
              <Button
                size="xs"
                variant="ghost"
                colorScheme="purple"
                rightIcon={<ExternalLink size={12} />}
                onClick={() => window.open(char.link)}
                mt={1}
              >
                View details
              </Button>
            </Box>
          ))}
        </Box>

        {/* IPFS Link */}
        {ipfsCid && (
          <>
            <Divider />
            <Button
              size="sm"
              variant="ghost"
              colorScheme="purple"
              leftIcon={<Link2 size={14} />}
              justifyContent="flex-start"
              onClick={() => window.open(`https://underlying-tomato-locust.myfilebase.com/ipfs/${ipfsCid}`)}
            >
              View on IPFS
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};