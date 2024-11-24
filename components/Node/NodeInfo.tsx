import React, { useState, useEffect } from 'react';
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
import { ethers } from 'ethers';
import { useWillWeContract } from '../../hooks/useWillWeContract';
import { NodeState } from '../../types/chainData';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

interface NodeInfoProps {
  node: NodeState;
  chainId: string;
  onNodeSelect?: (nodeId: string) => void;
}

const NodeInfo: React.FC<NodeInfoProps> = ({ node, chainId, onNodeSelect }) => {
  const [membraneTitle, setMembraneTitle] = useState<string | null>(null);
  const [isLoadingTitle, setIsLoadingTitle] = useState(true);
  const contract = useWillWeContract(chainId);
  const toast = useToast();

  // Theme colors
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

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
  const formatGweiPerDay = (gweiPerSecond: string): string => {
    try {
      const perSecond = ethers.parseUnits(gweiPerSecond, 'gwei');
      const perDay = perSecond * BigInt(86400); // seconds in a day
      return ethers.formatEther(perDay);
    } catch (error) {
      console.error('Error formatting gwei per day:', error);
      return '0';
    }
  };

  // Calculate metrics
  const metrics = {
    inflation: formatGweiPerDay(node.basicInfo[1]),
    budget: node.basicInfo[3],
    inflow: formatGweiPerDay(node.basicInfo[7])
  };

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

      {/* Metrics Grid */}
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontSize="sm" color={mutedColor}>Inflation</Text>
          <Text fontWeight="medium">{metrics.inflation} tokens/day</Text>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color={mutedColor}>Budget</Text>
          <Text fontWeight="medium">{ethers.formatEther(metrics.budget)} tokens</Text>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color={mutedColor}>Inflow</Text>
          <Text fontWeight="medium">{metrics.inflow} tokens/day</Text>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color={mutedColor}>Members</Text>
          <Text fontWeight="medium">{node.membersOfNode.length}</Text>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color={mutedColor}>Sub-Nodes</Text>
          <Text fontWeight="medium">{node.childrenNodes.length}</Text>
        </HStack>
      </VStack>

      {/* Path/Breadcrumbs */}
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
      )}
    </Box>
  );
};

export default NodeInfo;