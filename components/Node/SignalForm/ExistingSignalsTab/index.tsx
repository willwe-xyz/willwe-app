import React, { useState, useCallback } from 'react';
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
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Center,
  Icon,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Shield, Activity, ArrowUpDown, AlertCircle } from 'lucide-react';
import { useNodeData } from '../../../../hooks/useNodeData';
import { useNodeTransactions } from '../../../../hooks/useNodeTransactions';
import SignalValueSection from './SignalValueSection';
import RedistributionSection from './RedistributionSection';
import SignalDetailsModal from './SignalDetailsModal';
import { SignalValue } from './types';
import { useAppKit } from '../../../../hooks/useAppKit';

interface ExistingSignalsTabProps {
  nodeId: string;
  chainId: string;
  onSelectMembrane?: (membraneId: string) => void;
  onSelectInflation?: (inflationRate: string) => void;
  tokenSymbol?: string;
}

const ExistingSignalsTab: React.FC<ExistingSignalsTabProps> = ({
  nodeId,
  chainId,
  onSelectMembrane,
  onSelectInflation,
  tokenSymbol = 'PSC'
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSignal, setSelectedSignal] = useState<SignalValue | null>(null);
  const [selectedSignalType, setSelectedSignalType] = useState<'membrane' | 'inflation' | 'redistribution'>('membrane');
  const { user } = useAppKit();
  const userAddress = user?.wallet?.address || '';
  const toast = useToast();
  
  // Get node data
  const { data: nodeData, isLoading, error } = useNodeData(chainId, userAddress, nodeId);
  const { signal } = useNodeTransactions(chainId);
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleSignalClick = (signal: SignalValue, type: 'membrane' | 'inflation' | 'redistribution') => {
    setSelectedSignal(signal);
    setSelectedSignalType(type);
    onOpen();
  };

  // Support an existing signal
  const handleSupportSignal = useCallback(async (signalType: 'membrane' | 'inflation', value: string) => {
    if (!userAddress) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to support signals',
        status: 'warning',
      });
      return;
    }

    try {
      toast({
        title: 'Processing',
        description: 'Preparing to support signal...',
        status: 'info',
        duration: 3000,
      });

      // Get user's last signal if available
      let lastSignalArray: string[] = [];
      
      if (nodeData && nodeData.nodeSignals) {
        // Find if the user has any existing signals
        const userIndex = nodeData.nodeSignals.signalers.findIndex(
          (addr: string) => addr.toLowerCase() === userAddress.toLowerCase()
        );

        if (userIndex >= 0) {
          // Copy membrane signal
          if (nodeData.nodeSignals.membraneSignals[userIndex] && nodeData.nodeSignals.membraneSignals[userIndex][0]) {
            lastSignalArray[0] = nodeData.nodeSignals.membraneSignals[userIndex][0];
          } else {
            lastSignalArray[0] = '0';
          }
          
          // Copy inflation signal
          if (nodeData.nodeSignals.inflationSignals[userIndex] && nodeData.nodeSignals.inflationSignals[userIndex][0]) {
            lastSignalArray[1] = nodeData.nodeSignals.inflationSignals[userIndex][0];
          } else {
            lastSignalArray[1] = '0';
          }
          
          // Copy redistribution signals
          if (nodeData.nodeSignals.redistributionSignals[userIndex]) {
            lastSignalArray = [
              ...lastSignalArray,
              ...nodeData.nodeSignals.redistributionSignals[userIndex]
            ];
          }
        } else {
          // No existing signals, initialize with zeros
          lastSignalArray = ['0', '0'];
          
          // Equal distribution for children if no previous signal
          if (nodeData.childrenNodes && nodeData.childrenNodes.length > 0) {
            const equalShare = Math.floor(10000 / nodeData.childrenNodes.length);
            const remainder = 10000 - (equalShare * nodeData.childrenNodes.length);
            
            nodeData.childrenNodes.forEach((_: string, index: number) => {
              lastSignalArray.push(
                // Add remainder to the first child if needed
                index === 0 ? (equalShare + remainder).toString() : equalShare.toString()
              );
            });
          }
        }
      }
      
      // Replace the specific signal type value
      if (signalType === 'membrane') {
        lastSignalArray[0] = value;
      } else if (signalType === 'inflation') {
        lastSignalArray[1] = value;
      }

      // Send the signal transaction
      await signal(nodeId, lastSignalArray.map(String), () => {
        toast({
          title: 'Success',
          description: `Successfully supported ${signalType} signal`,
          status: 'success',
          duration: 5000,
        });
      });
    } catch (error: any) {
      console.error('Error supporting signal:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to support signal',
        status: 'error',
        duration: 5000,
      });
    }
  }, [nodeData, nodeId, signal, toast, userAddress]);

  // Support an existing redistribution signal
  const handleSupportRedistribution = useCallback(async (originator: string) => {
    if (!userAddress) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to support signals',
        status: 'warning',
      });
      return;
    }

    try {
      toast({
        title: 'Processing',
        description: 'Preparing to support redistribution signal...',
        status: 'info',
        duration: 3000,
      });

      // Find the originator's signal to copy
      const originatorIndex = nodeData.nodeSignals.signalers.findIndex(
        (addr: string) => addr.toLowerCase() === originator.toLowerCase()
      );

      if (originatorIndex === -1) {
        throw new Error('Original signal not found');
      }

      // Start with membrane and inflation signals (either from user or default)
      let signalArray: string[] = [];
      
      // Find if the user has any existing signals for membrane/inflation
      const userIndex = nodeData.nodeSignals.signalers.findIndex(
        (addr: string) => addr.toLowerCase() === userAddress.toLowerCase()
      );

      if (userIndex >= 0) {
        // Copy user's existing membrane signal
        if (nodeData.nodeSignals.membraneSignals[userIndex] && nodeData.nodeSignals.membraneSignals[userIndex][0]) {
          signalArray[0] = nodeData.nodeSignals.membraneSignals[userIndex][0];
        } else {
          signalArray[0] = '0';
        }
        
        // Copy user's existing inflation signal
        if (nodeData.nodeSignals.inflationSignals[userIndex] && nodeData.nodeSignals.inflationSignals[userIndex][0]) {
          signalArray[1] = nodeData.nodeSignals.inflationSignals[userIndex][0];
        } else {
          signalArray[1] = '0';
        }
      } else {
        // No existing signals, initialize with zeros
        signalArray = ['0', '0'];
      }
      
      // Copy redistribution signals from the originator
      if (nodeData.nodeSignals.redistributionSignals[originatorIndex]) {
        signalArray = [
          ...signalArray,
          ...nodeData.nodeSignals.redistributionSignals[originatorIndex]
        ];
      }

      // Send the signal transaction
      await signal(nodeId, signalArray.map(String), () => {
        toast({
          title: 'Success',
          description: 'Successfully supported redistribution signal',
          status: 'success',
          duration: 5000,
        });
      });
    } catch (error: any) {
      console.error('Error supporting redistribution signal:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to support redistribution signal',
        status: 'error',
        duration: 5000,
      });
    }
  }, [nodeData, nodeId, signal, toast, userAddress]);
  
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
  if (!nodeData) {
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
  
  return (
    <Box width="100%" borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Tabs variant="enclosed" colorScheme="purple">
        <TabList>
          <Tab>
            <HStack spacing={2}>
              <Shield size={14} />
              <Activity size={14} />
              <Text>Configuration</Text>
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
          {/* Signals Tab */}
          <TabPanel p={4}>
            <SignalValueSection
              nodeId={nodeId}
              chainId={chainId}
              nodeData={nodeData}
              userAddress={userAddress}
              onSupportSignal={handleSupportSignal}
              onSignalClick={handleSignalClick}
              tokenSymbol={tokenSymbol}
            />
          </TabPanel>
          
          {/* Redistribution Tab */}
          <TabPanel p={4}>
            <RedistributionSection
              nodeId={nodeId}
              chainId={chainId}
              nodeData={nodeData}
              userAddress={userAddress}
              onSupportRedistribution={handleSupportRedistribution}
              onSignalClick={handleSignalClick}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Signal Details Modal */}
      {selectedSignal && (
        <SignalDetailsModal
          isOpen={isOpen}
          onClose={onClose}
          signal={selectedSignal}
          signalType={selectedSignalType}
          totalSupply={nodeData.basicInfo[11]}
        />
      )}
    </Box>
  );
};

export default ExistingSignalsTab;