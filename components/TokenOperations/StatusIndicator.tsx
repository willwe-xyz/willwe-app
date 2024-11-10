import React from 'react';
import {
  Box,
  Progress,
  Text,
  Alert,
  AlertIcon,
  HStack,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import { useTransactionContext } from '../../contexts/TransactionContext';

interface StatusIndicatorProps {
  error: string | null;
  processingStage?: 'validating' | 'loading' | 'deploying' | null;
  customMessage?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  error,
  processingStage,
  customMessage
}) => {
  const { isTransacting } = useTransactionContext();

  const getStatusMessage = () => {
    if (customMessage) return customMessage;
    
    switch (processingStage) {
      case 'validating':
        return 'Validating membrane requirements...';
      case 'loading':
        return 'Loading token information...';
      case 'deploying':
        return 'Deploying membrane configuration...';
      default:
        return 'Processing transaction...';
    }
  };

  if (isTransacting || processingStage) {
    return (
      <Box width="100%">
        <VStack spacing={2} align="stretch">
          <Progress 
            size="xs" 
            isIndeterminate 
            colorScheme="purple" 
            borderRadius="full" 
          />
          <HStack justify="center" spacing={3}>
            <Spinner size="sm" color="purple.500" />
            <Text 
              fontSize="sm" 
              color="gray.600" 
              textAlign="center"
            >
              {getStatusMessage()}
            </Text>
          </HStack>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium">Error</Text>
          <Text fontSize="sm">{error}</Text>
        </VStack>
      </Alert>
    );
  }

  return null;
};

// Optional loading steps component
interface LoadingStepProps {
  step: number;
  totalSteps: number;
  currentStep: number;
  label: string;
}

export const LoadingStep: React.FC<LoadingStepProps> = ({
  step,
  totalSteps,
  currentStep,
  label
}) => {
  const isComplete = step < currentStep;
  const isActive = step === currentStep;

  return (
    <HStack spacing={3} opacity={isComplete || isActive ? 1 : 0.5}>
      <Box
        w="20px"
        h="20px"
        borderRadius="full"
        bg={isComplete ? "green.500" : isActive ? "purple.500" : "gray.200"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
        fontSize="xs"
      >
        {step + 1}
      </Box>
      <Text
        fontSize="sm"
        color={isComplete ? "green.700" : isActive ? "purple.700" : "gray.500"}
        fontWeight={isActive ? "medium" : "normal"}
      >
        {label}
      </Text>
    </HStack>
  );
};

export const LoadingSteps: React.FC<{
  currentStep: number;
  steps: string[];
}> = ({ currentStep, steps }) => {
  return (
    <VStack spacing={2} align="stretch" width="100%">
      {steps.map((step, index) => (
        <LoadingStep
          key={index}
          step={index}
          totalSteps={steps.length}
          currentStep={currentStep}
          label={step}
        />
      ))}
    </VStack>
  );
};

export default StatusIndicator;