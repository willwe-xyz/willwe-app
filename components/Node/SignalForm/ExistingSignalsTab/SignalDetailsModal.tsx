import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  Divider,
  Icon,
  Box,
  Progress,
  Tooltip,
} from '@chakra-ui/react';
import { Shield, Activity, ArrowUpDown, Info } from 'lucide-react';
import { SignalValue } from './types';

interface SignalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: SignalValue;
  signalType: 'membrane' | 'inflation' | 'redistribution';
  totalSupply?: string;
}

const SignalDetailsModal: React.FC<SignalDetailsModalProps> = ({
  isOpen,
  onClose,
  signal,
  signalType,
  totalSupply = '0',
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getSignalIcon = () => {
    switch (signalType) {
      case 'membrane':
        return Shield;
      case 'inflation':
        return Activity;
      case 'redistribution':
        return ArrowUpDown;
    }
  };

  const getSignalTitle = () => {
    switch (signalType) {
      case 'membrane':
        return `Membrane ${signal.value}`;
      case 'inflation':
        // Format inflation value as gwei/sec
        const gweiValue = Number(signal.value) / 1e9; // Convert to gwei if needed
        return `${gweiValue} gwei/sec`;
      case 'redistribution':
        return 'Redistribution Signal';
    }
  };

  const getSignalDescription = () => {
    switch (signalType) {
      case 'membrane':
        return 'Membranes define the entry requirements for this node. Support from members determines which membrane is active.';
      case 'inflation':
        return 'Inflation defines how quickly new tokens are created. The rate is measured in gwei per second.';
      case 'redistribution':
        return 'Redistribution defines how value flows to child nodes. Each member can express preferences for distribution.';
    }
  };

  // Total required support is 50% of total supply
  const requiredSupport = totalSupply ? Number(totalSupply) / 2 : 0;
  const supportPercentage = requiredSupport > 0 ? (Number(signal.support) / requiredSupport) * 100 : 0;

  // Sort supporters by support amount (highest first)
  const sortedSupporters = [...signal.supporters].sort((a, b) => Number(b.support) - Number(a.support));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>
          <HStack>
            <Icon as={getSignalIcon()} boxSize={6} />
            <Text>{getSignalTitle()}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text color="gray.600">
              {getSignalDescription()}
            </Text>

            <Box>
              <HStack justify="space-between" mb={2}>
                <HStack>
                  <Text fontWeight="medium">Total Support</Text>
                  <Tooltip label="The combined voting power supporting this signal. When support reaches 50% of the total supply, the signal becomes active.">
                    <Box as="span" cursor="help">
                      <Icon as={Info} boxSize={4} color="gray.500" />
                    </Box>
                  </Tooltip>
                </HStack>
                <Badge colorScheme="purple">{signal.support}</Badge>
              </HStack>

              {requiredSupport > 0 && (
                <Box>
                  <Progress
                    value={Math.min(100, supportPercentage)}
                    colorScheme="purple"
                    size="sm"
                    borderRadius="full"
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {supportPercentage.toFixed(1)}% of required support ({requiredSupport.toLocaleString()} tokens needed)
                  </Text>
                </Box>
              )}
            </Box>
            
            <Divider />
            
            <Box>
              <Text fontWeight="medium" mb={3}>
                Supporters ({sortedSupporters.length})
              </Text>
              <VStack spacing={3} align="stretch" maxHeight="300px" overflowY="auto">
                {sortedSupporters.map((supporter, index) => {
                  // Calculate this supporter's percentage of the total support
                  const supporterPercentage = Number(signal.support) > 0 
                    ? (Number(supporter.support) / Number(signal.support)) * 100 
                    : 0;
                  
                  return (
                    <Box
                      key={index}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={borderColor}
                    >
                      <HStack justify="space-between" mb={1}>
                        <Text isTruncated maxW="360px">
                          {supporter.address}
                        </Text>
                        <Badge colorScheme="purple">
                          {supporter.support}
                        </Badge>
                      </HStack>
                      <Box>
                        <Progress
                          value={supporterPercentage}
                          colorScheme="purple"
                          size="xs"
                          borderRadius="full"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {supporterPercentage.toFixed(1)}% of total support
                        </Text>
                      </Box>
                    </Box>
                  );
                })}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SignalDetailsModal;