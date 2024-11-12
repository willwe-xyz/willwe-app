import React, { useState, useEffect, useCallback } from 'react';
import {
  VStack,
  HStack,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { Info, Activity, Shield } from 'lucide-react';
import { NodeState } from '../../types/chainData';
import { useNode } from '../../contexts/NodeContext';
import { useNodeOperations } from '../../hooks/useNodeOperations';
import { formatBalance } from '../../utils/formatters';

interface SignalFormProps {
  node: NodeState;
  chainId: string;
  selectedTokenColor: string;
  onSuccess?: () => void;
}

const SignalForm: React.FC<SignalFormProps> = ({
  node,
  chainId,
  selectedTokenColor,
  onSuccess
}) => {
  const toast = useToast();
  const { signal } = useNodeOperations(chainId);

  // State for membrane and inflation settings
  const [membraneId, setMembraneId] = useState<string>('');
  const [inflationRate, setInflationRate] = useState<number>(0); // in gwei

  // State for child node distributions
  const [distributions, setDistributions] = useState<{ [key: string]: number }>({});
  const [remaining, setRemaining] = useState<number>(100);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Initialize distributions based on child nodes
  useEffect(() => {
    if (node?.childrenNodes) {
      const initial = node.childrenNodes.reduce((acc, nodeId) => {
        acc[nodeId] = 0;
        return acc;
      }, {} as { [key: string]: number });
      setDistributions(initial);
    }
  }, [node?.childrenNodes]);

  // Calculate remaining percentage
  useEffect(() => {
    const total = Object.values(distributions).reduce((sum, value) => sum + value, 0);
    setRemaining(100 - total);
  }, [distributions]);

  // Handle distribution change for a child node
  const handleDistributionChange = useCallback((nodeId: string, value: number) => {
    setDistributions(prev => {
      const currentTotal = Object.entries(prev)
        .filter(([key]) => key !== nodeId)
        .reduce((sum, [, val]) => sum + val, 0);

      // Ensure we don't exceed 100%
      const maxAllowed = 100 - currentTotal;
      const newValue = Math.min(value, maxAllowed);

      return {
        ...prev,
        [nodeId]: newValue
      };
    });
  }, []);

  // Validate and prepare signal data
  const prepareSignalData = useCallback(() => {
    // First two slots are for membrane and inflation
    const signals: number[] = [
      membraneId ? parseInt(membraneId) : 0,
      inflationRate || 0
    ];

    // Add distribution percentages, multiplied by 100 for precision
    node?.childrenNodes?.forEach(nodeId => {
      signals.push(Math.round(distributions[nodeId] * 100));
    });

    return signals;
  }, [membraneId, inflationRate, distributions, node?.childrenNodes]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setError(null);

      // Validate total distribution equals 100%
      const total = Object.values(distributions).reduce((sum, value) => sum + value, 0);
      if (Math.abs(total - 100) > 0.01) {
        throw new Error('Distribution percentages must total exactly 100%');
      }

      const signals = prepareSignalData();
      await signal(node.basicInfo[0], signals);

      toast({
        title: 'Signal sent successfully',
        status: 'success',
        duration: 5000
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Failed to send signal',
        description: err.message,
        status: 'error',
        duration: 5000
      });
    }
  };

  // Early return if no node data
  if (!node?.basicInfo) {
    return null;
  }

  return (
    <VStack spacing={6} align="stretch" p={4} bg="white" borderRadius="lg" shadow="sm">
      {/* Membrane Configuration */}
      <FormControl>
        <FormLabel>
          <HStack spacing={2}>
            <Shield size={16} />
            <Text>Membrane ID (Optional)</Text>
          </HStack>
        </FormLabel>
        <Input
          value={membraneId}
          onChange={(e) => setMembraneId(e.target.value)}
          placeholder="Enter membrane ID"
        />
      </FormControl>

      {/* Inflation Rate Configuration */}
      <FormControl>
        <FormLabel>
          <HStack spacing={2}>
            <Activity size={16} />
            <Text>Inflation Rate (gwei/sec)</Text>
          </HStack>
        </FormLabel>
        <NumberInput
          value={inflationRate}
          onChange={(_, value) => setInflationRate(value)}
          min={0}
          max={1000000}
          step={1}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      {/* Child Node Distributions */}
      <Box>
        <FormLabel>Value Distribution</FormLabel>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Node</Th>
              <Th>Current Value</Th>
              <Th>Distribution %</Th>
              <Th>Preview</Th>
            </Tr>
          </Thead>
          <Tbody>
            {node.childrenNodes.map((nodeId) => (
              <Tr key={nodeId}>
                <Td>{nodeId.slice(-6)}</Td>
                <Td>{formatBalance(node.basicInfo[4])}</Td>
                <Td width="200px">
                  <NumberInput
                    value={distributions[nodeId] || 0}
                    onChange={(_, value) => handleDistributionChange(nodeId, value)}
                    min={0}
                    max={100}
                    step={1}
                    size="sm"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Td>
                <Td>
                  <Slider
                    value={distributions[nodeId] || 0}
                    onChange={(v) => handleDistributionChange(nodeId, v)}
                    min={0}
                    max={100}
                    colorScheme="purple"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {/* Remaining percentage indicator */}
        <Text mt={2} color={remaining === 0 ? 'green.500' : 'orange.500'} fontSize="sm">
          Remaining: {remaining}%
        </Text>
      </Box>

      {/* Error display */}
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Submit button */}
      <Button
        colorScheme="purple"
        onClick={handleSubmit}
        isDisabled={remaining !== 0 || Boolean(error)}
        leftIcon={<Activity size={16} />}
      >
        Send Signal
      </Button>

      {/* Help text */}
      <Alert status="info" variant="left-accent">
        <AlertIcon as={Info} />
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium">Signal Configuration Guide</Text>
          <Text fontSize="sm">
            • Membrane ID: Optional configuration for node access control
          </Text>
          <Text fontSize="sm">
            • Inflation Rate: Amount of new value generated per second (in gwei)
          </Text>
          <Text fontSize="sm">
            • Distribution: Percentages must total exactly 100% across all child nodes
          </Text>
        </VStack>
      </Alert>
    </VStack>
  );
};

export default SignalForm;