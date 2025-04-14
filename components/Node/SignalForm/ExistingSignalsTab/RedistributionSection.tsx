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
  Divider,
} from '@chakra-ui/react';
import { ArrowUpDown, Plus, Info } from 'lucide-react';
import { SignalValue } from './types';

interface RedistributionSectionProps {
  nodeId: string;
  chainId: string;
  nodeData: any;
  userAddress: string;
  onSupportRedistribution: (originator: string) => Promise<void>;
  onSignalClick: (signal: SignalValue, type: 'membrane' | 'inflation' | 'redistribution') => void;
}

const RedistributionSection: React.FC<RedistributionSectionProps> = ({
  nodeId,
  chainId,
  nodeData,
  userAddress,
  onSupportRedistribution,
  onSignalClick,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('purple.50', 'purple.900');

  // Process redistribution signals
  const processRedistributionSignals = () => {
    const signals = nodeData.nodeSignals.redistributionSignals;
    const signalers = nodeData.nodeSignals.signalers;
    
    return signalers.map((signaler: string, index: number) => {
      const signal = signals[index];
      if (!signal || signal.length === 0) return null;
      
      // Calculate total support for this user's signal
      const totalSupport = signal.reduce((sum: number, val: string) => sum + Number(val), 0);
      
      // Skip signals with zero total support (no signal expressed)
      if (totalSupport === 0) return null;
      
      // Map each element in the signal array to a percentage
      const preferences = signal.map((val: string, idx: number) => ({
        value: val.toString(),
        percentage: totalSupport > 0 ? (Number(val) / totalSupport) * 100 : 0,
        targetNodeId: nodeData.childrenNodes[idx] || '',
      }));
      
      return {
        address: signaler,
        totalSupport: totalSupport.toString(),
        preferences,
      };
    }).filter(Boolean);
  };

  // Debug log to see the structure of signal data
  console.log('Redistribution signals raw:', nodeData.nodeSignals.redistributionSignals);
  
  const redistributionSignals = processRedistributionSignals();
  console.log('Processed redistribution signals:', redistributionSignals);
  
  // Calculate total redistribution value
  const totalRedistribution = redistributionSignals.reduce(
    (sum: number, signal: any) => sum + Number(signal.totalSupport),
    0
  );
  
  // Calculate total parent inflow + child eligibility
  const totalInflow = nodeData.basicInfo[7] ? Number(nodeData.basicInfo[7]) : 0; // eligibilityPerSec from parent
  const childEligibility = nodeData.childrenNodes.reduce((sum: number, child: string) => {
    // In a real implementation, you would calculate each child's eligibility
    // For now we use a placeholder value
    return sum + 1; // Placeholder for child eligibility
  }, 0);
  
  const totalPotential = totalInflow + childEligibility;

  const RedistributionCard = ({ signal }: { signal: any }) => {
    const hasUserSupport = signal.address === userAddress;
    const influencePercentage = totalRedistribution > 0 
      ? (Number(signal.totalSupport) / totalRedistribution) * 100 
      : 0;
    
    // Create a signal value object to pass to the modal
    const signalValueObj: SignalValue = {
      value: 'redistribution',
      support: signal.totalSupport,
      supporters: [{ address: signal.address, support: signal.totalSupport }]
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
        onClick={() => onSignalClick(signalValueObj, 'redistribution')}
      >
        <HStack justify="space-between" mb={3}>
          <HStack>
            <Icon as={ArrowUpDown} boxSize={5} />
            <Text fontWeight="medium" isTruncated maxW="200px">
              {signal.address.substring(0, 8)}...{signal.address.substring(signal.address.length - 6)}
            </Text>
            <Tooltip label="This is this member's preference for how value should be redistributed among child nodes. The percentage shows their influence on the overall redistribution.">
              <Box as="span" cursor="help">
                <Icon as={Info} boxSize={4} color="gray.500" />
              </Box>
            </Tooltip>
          </HStack>
          <Badge colorScheme="purple">
            {influencePercentage.toFixed(1)}% influence
          </Badge>
        </HStack>
        
        <VStack align="stretch" spacing={2}>
          <Tooltip label="Distribution of support across child nodes">
            <Box>
              <HStack spacing={0} height="20px" borderRadius="full" overflow="hidden">
                {signal.preferences.map((pref: any, index: number) => (
                  <Box
                    key={index}
                    bg={`hsl(${index * 30}, 70%, 50%)`}
                    width={`${pref.percentage}%`}
                    height="100%"
                    title={`${pref.targetNodeId}: ${pref.percentage.toFixed(1)}%`}
                  />
                ))}
              </HStack>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Distribution across {signal.preferences.length} children
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
                onSupportRedistribution(signal.address);
              }}
            >
              Support
            </Button>
          )}
        </VStack>
      </Box>
    );
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Total Redistribution Overview */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={3}>
          Total Redistribution
          <Tooltip label="This shows how all member signals combine to determine the overall redistribution of value to child nodes. The total represents the combined voting power of all members.">
            <Box as="span" cursor="help" ml={2}>
              <Icon as={Info} boxSize={4} color="gray.500" />
            </Box>
          </Tooltip>
        </Text>
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="md"
          bg={bgColor}
          borderColor={borderColor}
        >
          <HStack justify="space-between" mb={3}>
            <Text fontWeight="medium">Member Influence</Text>
            <Badge colorScheme="purple">
              {redistributionSignals.length} contributing members
            </Badge>
          </HStack>
          
          <Tooltip label="Distribution of influence across members. Larger sections represent members with more influence over redistribution.">
            <Box>
              <HStack spacing={0} height="24px" borderRadius="full" overflow="hidden">
                {redistributionSignals.map((signal: any, index: number) => {
                  const width = totalRedistribution > 0 
                    ? (Number(signal.totalSupport) / totalRedistribution) * 100 
                    : 0;
                  return (
                    <Box
                      key={index}
                      bg={`hsl(${index * 30}, 70%, 50%)`}
                      width={`${width}%`}
                      height="100%"
                      title={`${signal.address}: ${width.toFixed(1)}%`}
                    />
                  );
                })}
              </HStack>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Total voting power: {totalRedistribution.toLocaleString()}
              </Text>
            </Box>
          </Tooltip>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Individual Redistribution Signals */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={3}>
          Individual Signals
        </Text>
        <VStack spacing={3} align="stretch">
          {redistributionSignals.length > 0 ? (
            redistributionSignals.map((signal: any, index: number) => (
              <RedistributionCard key={index} signal={signal} />
            ))
          ) : (
            <Text color="gray.500">No redistribution signals found</Text>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default RedistributionSection;