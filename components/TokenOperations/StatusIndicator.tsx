import React from 'react';
import {
  Box,
  Progress,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

interface StatusIndicatorProps {
  isValidating: boolean;
  isLoadingTokens: boolean;
  error?: string | null;
  deploymentState?: 'idle' | 'deploying' | 'complete';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isValidating,
  isLoadingTokens,
  error,
  deploymentState
}) => {
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text fontSize="sm">{error}</Text>
      </Alert>
    );
  }

  if (isValidating || isLoadingTokens) {
    return (
      <Box w="100%">
        <Progress 
          size="xs" 
          isIndeterminate 
          colorScheme="purple" 
          borderRadius="full"
        />
        <Text 
          mt={2} 
          fontSize="sm" 
          color="gray.600" 
          textAlign="center"
        >
          {isValidating ? 'Validating membrane...' : 'Loading token details...'}
        </Text>
      </Box>
    );
  }

  if (deploymentState === 'deploying') {
    return (
      <Box>
        <Progress size="xs" isIndeterminate colorScheme="blue" />
        <Text mt={2} textAlign="center" fontSize="sm">
          Deploying your token...
        </Text>
      </Box>
    );
  }

  return null;
};