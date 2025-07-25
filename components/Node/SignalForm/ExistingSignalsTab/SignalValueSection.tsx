import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Button,
  Tooltip,
  Badge,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { Shield, Activity, Plus, Info } from 'lucide-react';
import { SignalValue } from './types';

interface SignalValueSectionProps {
  nodeId: string;
  chainId: string;
  nodeData: any;
  userAddress: string;
  onSupportSignal: (signalType: 'membrane' | 'inflation', value: string) => Promise<void>;
  onSignalClick: (signal: SignalValue, type: 'membrane' | 'inflation' | 'redistribution') => void;
  tokenSymbol?: string;
}

const SignalValueSection: React.FC<SignalValueSectionProps> = ({
  nodeId,
  chainId,
  nodeData,
  userAddress,
  onSupportSignal,
  onSignalClick,
  tokenSymbol = 'PSC' // Default to PSC if not provided
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('purple.50', 'purple.900');

  // Process signals data
  const processSignals = (signals: [string, string][], type: 'membrane' | 'inflation') => {
    const signalMap = new Map<string, SignalValue>();
    
    if (!Array.isArray(signals)) {
      console.error(`Invalid signals array:`, signals);
      return [];
    }

    // Process each signal entry
    signals.forEach((signal, userIndex) => {
      const signalerAddress = nodeData.nodeSignals.signalers[userIndex];
      if (!signalerAddress) return;

      const [value, support] = signal;
      
      // Skip empty or invalid signals
      if (!value || value === '0') {
        return;
      }

      // Add or update signal in the map
      if (!signalMap.has(value)) {
        signalMap.set(value, {
          value,
          support: '0',
          supporters: []
        });
      }

      const existingSignal = signalMap.get(value)!;
      existingSignal.supporters.push({
        address: signalerAddress,
        support
      });

      // Update total support
      const currentSupport = BigInt(existingSignal.support || '0');
      const additionalSupport = BigInt(support || '0');
      existingSignal.support = (currentSupport + additionalSupport).toString();
    });

    return Array.from(signalMap.values())
      .sort((a, b) => Number(b.support) - Number(a.support));
  };

  // Process membrane and inflation signals from their respective arrays
  const membraneSignals = nodeData.nodeSignals?.membraneSignals ? 
    processSignals(nodeData.nodeSignals.membraneSignals, 'membrane') : [];
  const inflationSignals = nodeData.nodeSignals?.inflationSignals ? 
    processSignals(nodeData.nodeSignals.inflationSignals, 'inflation') : [];

  const totalSupply = Number(nodeData.basicInfo[11]); // Total supply from node state
  const requiredSupport = totalSupply / 2;

  const getTooltipDescription = (type: 'membrane' | 'inflation') => {
    if (type === 'membrane') {
      return 'Membrane signals define the entry requirements for this node. The value represents a membrane ID. Support shows the total voting weight behind this signal. 50% of total supply is needed for acceptance.';
    }
    return 'Inflation signals define how quickly new tokens are created. The value is in gwei/sec. Support shows the total voting weight behind this signal. 50% of total supply is needed for acceptance.';
  };

  const SignalCard = ({ signal, type }: { signal: SignalValue; type: 'membrane' | 'inflation' }) => {
    const supportPercentage = Math.min(100, (Number(signal.support) / requiredSupport) * 100);
    const hasUserSupport = signal.supporters.some(s => s.address === userAddress);
    
    // Format the display value based on signal type
    const getDisplayValue = () => {
      if (type === 'membrane') {
        // For membrane signals, display the membrane ID
        return `Membrane ${signal.value}`;
      } else if (type === 'inflation') {
        // For inflation signals, value is in gwei/sec
        const gweiPerSec = Number(signal.value);
        const gweiPerDay = gweiPerSec * 86400; // Convert to gwei/day
        const ethPerDay = gweiPerDay / 1e9; // Convert gwei to ETH
        
        return `${Math.round(gweiPerSec)} gwei/sec (${ethPerDay.toFixed(4)} ${tokenSymbol}/day)`;
      }
      return signal.value;
    };

    return (
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="md"
        bg={bgColor}
        borderColor={borderColor}
        _hover={{ bg: hoverBg }}
        cursor="pointer"
        onClick={() => onSignalClick(signal, type)}
        position="relative"
      >
        <HStack justify="space-between" mb={2}>
          <HStack>
            <Icon as={type === 'membrane' ? Shield : Activity} boxSize={5} />
            <Text fontWeight="medium">
              {getDisplayValue()}
            </Text>
            <Tooltip label={getTooltipDescription(type)}>
              <Box as="span" cursor="help">
                <Icon as={Info} boxSize={4} color="gray.500" />
              </Box>
            </Tooltip>
          </HStack>
          <Badge colorScheme="purple">{signal.supporters.length} supporters</Badge>
        </HStack>
        
        <VStack align="stretch" spacing={2}>
          <Tooltip label={`Total support: ${signal.support} / Required: ${requiredSupport.toFixed(0)}`}>
            <Box>
              <Progress
                value={supportPercentage}
                colorScheme="purple"
                size="sm"
                borderRadius="full"
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                {supportPercentage.toFixed(1)}% of required support
              </Text>
            </Box>
          </Tooltip>
          
          {!hasUserSupport && (
            <Button
              leftIcon={<Plus size={16} />}
              size="sm"
              colorScheme="purple"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onSupportSignal(type, signal.value);
              }}
              isDisabled={!nodeData?.membersOfNode?.includes(userAddress)}
            >
              Support
            </Button>
          )}
        </VStack>
      </Box>
    );
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={3}>
          Membrane Signals
        </Text>
        <VStack spacing={3} align="stretch">
          {membraneSignals.length > 0 ? (
            membraneSignals.map((signal) => (
              <SignalCard key={signal.value} signal={signal} type="membrane" />
            ))
          ) : (
            <Text color="gray.500">No membrane signals found</Text>
          )}
        </VStack>
      </Box>
      
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={3}>
          Inflation Signals
        </Text>
        <VStack spacing={3} align="stretch">
          {inflationSignals.length > 0 ? (
            inflationSignals.map((signal) => (
              <SignalCard key={signal.value} signal={signal} type="inflation" />
            ))
          ) : (
            <Text color="gray.500">No inflation signals found</Text>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default SignalValueSection;