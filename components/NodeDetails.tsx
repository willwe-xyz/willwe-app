import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { getRPCUrl } from '../utils/getRPCUrl';
import { ERC20_ABI } from '../constants/ABIs';

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
  const [tokenSymbol, setTokenSymbol] = useState<string>('$TOKEN');
  
  const cleanChainId = chainId?.replace('eip155:', '') || '';
  const userAddress = user?.wallet?.address || ethers.ZeroAddress;
  const { data: nodeData, error, isLoading, refetch: fetchNodeData } = useNodeData(cleanChainId, userAddress, nodeId);
  
  // Initialize provider and token contract
  const provider = useMemo(() => {
    return new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
  }, [cleanChainId]);

  // Get token address from root path
  const tokenAddress = useMemo(() => {
    if (!nodeData?.rootPath?.[0]) return ethers.ZeroAddress;
    return nodeIdToAddress(nodeData.rootPath[0]);
  }, [nodeData]);

  const tokenContract = useMemo(() => {
    return new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      provider
    );
  }, [tokenAddress, provider]);

  // Fetch token symbol
  useEffect(() => {
    const fetchTokenSymbol = async () => {
      if (!nodeData?.rootPath?.[0] || !cleanChainId) return;

      try {
        const code = await provider.getCode(tokenAddress);
        if (code === '0x') {
          setTokenSymbol('$TOKEN');
          return;
        }

        const symbol = await tokenContract.symbol();
        setTokenSymbol(symbol);
      } catch (error) {
        console.error('Error fetching token symbol:', error);
        setTokenSymbol('$TOKEN');
      }
    };

    fetchTokenSymbol();
  }, [nodeData, cleanChainId, provider, tokenContract, tokenAddress]);
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.900');
  const tabBg = useColorModeValue('gray.50', 'gray.800');
  const tabActiveBg = useColorModeValue('white', 'gray.700');
  const tabHoverBg = useColorModeValue('gray.100', 'gray.600');
  
  const refetch = useCallback(() => {
    fetchNodeData();
  }, [fetchNodeData]);

  // Check if node is an endpoint
  const isEndpoint = nodeData?.basicInfo && 
    nodeData.rootPath && 
    nodeData.rootPath.length > 0 && 
    nodeData.basicInfo[0] && 
    nodeData.rootPath[0].toString().slice(0, 12) !== nodeData.basicInfo[0].toString().slice(0, 12);

  // Loading state
  if (isLoading) {
    return (
      <Box p={6}>
        <VStack 
          spacing={4} 
          align="stretch"
          bg={bgColor}
          borderRadius="xl"
          shadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
          p={6}
        >
          <Skeleton height="60px" borderRadius="lg" />
          <Skeleton height="40px" borderRadius="lg" />
          <Skeleton height="200px" borderRadius="lg" />
          <Skeleton height="100px" borderRadius="lg" />
        </VStack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={6}>
        <Alert 
          status="error" 
          borderRadius="xl"
          bg={bgColor}
          shadow="sm"
          borderWidth="1px"
          borderColor="red.100"
        >
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
        <Alert 
          status="warning" 
          borderRadius="xl"
          bg={bgColor}
          shadow="sm"
          borderWidth="1px"
          borderColor="orange.100"
        >
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
          borderRadius="xl"
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
            <NodeInfo node={nodeData} chainId={chainId} selectedTokenColor={selectedTokenColor} tokenSymbol={tokenSymbol} />
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
        borderRadius="xl"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
        overflow="hidden"
      >
        {/* Node header with basic info */}
        <Box 
          p={6}
          bg={headerBg}
          borderBottomWidth="1px"
          borderColor={borderColor}
          position="relative"
        >
          <NodeInfo 
            node={nodeData} 
            chainId={chainId} 
            selectedTokenColor={selectedTokenColor}
            tokenSymbol={tokenSymbol}
          />
          {/* Theme color line */}
          <Box 
            position="absolute" 
            bottom={0} 
            left={0} 
            right={0} 
            height="2px" 
            bg={selectedTokenColor}
            opacity={0.8}
          />
        </Box>
        
        {/* Node operations toolbar */}
        <Box 
          borderBottomWidth="1px"
          borderColor={borderColor}
          bg={headerBg}
          px={6}
          py={3}
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
        <Tabs 
          variant="enclosed" 
          sx={{
            '.chakra-tabs__tab': {
              bg: tabBg,
              borderBottomWidth: '2px',
              _selected: {
                bg: tabActiveBg,
                borderBottomColor: selectedTokenColor,
                color: selectedTokenColor,
                fontWeight: 'semibold'
              },
              _hover: {
                bg: tabHoverBg,
                color: selectedTokenColor
              }
            },
            '.chakra-tabs__tab-panel': {
              bg: tabActiveBg
            }
          }}
        >
          <TabList px={6} pt={4}>
            <Tab>
              <HStack spacing={2}>
                <Activity size={16} style={{ color: selectedTokenColor }} />
                <Text>Activity</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <ArrowUpDown size={16} style={{ color: selectedTokenColor }} />
                <Text>Movements</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Signal size={16} style={{ color: selectedTokenColor }} />
                <Text>Signals</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <MessageCircle size={16} style={{ color: selectedTokenColor }} />
                <Text>Chat</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <GitBranch size={16} style={{ color: selectedTokenColor }} />
                <Text>Endpoint</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels bg={tabActiveBg}>
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
                tokenSymbol={tokenSymbol}
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
      </Box>
    </Box>
  );
};

export default NodeDetails;