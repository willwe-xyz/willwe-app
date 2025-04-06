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
  Container,
  Divider,
  Flex,
  Heading,
  Spacer,
} from "@chakra-ui/react";
import { usePrivy } from '@privy-io/react-auth';
import { useNodeData } from '../hooks/useNodeData';
import { NodeOperations } from './Node/NodeOperations';
import SignalForm from './Node/SignalForm/index';
import NodeInfo from './Node/NodeInfo';
import { Movements } from './Node/Movements';
import { ActivitySection } from './Node/ActivitySection';
import NodeChat from './NodeChat';
import { MyEndpoint } from './Node/MyEndpoint';
import { EndpointComponent } from './Node/EndpointComponent';
import { MovementsErrorBoundary } from './Node/MovementsErrorBoundary';
import { ethers } from 'ethers';
import { NodeState } from '../types/chainData';

import { 
  Signal, 
  Activity,
  MessageCircle,
  ArrowUpDown,
  Plus,
  ArrowRight,
  GitBranch,
  Monitor,
  Info,
} from 'lucide-react';
import { nodeIdToAddress } from '../utils/formatters';

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
  // Use ZeroAddress if no user address is available
  const userAddress = user?.wallet?.address || ethers.ZeroAddress;
  const { data: nodeData, error, isLoading, refetch: fetchNodeData } = useNodeData(cleanChainId, userAddress, nodeId);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.900');
  
  const refetch = useCallback(() => {
    fetchNodeData();
  }, [fetchNodeData]);

  // Check if node is an endpoint - with proper null checks
  const isEndpoint = nodeData?.basicInfo && 
    nodeData.rootPath && 
    nodeData.rootPath.length > 0 && 
    nodeData.basicInfo.nodeId && 
    nodeData.rootPath[0].slice(0, 12) !== nodeData.basicInfo.nodeId.slice(0, 12);

  // Loading state
  if (isLoading) {
    return (
      <Box p={6}>
        <VStack spacing={4} align="stretch">
          <Skeleton height="60px" borderRadius="md" />
          <Skeleton height="40px" borderRadius="md" />
          <Skeleton height="200px" borderRadius="md" />
          <Skeleton height="100px" borderRadius="md" />
        </VStack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text>Error loading node data: {error.message || 'Unknown error'}</Text>
        </Alert>
      </Box>
    );
  }

  // No data state
  if (!nodeData?.basicInfo) {
    return (
      <Box p={6}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Text>No data available for this node</Text>
        </Alert>
      </Box>
    );
  }

  // Main content - Endpoint view
  if (isEndpoint) {
    return (
      <Box p={6}>
        <Box
          borderRadius="lg"
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
          shadow="sm"
        >
          <Box 
            p={6}
            bg={headerBg}
            borderBottomWidth="1px"
            borderColor={borderColor}
          >
            <NodeInfo node={nodeData} chainId={chainId} />
          </Box>
          
          <Box p={6}>
            <EndpointComponent 
              parentNodeId={nodeData.rootPath[nodeData.rootPath.length - 1]} 
              chainId={chainId} 
              nodeData={nodeData} 
              userAddress={userAddress} 
            />
          </Box>
        </Box>
      </Box>
    );
  }

  // Main content - Regular node view
  return (
    <Box p={6}>
      <Box
        borderRadius="lg"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
      >
        {/* Node header with basic info */}
        <Box 
          p={6}
          bg={headerBg}
          borderBottomWidth="1px"
          borderColor={borderColor}
        >
          <NodeInfo node={nodeData} chainId={chainId} />
        </Box>
        
        {/* Node operations toolbar */}
        <Box 
          borderBottomWidth="1px"
          borderColor={borderColor}
          bg={headerBg}
        >
          <NodeOperations
            nodeId={nodeId}
            chainId={chainId}
            selectedTokenColor={selectedTokenColor}
            userAddress={userAddress}
            onSuccess={refetch}
            showToolbar={true}
            isOpen={isOpen}
            onClose={onClose}
          />
        </Box>
        
        {/* Main tab navigation */}
        <Tabs variant="enclosed" colorScheme="purple">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Activity size={16} />
                <Text>Activity</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <ArrowUpDown size={16} />
                <Text>Movements</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Signal size={16} />
                <Text>Signals</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <MessageCircle size={16} />
                <Text>Chat</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <GitBranch size={16} />
                <Text>Endpoint</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Activity tab */}
            <TabPanel p={6}>
              <ActivitySection 
                nodeId={nodeId} 
                selectedTokenColor={selectedTokenColor}
              />
            </TabPanel>

            {/* Movements tab */}
            <TabPanel p={6}>
              <MovementsErrorBoundary>
                <Movements 
                  nodeId={nodeId} 
                  chainId={chainId} 
                  nodeData={nodeData}
                  userAddress={userAddress} 
                />
              </MovementsErrorBoundary>
            </TabPanel>

            {/* Signals tab */}
            <TabPanel p={6}>
              <SignalForm 
                nodeId={nodeId} 
                chainId={chainId} 
                parentNodeData={nodeData}
                onSuccess={refetch} 
              />
            </TabPanel>

            {/* Chat tab */}
            <TabPanel p={6}>
              <Box>
                <NodeChat 
                  nodeId={nodeId} 
                  nodeData={nodeData} 
                  chainId={chainId} 
                  userAddress={userAddress} 
                />
              </Box>
            </TabPanel>

            {/* Endpoint tab */}
            <TabPanel p={6}>
              <Box>
                <MyEndpoint 
                  nodeData={nodeData} 
                  chainId={chainId} 
                  userAddress={userAddress} 
                  onSuccess={refetch} 
                />
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        {/* Permissions footer - only show if user is authenticated */}
        {user?.wallet?.address && (
          <Box 
            p={4}
            borderTopWidth="1px"
            borderColor={borderColor}
            bg={headerBg}
          >
            <Flex align="center" wrap="wrap" gap={2}>
              <HStack>
                <Info size={14} />
                <Text fontSize="sm" fontWeight="medium">Permissions:</Text>
              </HStack>
              <Spacer display={["none", "block"]} />
              <HStack spacing={2} flexWrap="wrap">
                <Badge colorScheme="green" px={2} py={1} borderRadius="full">Mint</Badge>
                <Badge colorScheme="green" px={2} py={1} borderRadius="full">Burn</Badge>
                <Badge colorScheme="green" px={2} py={1} borderRadius="full">Signal</Badge>
                <Badge colorScheme="green" px={2} py={1} borderRadius="full">Redistribute</Badge>
              </HStack>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NodeDetails;