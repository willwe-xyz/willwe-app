import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Tooltip,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { LatentMovement, MovementType } from '../../types/chainData';

interface MovementDetailsProps {
  movement: LatentMovement;
  signatures: {
    current: number;
    required: number;
  };
  description: string;
}

export const MovementDetails = React.memo(({ 
  movement, 
  signatures,
  description 
}: MovementDetailsProps) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  const decodeCalls = (executedPayload: string) => {
    try {
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ['tuple(address target, bytes callData, uint256 value)[]'],
        executedPayload
      );

      return decoded[0];
    } catch {
      return [];
    }
  };

  const calls = decodeCalls(movement.movement.executedPayload);
  const progress = (signatures.current / signatures.required) * 100;

  return (
    <Box 
      border="1px solid" 
      borderColor={borderColor} 
      borderRadius="md" 
      p={4}
    >
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontSize="sm" color="gray.500">Description</Text>
          <Text>{description || 'No description available'}</Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Authorization Type</Text>
          <Badge colorScheme={movement.movement.category === MovementType.AgentMajority ? 'blue' : 'purple'}>
            {movement.movement.category === MovementType.AgentMajority ? 'Agent Majority' : 'Value Majority'}
          </Badge>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Target Endpoint</Text>
          <Tooltip label={movement.movement.exeAccount}>
            <Text fontSize="sm" fontFamily="mono">
              {movement.movement.exeAccount.slice(0, 6)}...{movement.movement.exeAccount.slice(-4)}
            </Text>
          </Tooltip>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Actions ({calls.length})</Text>
          <VStack align="stretch" spacing={2} mt={2}>
            {calls.map((call: any, index: number) => (
              <Box 
                key={index} 
                bg={bgColor} 
                p={3} 
                borderRadius="md"
                fontSize="sm"
              >
                <HStack justify="space-between">
                  <Tooltip label={call.target}>
                    <Text fontFamily="mono">To: {call.target.slice(0, 6)}...{call.target.slice(-4)}</Text>
                  </Tooltip>
                  {call.value.toString() !== '0' && (
                    <Badge colorScheme="green">
                      Value: {ethers.formatEther(call.value)} ETH
                    </Badge>
                  )}
                </HStack>
                <Tooltip label={call.callData}>
                  <Text 
                    fontFamily="mono" 
                    mt={1} 
                    isTruncated
                  >
                    Data: {call.callData.slice(0, 10)}...
                  </Text>
                </Tooltip>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.500">Signature Progress</Text>
            <Text fontSize="sm" fontWeight="medium">
              {signatures.current} / {signatures.required} 
              {movement.movement.category === MovementType.AgentMajority ? ' signatures' : ' voting power'}
            </Text>
          </HStack>
          <Progress 
            value={progress} 
            size="sm" 
            borderRadius="full"
            colorScheme={progress >= 100 ? 'green' : 'blue'}
          />
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Expires</Text>
          <Text>
            {new Date(Number(movement.movement.expiresAt) * 1000).toLocaleString()}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
});

MovementDetails.displayName = 'MovementDetails';