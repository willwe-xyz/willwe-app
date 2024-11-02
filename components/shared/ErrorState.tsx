import React from 'react';
import { Alert, AlertIcon, Text, Button, Box } from '@chakra-ui/react';

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <Box p={6} bg="white" rounded="xl" shadow="sm">
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="400px"
      rounded="md"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <Text mt={4} mb={2} fontSize="lg">
        Error loading node data
      </Text>
      <Text color="gray.600">
        {error.message}
      </Text>
      {onRetry && (
        <Button
          mt={4}
          size="sm"
          colorScheme="purple"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </Alert>
  </Box>
);