import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { 
  Box, 
  Text, 
  HStack, 
  VStack, 
  IconButton, 
  Tooltip, 
  Badge, 
  Skeleton,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import { Copy, ChevronRight } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { ABIs, getRPCUrl } from '../../config/contracts';
import { NodeState } from '../../types/chainData';
import SunburstChart from './SunburstChart';
import { nodeIdToAddress } from '../../utils/formatters';
import router from 'next/router';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface NodeInfoProps {
  node: NodeState;
  chainId: string;
  onNodeSelect?: (nodeId: string) => void;
}

interface NodeMetrics {
  inflation: string;        // basicInfo[1] - daily inflation rate
  budget: string;          // basicInfo[3] - current budget balance
  inflow: string;          // eligibilityPerSec - daily inflow from parent
  value: string;           // basicInfo[4] - total value in root token
  memberCount: number;     // membersOfNode.length
}

const calculateMetrics = (node: NodeState): NodeMetrics => {
  return {
    // Convert inflation to daily rate
    inflation: node.basicInfo[1],
    
    // Direct budget balance
    budget: node.basicInfo[3],
    
    // Convert per-second to daily rate
    inflow: (Number(node.basicInfo[7]) * 86400).toString(),
    
    // Total value
    value: node.basicInfo[4],
    
    // Member count
    memberCount: node.membersOfNode.length
  };
};

const NodeInfo: React.FC<NodeInfoProps> = ({ node, chainId, onNodeSelect }) => {
  const [membraneTitle, setMembraneTitle] = useState<string | null>(null);
  const [isLoadingTitle, setIsLoadingTitle] = useState(true);
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const toast = useToast();
  
  // Theme colors
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId), {
    chainId: Number(chainId),
    name: `${chainId}`,
  });
  const tokenAddress = nodeIdToAddress(node.rootPath[0]);


  const tokenContract = new ethers.Contract(
    tokenAddress, 
    ABIs.IERC20,
    provider
  );

  // Fetch token symbol
  useEffect(() => {
    const fetchTokenSymbol = async () => {
      if (!node?.rootPath?.[0] || !chainId) return;
      
      try {
     
        
        const symbol = await tokenContract.symbol();
        setTokenSymbol(symbol);
      } catch (error) {
        console.error('Error fetching token symbol:', error);
        setTokenSymbol('token');
      }
    };

    fetchTokenSymbol();
  }, [node?.rootPath, chainId]);

  // Load membrane metadata
  useEffect(() => {
    const fetchMembraneTitle = async () => {
      if (!node.membraneMeta) {
        setIsLoadingTitle(false);
        return;
      }

      try {
        const response = await fetch(`${IPFS_GATEWAY}${node.membraneMeta}`);
        if (!response.ok) throw new Error('Failed to fetch membrane metadata');
        const metadata = await response.json();
        setMembraneTitle(metadata.name || null);
      } catch (error) {
        console.error('Error fetching membrane title:', error);
        setMembraneTitle(null);
      } finally {
        setIsLoadingTitle(false);
      }
    };

    fetchMembraneTitle();
  }, [node.membraneMeta]);

  // Format values
  const formatCurrency = (value: string): string => {
    const number = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  // Calculate metrics
  const metrics = useMemo(() => calculateMetrics(node), [node]);

  // Handle node ID copy
  const handleCopyNodeId = () => {
    navigator.clipboard.writeText(node.basicInfo[0]);
    toast({
      title: 'Node ID copied',
      status: 'success',
      duration: 2000,
    });
  };


  

  return (
    <Box 
      p={6} 
      bg={bgColor} 
      borderRadius="lg" 
      border="1px" 
      borderColor={borderColor}
    >
      <HStack align="start" spacing={6}>
        {/* Left Section */}
        <VStack align="stretch" flex="1">
          {/* Title Section */}
          <VStack align="stretch" spacing={2} mb={6}>
            <HStack justify="space-between" maxW="100%">
              {isLoadingTitle ? (
                <Skeleton height="24px" width="200px" />
              ) : (
                <Text fontSize="lg" fontWeight="bold" isTruncated>
                  {membraneTitle || `Node ${node.basicInfo[0].slice(-6)}`}
                </Text>
              )}
            </HStack>
            <HStack spacing={2}>
              <Text fontSize="sm" color={mutedColor} isTruncated>
                {node.basicInfo[0].slice(0, 6)}...{node.basicInfo[0].slice(-4)}
              </Text>
              <IconButton
                aria-label="Copy node ID"
                icon={<Copy size={14} />}
                size="xs"
                variant="ghost"
                onClick={handleCopyNodeId}
              />
            </HStack>
          </VStack>

          {/* Updated Metrics Grid */}
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between">
              <Text fontSize="sm" color={mutedColor}>Inflation</Text>
              <Text fontWeight="medium">{formatCurrency(metrics.inflation)} {tokenSymbol}/day</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm" color={mutedColor}>Budget</Text>
              <Text fontWeight="medium">{formatCurrency(ethers.formatEther(metrics.budget))} {tokenSymbol}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm" color={mutedColor}>Inflow</Text>
              <Text fontWeight="medium">{formatCurrency(metrics.inflow)} {tokenSymbol}/day</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm" color={mutedColor}>Members</Text>
              <Text fontWeight="medium">{metrics.memberCount}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm" color={mutedColor}>Sub-Nodes</Text>
              <Text fontWeight="medium">{node.childrenNodes.length}</Text>
            </HStack>
          </VStack>
        </VStack>

        {/* Right Section - Surface Map */}
        <Box flex="1" h="100%" minH="300px">
          <SunburstChart 
            nodeData={node}
            chainId={chainId}
          />
        </Box>
      </HStack>
                
      {/* Path/Breadcrumbs
      {node.rootPath.length > 0 && (
        <HStack 
          mt={6} 
          spacing={2} 
          overflow="auto" 
          py={2}
          sx={{
            '&::-webkit-scrollbar': { height: '6px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'gray.200', borderRadius: 'full' }
          }}
        >
          {node.rootPath.map((pathNodeId, index) => (
            <React.Fragment key={pathNodeId}>
              {index > 0 && <ChevronRight size={14} color="gray.500" />}
              <Tooltip
                label={`View node details`}
                placement="top"
              >
                <Badge
                  px={2}
                  py={1}
                  cursor="pointer"
                  onClick={() => onNodeSelect?.(pathNodeId)}
                  _hover={{ bg: 'purple.50' }}
                >
                  {pathNodeId.slice(-6)}
                </Badge>
              </Tooltip>
            </React.Fragment>
          ))}
        </HStack>
      )} */}
    </Box>
  );
};
export default NodeInfo;