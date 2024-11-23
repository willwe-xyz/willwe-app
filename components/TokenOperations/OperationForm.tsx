import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  RadioGroup,
  Radio,
  Stack,
  FormErrorMessage,
} from '@chakra-ui/react';

interface OperationFormProps {
  operation: string;
  amount: string;
  setAmount: (value: string) => void;
  membraneId: string;
  setMembraneId: (value: string) => void;
  membraneInputType: 'dropdown' | 'manual';
  setMembraneInputType: (value: 'dropdown' | 'manual') => void;
  targetNodeId: string;
  setTargetNodeId: (value: string) => void;
  membranes: Array<{ id: string; name: string }>;
  nodeId: string;
  data?: {
    children?: Array<{ id: string; name: string }>;
  };
  error?: string;
  isLoading?: boolean;
}

export const OperationForm: React.FC<OperationFormProps> = ({
  operation,
  amount,
  setAmount,
  membraneId,
  setMembraneId,
  membraneInputType,
  setMembraneInputType,
  targetNodeId,
  setTargetNodeId,
  membranes,
  nodeId,
  data,
  error,
  isLoading,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      {['mint', 'burn', 'mintPath', 'burnPath'].includes(operation) && (
        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <Input
            type="number"
            step="0.000000000000000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </FormControl>
      )}

      {operation === 'spawnWithMembrane' && (
        <>
          <FormControl>
            <FormLabel>Select Input Method</FormLabel>
            <RadioGroup
              onChange={(value) => setMembraneInputType(value as 'dropdown' | 'manual')}
              value={membraneInputType}
            >
              <Stack direction="row">
                <Radio value="dropdown">Select from List</Radio>
                <Radio value="manual">Enter Membrane ID</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>

          <FormControl isRequired isInvalid={!!error}>
            <FormLabel>
              {membraneInputType === 'dropdown' ? 'Select Membrane' : 'Enter Membrane ID'}
            </FormLabel>
            {membraneInputType === 'dropdown' ? (
              <Select
                value={membraneId}
                onChange={(e) => setMembraneId(e.target.value)}
                placeholder="Select membrane"
              >
                {membranes.map(membrane => (
                  <option key={membrane.id} value={membrane.id}>
                    {membrane.name} ({membrane.id})
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                value={membraneId}
                onChange={(e) => setMembraneId(e.target.value)}
                placeholder="Enter membrane ID"
              />
            )}
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
          </FormControl>
        </>
      )}

      {['mintPath', 'burnPath'].includes(operation) && data && (
        <FormControl isRequired>
          <FormLabel>Target Node</FormLabel>
          <Select
            value={targetNodeId}
            onChange={(e) => setTargetNodeId(e.target.value)}
            placeholder="Select target node"
          >
            <option value={nodeId}>
              Current Node ({nodeId.slice(-6)})
            </option>
            {data.children?.map(child => (
              <option key={child.id} value={child.id}>
                Child: {child.name || `Node ${child.id.slice(-6)}`}
              </option>
            ))}
          </Select>
        </FormControl>
      )}
    </VStack>
  );
};