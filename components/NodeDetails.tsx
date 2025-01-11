import React, { useMemo } from 'react';
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
import { ActivitySection } from './Node/Activity';
import { Chat } from './Node/Chat';
import { 
  Signal, 
  Activity,
  MessageCircle,
  ArrowUpDown,
  Plus,
  PlusCircle,
  Share2,
  ArrowRight,
  Shuffle,
  GitBranch,
  Shield,
  UserPlus,
  Trash,
  RefreshCw,
} from 'lucide-react';

interface NodeDetailsProps {
  chainId: string;
  nodeId: string;
  onNodeSelect?: (nodeId: string) => void;
  selectedTokenColor: string;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({
  chainId,
  nodeId,
  onNodeSelect,
  selectedTokenColor,
}) => {
  // Hooks
  const { user } = usePrivy();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Clean chain ID
  const cleanChainId = chainId?.replace('eip155:', '') || '';

  // Style hooks
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const permissionsBg = useColorModeValue('gray.50', 'gray.900');

  // Fetch node data
  const { data: nodeData, error, isLoading, refetch } = useNodeData(cleanChainId, nodeId);

  // Loading state
  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch" p={6}>
        <Skeleton height="60px" />
        <Skeleton height="200px" />
        <Skeleton height="100px" />
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>Error loading node data: {error.message || 'Unknown error'}</Text>
      </Alert>
    );
  }

  // No data state
  if (!nodeData?.basicInfo) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Text>No data available for this node</Text>
      </Alert>
    );
  }

  const tokenSymbol = nodeData?.basicInfo[1];


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
      {/* Node Info Section with improved styling */}
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
          onNodeSelect={onNodeSelect}
        />
      </Box>

      {/* Operations Toolbar */}
      <NodeOperations
        nodeId={nodeId}
        chainId={chainId}
        selectedTokenColor={selectedTokenColor}
        onSuccess={refetch}
      />

      {/* Main Content */}
      <Box flex="1" overflow="auto">
        <Tabs 
          variant="enclosed" 
          colorScheme="purple"
          isLazy
          sx={{
            '.chakra-tabs__tab': {
              fontWeight: 'medium',
              px: 6,
              py: 3,
              _selected: {
                bg: useColorModeValue('white', 'gray.800'),
                borderColor: 'inherit',
                borderBottom: 'none',
                color: 'purple.500'
              },
              _hover: {
                bg: useColorModeValue('gray.100', 'gray.700')
              }
            },
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
                    {nodeData.signals.length > 0 && (
                      <SignalHistory 
                        signals={nodeData.signals} 
                        selectedTokenColor={selectedTokenColor}
                      />
                    )}
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
                <ActivitySection />
              </Box>
            </TabPanel>

            <TabPanel p={6}>
              <Box maxW="900px" mx="auto">
                <Chat />
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Permissions Footer with improved styling */}
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