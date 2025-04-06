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
  dailyUnlock: string;
  TVL: string;
  totalValue: string;
  availableShares: string;
  inflow: string;
  value: string;
  memberCount: number;
  membersList: string[];
  userOwnedShares: string;
}

// Add interface for member data
interface MemberData {
  address: string;
  ensName: string | null;
}

const calculateMetrics = (node: NodeState): NodeMetrics => {
  // Safely handle null or undefined values
  if (!node || !node.basicInfo) {
    return {
      dailyUnlock: '0',
      TVL: '0',
      totalValue: '0',
      availableShares: '0',
      inflow: '0',
      value: '0',
      memberCount: 0,
      membersList: [],
      userOwnedShares: '0'
    };
  }

  // Per-second rates in gwei, multiply by seconds in a day
  const dailyUnlockedValue = node.basicInfo.inflation ? 
    BigInt(Number(node.basicInfo.inflation) * 86400) : 
    BigInt(0);
  
  console.log('childParentEligibilityinRoot:', node);
  return {
    dailyUnlock: ethers.formatUnits(dailyUnlockedValue, 'ether'),
    TVL: ethers.formatUnits(node.basicInfo.rootValuationBudget || '0', 'ether'),
    totalValue: ethers.formatUnits(node.basicInfo.rootValuationBudget || '0', 'ether'),
    availableShares: ethers.formatUnits(node.basicInfo.balanceBudget || '0', 'ether'),
    inflow: ethers.formatUnits(node.basicInfo.eligibilityPerSec || '0', 'ether'), // Keep this as per-second rate
    value: ethers.formatUnits(node.basicInfo.rootValuationReserve || '0', 'ether'),
    memberCount: node.membersOfNode?.length || 0,
    membersList: node.membersOfNode || [],
    userOwnedShares: ethers.formatUnits(node.basicInfo.balanceOfUser || '0', 'gwei')
  };
};

const NodeInfo: React.FC<NodeInfoProps> = ({ node, chainId, onNodeSelect }) => {
  const [membraneTitle, setMembraneTitle] = useState<string | null>(null);
  const [isLoadingTitle, setIsLoadingTitle] = useState(true);
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  // Safely handle null or undefined values
  const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId), {
    chainId: Number(chainId),
    name: `${chainId}`,
  });
  
  // Safely handle null or undefined values
  const tokenAddress = node?.rootPath?.[0] ? nodeIdToAddress(node.rootPath[0]) : ethers.ZeroAddress;

  const tokenContract = new ethers.Contract(
    tokenAddress,
    ABIs.IERC20,
    provider
  );

  const [memberData, setMemberData] = useState<MemberData[]>([]);

  useEffect(() => {
    const fetchTokenSymbol = async () => {
      if (!node?.rootPath?.[0] || !chainId) return;

      try {
        const code = await provider.getCode(tokenAddress);
        if (code === '0x') {
          setTokenSymbol('NOT A TOKEN');
          return;
        }

        const symbol = await tokenContract.symbol();
        setTokenSymbol(symbol);
      } catch (error) {
        console.error('Error fetching token symbol:', error);
        setTokenSymbol('UNKNOWN');
      }
    };

    fetchTokenSymbol();
  }, [node, chainId, provider, tokenContract, tokenAddress]);

  useEffect(() => {
    const fetchMembraneTitle = async () => {
      if (!node?.membraneMeta) {
        setIsLoadingTitle(false);
        return;
      }

      try {
        setIsLoadingTitle(true);
        const response = await fetch(`${IPFS_GATEWAY}${node.membraneMeta}`);
        const data = await response.json();
        setMembraneTitle(data.name || 'Unnamed Membrane');
      } catch (error) {
        console.error('Error fetching membrane title:', error);
        setMembraneTitle('Unknown Membrane');
      } finally {
        setIsLoadingTitle(false);
      }
    };

    fetchMembraneTitle();
  }, [node]);

  const formatCurrency = (value: string): string => {
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '0';
      
      if (numValue >= 1000000) {
        return `${(numValue / 1000000).toFixed(2)}M`;
      } else if (numValue >= 1000) {
        return `${(numValue / 1000).toFixed(2)}K`;
      } else {
        return numValue.toFixed(2);
      }
    } catch (error) {
      console.error('Error formatting currency:', error);
      return '0';
    }
  };

  const handleCopyNodeId = () => {
    if (!node?.basicInfo?.nodeId) return;
    
    navigator.clipboard.writeText(node.basicInfo.nodeId);
    toast({
      title: 'Copied',
      description: 'Node ID copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  useEffect(() => {
    const resolveEnsNames = async () => {
      if (!node?.membersOfNode || node.membersOfNode.length === 0) return;

      try {
        // Use Ethereum mainnet for ENS resolution
        const mainnetProvider = new ethers.JsonRpcProvider(getRPCUrl('1'));

        const ensNames = await Promise.all(
          node.membersOfNode.map(async (address) => {
            try {
              const ensName = await mainnetProvider.lookupAddress(address);
              return { address, ensName };
            } catch (error) {
              console.error(`Error resolving ENS for ${address}:`, error);
              return { address, ensName: null };
            }
          })
        );
        setMemberData(ensNames);
      } catch (error) {
        console.error('Error resolving ENS names:', error);
      }
    };

    resolveEnsNames();
  }, [node]);

  const metrics = useMemo(() => calculateMetrics(node), [node]);

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
    >
      <Box p={4}>
        <HStack spacing={4} align="start" w="full" minH="300px">
          <VStack
            flex="1"
            align="stretch"
            spacing={3}
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
            p={4}
          >
            <HStack justify="space-between">
              <Tooltip label="Daily token creation rate for this node" fontSize="sm">
                <Text fontSize="sm" color={mutedColor} cursor="help">Daily Unlock</Text>
              </Tooltip>
              <Text fontWeight="medium">{formatCurrency(metrics.dailyUnlock)} PSC/day</Text>
            </HStack>
            <HStack justify="space-between">
              <Tooltip label="Amount of tokens held in node's own account" fontSize="sm">
                <Text fontSize="sm" color={mutedColor} cursor="help">Total Node Value</Text>
              </Tooltip>
              <Text fontWeight="medium">{formatCurrency(metrics.TVL)} PSC</Text>
            </HStack>
            <HStack justify="space-between">
              <Tooltip label="Current per-second inflation rate" fontSize="sm">
                <Text fontSize="sm" color={mutedColor} cursor="help">Inflow Rate</Text>
              </Tooltip>
              <Text fontWeight="medium">{formatCurrency(metrics.inflow)} PSC/sec</Text>
            </HStack>
            <HStack justify="space-between">
              <Tooltip label="Current balance available in the node's budget" fontSize="sm">
                <Text fontSize="sm" color={mutedColor} cursor="help">Active Shares</Text>
              </Tooltip>
              <Text fontWeight="medium">{formatCurrency(metrics.availableShares)} PSC</Text>
            </HStack>
          </VStack>

          <VStack flex="1" align="stretch" spacing={4}>
            {metrics.membersList.length > 0 && (
              <VStack align="stretch">
                <Text fontSize="sm" color={mutedColor}>Members ({metrics.membersList.length})</Text>
                <Box
                  maxH="125px"
                  overflowY="auto"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                  p={2}
                >
                  {memberData.map((member, index) => (
                    <Text 
                      key={index} 
                      fontSize="xs" 
                      isTruncated 
                      py={1}
                      display="flex"
                      alignItems="center"
                    >
                      {member.ensName || 
                        `${member.address.slice(0, 6)}...${member.address.slice(-4)}`
                      }
                      {member.ensName && (
                        <Text 
                          as="span" 
                          fontSize="xx-small" 
                          color="gray.500" 
                          ml={2}
                        >
                          ({`${member.address.slice(0, 6)}...${member.address.slice(-4)}`})
                        </Text>
                      )}
                    </Text>
                  ))}
                </Box>
              </VStack>
            )}

            {node.childrenNodes.length > 0 && (
              <VStack align="stretch">
                <Text fontSize="sm" color={mutedColor}>Sub-Nodes ({node.childrenNodes.length})</Text>
                <Box
                  maxH="125px"
                  overflowY="auto"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                  p={2}
                >
                  {node.childrenNodes.map((childId, index) => (
                    <Text
                      key={index}
                      fontSize="xs"
                      isTruncated
                      py={1}
                      cursor="pointer"
                      onClick={() => {
                      onNodeSelect?.(childId);
                      router.push(`/nodes/${chainId}/${childId}`);
                      }}
                      _hover={{ color: 'purple.500', textDecoration: 'none' }}>
                      {childId}
                    </Text>
                  ))}
                </Box>
              </VStack>
            )}
          </VStack>

          <Box flex="1">
            <SunburstChart
              nodeData={node}
              chainId={chainId}
            />
          </Box>
        </HStack>
      </Box>
    </Box>
  );
};

export default NodeInfo;