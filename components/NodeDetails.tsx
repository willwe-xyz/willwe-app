import React, { useState, useEffect, useCallback } from 'react';
import './NodeDetails.module.css';
import {
  Box,
  VStack,
  Skeleton,
  Alert,
  AlertIcon,
  Text,
  useColorModeValue,
  useDisclosure,
  Badge,
  HStack,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  ButtonGroup,
  IconButton,
  Tooltip,
  Divider,
} from "@chakra-ui/react";
import { usePrivy } from '@privy-io/react-auth';
import { useNodeData } from '../hooks/useNodeData';
import { NodeOperations } from './Node/NodeOperations';
import SignalForm from './Node/SignalForm/index';
import NodeInfo from './Node/NodeInfo';
import { SignalHistory } from './Node/SignalHistory';
import { Movements } from './Node/Movements';
import { ActivitySection } from './Node/ActivitySection';
import { Chat } from './Node/Chat';
import { MyEndpoint } from './Node/MyEndpoint';

import { 
  Signal, 
  Activity,
  MessageCircle,
  ArrowUpDown,
  Plus,
  ArrowRight,
  GitBranch,
  Monitor,
} from 'lucide-react';

interface NodeDetailsProps {
  chainId: string;
  nodeId: string;
  selectedTokenColor: string;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({
  chainId,
  nodeId,
  selectedTokenColor,
}) => {
  const { user } = usePrivy();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const cleanChainId = chainId?.replace('eip155:', '') || '';
  const { data: nodeData, error, isLoading, refetch: fetchNodeData } = useNodeData(cleanChainId, user?.wallet?.address, nodeId);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const permissionsBg = useColorModeValue('gray.50', 'gray.900');

  const refetch = useCallback(() => {
    fetchNodeData();
  }, [fetchNodeData]);

  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch" p={6}>
        <Skeleton height="60px" />
        <Skeleton height="200px" />
        <Skeleton height="100px" />
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>Error loading node data: {error.message || 'Unknown error'}</Text>
      </Alert>
    );
  }

  if (!nodeData?.basicInfo) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Text>No data available for this node</Text>
      </Alert>
    );
  }

  return (
    <Box
      borderRadius="xl"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      maxHeight="calc(100vh - 200px)"
      display="flex"
      flexDirection="column"
      shadow="md"
    >
      <Box 
        borderBottom="1px solid" 
        borderColor={borderColor}
        bg={useColorModeValue('gray.50', 'gray.900')}
        p={6}
        position="sticky"
        top={0}
        zIndex={1}
      >
        <NodeInfo 
          node={nodeData} 
          chainId={chainId}
        />
      </Box>

      <NodeOperations
  nodeId={nodeId}
  chainId={chainId}
  selectedTokenColor={selectedTokenColor}
  userAddress={user?.wallet?.address}
  onSuccess={refetch}
  showToolbar={true}
/>

      <Box flex="1" overflow="auto">
        <Tabs 
          className="tabs"
          sx={{
            '.chakra-tabs__tab-panel': {
              p: 0
            }
          }}
        >
          <TabList 
            px={6} 
            borderBottomColor={borderColor}
            bg={useColorModeValue('gray.50', 'gray.900')}
          >
            <Tab><HStack spacing={2}><ArrowUpDown size={14} /><Text>Signals</Text></HStack></Tab>
            <Tab><HStack spacing={2}><ArrowRight size={14} /><Text>Movements</Text></HStack></Tab>
            <Tab><HStack spacing={2}><Activity size={14} /><Text>Activity</Text></HStack></Tab>
            <Tab><HStack spacing={2}><MessageCircle size={14} /><Text>Chat</Text></HStack></Tab>
            <Tab><HStack spacing={2}><Monitor size={14} /><Text>My Endpoint</Text></HStack></Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={6}>
              <VStack align="stretch" spacing={8} maxW="900px" mx="auto">
                {nodeData?.basicInfo && (
                  <>
                    <SignalForm
                      chainId={cleanChainId}
                      nodeId={nodeId}
                      parentNodeData={nodeData}
                      onSuccess={refetch}
                    />
                   
                  </>
                )}
              </VStack>
            </TabPanel>

            <TabPanel p={6}>
              <Box maxW="900px" mx="auto">
                <Movements />
              </Box>
            </TabPanel>

            <TabPanel p={6}>
              <Box maxW="900px" mx="auto">
              <ActivitySection 
                signals={nodeData.signals} 
                selectedTokenColor={selectedTokenColor}
              />
              </Box>
            </TabPanel>

            <TabPanel p={6}>
              <Box maxW="900px" mx="auto">
                <Chat />
              </Box>
            </TabPanel>

            <TabPanel p={6}>
              <Box maxW="900px" mx="auto">
                <MyEndpoint nodeData={nodeData}  chainId={chainId} onSuccess={refetch} />
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {user?.wallet?.address && (
        <Box 
          p={6} 
          bg={permissionsBg}
          borderTop="1px solid"
          borderColor={borderColor}
          position="sticky"
          bottom={0}
          zIndex={1}
        >
          <HStack justify="space-between" align="center">
            <Text fontWeight="medium">Permissions</Text>
            <HStack spacing={2} wrap="wrap">
              <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">Mint</Badge>
              <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">Burn</Badge>
              <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">Signal</Badge>
              <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">Redistribute</Badge>
            </HStack>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default NodeDetails;