import React from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Center,
  Icon,
} from '@chakra-ui/react';
import { Shield, Activity, ArrowUpDown, Users, AlertCircle } from 'lucide-react';
import { useNodeConfigSignals } from '../../../hooks/useNodeSignals';

interface ExistingSignalsTabProps {
  nodeId: string;
  chainId: string;
  onSelectMembrane?: (membraneId: string) => void;
  onSelectInflation?: (inflationRate: string) => void;
}

const ExistingSignalsTab: React.FC<ExistingSignalsTabProps> = ({
  nodeId,
  chainId,
  onSelectMembrane,
  onSelectInflation,
}) => {
  const { data, isLoading, error } = useNodeConfigSignals(nodeId, chainId);
  
  // Debug logs
  console.log('ExistingSignalsTab data:', data);
  console.log('ExistingSignalsTab signals:', data?.signals);
  console.log('ExistingSignalsTab raw signals:', data?.raw);
  console.log('ExistingSignalsTab membrane signals:', data?.signals?.membrane);
  console.log('ExistingSignalsTab inflation signals:', data?.signals?.inflation);
  console.log('ExistingSignalsTab redistribution signals:', data?.signals?.redistribution);
  console.log('ExistingSignalsTab other signals:', data?.signals?.other);
  console.log('ExistingSignalsTab isLoading:', isLoading);
  console.log('ExistingSignalsTab error:', error);
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('purple.50', 'purple.900');
  
  // Loading state
  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="md" color="purple.500" />
        <Text mt={2}>Loading existing signals...</Text>
      </Box>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Box p={6} textAlign="center">
        <Center mb={4}>
          <Icon as={AlertCircle} boxSize={10} color="purple.500" />
        </Center>
        <Text fontSize="lg" fontWeight="medium" mb={2}>
          Error loading signals
        </Text>
        <Text color="gray.500">
          {error.message || 'Failed to load signals'}
        </Text>
      </Box>
    );
  }
  
  // No data state
  if (!data) {
    return (
      <Box p={6} textAlign="center">
        <Center mb={4}>
          <Icon as={AlertCircle} boxSize={10} color="purple.500" />
        </Center>
        <Text fontSize="lg" fontWeight="medium" mb={2}>
          No signals found
        </Text>
        <Text color="gray.500">
          This node doesn&apos;t have any signals yet. Be the first to submit a signal!
        </Text>
      </Box>
    );
  }
  
  // Helper function to format signal value based on type
  const formatSignalValue = (signal: any) => {
    if (!signal) return 'Unknown';
    
    switch (signal.signalType) {
      case 'membrane':
        return `Membrane ${signal.signalValue}`;
      case 'inflation':
        return `${signal.signalValue} gwei/sec`;
      case 'redistribution':
        return `Preference ${signal.signalValue}`;
      default:
        return signal.signalValue || 'Unknown';
    }
  };

  // Helper function to get current prevalence
  const getCurrentPrevalence = (signal: any) => {
    if (!signal) return '0';
    return signal.currentPrevalence || signal.totalStrength || '0';
  };

  // Helper function to get supporters count
  const getSupportersCount = (signal: any) => {
    if (!signal) return '0 supporters';
    if (signal.supporters && Array.isArray(signal.supporters)) {
      return signal.supporters.length === 1 ? '1 supporter' : `${signal.supporters.length} supporters`;
    }
    return '1 supporter';
  };
  
  return (
    <Box width="100%" borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Tabs variant="enclosed" colorScheme="purple">
        <TabList>
          <Tab>
            <HStack spacing={2}>
              <Shield size={14} />
              <Text>Membranes</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <Activity size={14} />
              <Text>Inflation</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <ArrowUpDown size={14} />
              <Text>Redistribution</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <Users size={14} />
              <Text>Other</Text>
            </HStack>
          </Tab>
        </TabList>
        
        <TabPanels>
          {/* Membranes Tab */}
          <TabPanel p={4}>
            {Object.keys(data.signals.membrane).length === 0 && data.raw.membraneSignals.length === 0 ? (
              <Text color="gray.500">No membrane signals found</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {Object.keys(data.signals.membrane).length > 0 ? (
                  Object.entries(data.signals.membrane).map(([membraneId, info]) => (
                    <Box 
                      key={membraneId}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: hoverBg }}
                      onClick={() => onSelectMembrane && onSelectMembrane(membraneId)}
                    >
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Membrane {membraneId}</Text>
                        <Badge colorScheme="purple">{getSupportersCount(info)}</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Total Strength: {data.signals.membrane[membraneId].totalStrength}
                      </Text>
                    </Box>
                  ))
                ) : (
                  data.raw.membraneSignals.map((signal: any) => (
                    <Box 
                      key={signal.id}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: hoverBg }}
                      onClick={() => onSelectMembrane && onSelectMembrane(signal.signalValue)}
                    >
                      <HStack justify="space-between">
                        <Text fontWeight="medium">{formatSignalValue(signal)}</Text>
                        <Badge colorScheme="purple">1 supporter</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Current Prevalence: {getCurrentPrevalence(signal)}
                      </Text>
                    </Box>
                  ))
                )}
              </VStack>
            )}
          </TabPanel>
          
          {/* Inflation Tab */}
          <TabPanel p={4}>
            {Object.keys(data.signals.inflation).length === 0 && data.raw.inflationSignals.length === 0 ? (
              <Text color="gray.500">No inflation signals found</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {Object.keys(data.signals.inflation).length > 0 ? (
                  Object.entries(data.signals.inflation).map(([rate, info]) => (
                    <Box 
                      key={rate}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: hoverBg }}
                      onClick={() => onSelectInflation && onSelectInflation(rate)}
                    >
                      <HStack justify="space-between">
                        <Text fontWeight="medium">{rate} gwei/sec</Text>
                        <Badge colorScheme="purple">{getSupportersCount(info)}</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Total Strength: {data.signals.inflation[rate].totalStrength}
                      </Text>
                    </Box>
                  ))
                ) : (
                  data.raw.inflationSignals.map((signal: any) => (
                    <Box 
                      key={signal.id}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: hoverBg }}
                      onClick={() => onSelectInflation && onSelectInflation(signal.signalValue)}
                    >
                      <HStack justify="space-between">
                        <Text fontWeight="medium">{formatSignalValue(signal)}</Text>
                        <Badge colorScheme="purple">1 supporter</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Current Prevalence: {getCurrentPrevalence(signal)}
                      </Text>
                    </Box>
                  ))
                )}
              </VStack>
            )}
          </TabPanel>
          
          {/* Redistribution Tab */}
          <TabPanel p={4}>
            {Object.keys(data.signals.redistribution).length === 0 && data.raw.redistributionPreferences.length === 0 ? (
              <Text color="gray.500">No redistribution signals found</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {Object.keys(data.signals.redistribution).length > 0 ? (
                  Object.entries(data.signals.redistribution).map(([pref, info]) => (
                    <Box 
                      key={pref}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                    >
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Preference {pref}</Text>
                        <Badge colorScheme="purple">{getSupportersCount(info)}</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Total Strength: {data.signals.redistribution[pref].totalStrength}
                      </Text>
                    </Box>
                  ))
                ) : (
                  data.raw.redistributionPreferences.map((signal: any) => (
                    <Box 
                      key={signal.id}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                    >
                      <HStack justify="space-between">
                        <Text fontWeight="medium">{formatSignalValue(signal)}</Text>
                        <Badge colorScheme="purple">1 supporter</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Current Prevalence: {getCurrentPrevalence(signal)}
                      </Text>
                    </Box>
                  ))
                )}
              </VStack>
            )}
          </TabPanel>

          {/* Other Signals Tab */}
          <TabPanel p={4}>
            {Object.keys(data.signals.other).length === 0 ? (
              <Text color="gray.500">No other signals found</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {Object.entries(data.signals.other).map(([key, info]: [string, any]) => (
                  <Box 
                    key={key}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                  >
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Signal: {info.value}</Text>
                      <Badge colorScheme="purple">{getSupportersCount(info)}</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Total Strength: {info.totalStrength}
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ExistingSignalsTab; 