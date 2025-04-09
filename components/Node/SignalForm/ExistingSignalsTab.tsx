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
          No signals found
        </Text>
        <Text color="gray.500">
          This node doesn&apos;t have any signals yet. Be the first to submit a signal!
        </Text>
      </Box>
    );
  }
  
  // No data state
  if (!data || !data.signals) {
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
  
  // Helper function to format supporter count
  const formatSupporterCount = (supporters: string[]) => {
    return supporters.length === 1 
      ? '1 supporter' 
      : `${supporters.length} supporters`;
  };
  
  // Helper function to format total strength
  const formatTotalStrength = (strength: string) => {
    try {
      const num = parseFloat(strength);
      return isNaN(num) ? '0' : num.toLocaleString();
    } catch (e) {
      return '0';
    }
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
        </TabList>
        
        <TabPanels>
          {/* Membranes Tab */}
          <TabPanel p={4}>
            {Object.keys(data.signals.membrane).length === 0 ? (
              <Text color="gray.500">No membrane signals found</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {Object.entries(data.signals.membrane).map(([membraneId, info]) => (
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
                      <Badge colorScheme="purple">{formatSupporterCount(info.supporters)}</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Total Strength: {formatTotalStrength(info.totalStrength)}
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
          </TabPanel>
          
          {/* Inflation Tab */}
          <TabPanel p={4}>
            {Object.keys(data.signals.inflation).length === 0 ? (
              <Text color="gray.500">No inflation signals found</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {Object.entries(data.signals.inflation).map(([rate, info]) => (
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
                      <Badge colorScheme="purple">{formatSupporterCount(info.supporters)}</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Total Strength: {formatTotalStrength(info.totalStrength)}
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
          </TabPanel>
          
          {/* Redistribution Tab */}
          <TabPanel p={4}>
            {Object.keys(data.signals.redistribution).length === 0 ? (
              <Text color="gray.500">No redistribution signals found</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {Object.entries(data.signals.redistribution).map(([pref, info]) => (
                  <Box 
                    key={pref}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                  >
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Preference {pref}</Text>
                      <Badge colorScheme="purple">{formatSupporterCount(info.supporters)}</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Total Strength: {formatTotalStrength(info.totalStrength)}
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