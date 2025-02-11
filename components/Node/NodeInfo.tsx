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
  inflation: string;
  budget: string;
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
  return {
    inflation: ethers.formatEther((BigInt(node.basicInfo[1]) * BigInt(86400)).toString()),
    budget: node.basicInfo[4],
    totalValue: node.basicInfo[5],
    availableShares: node.basicInfo[3],
    inflow: (Number(node.basicInfo[7]) * 86400).toString(),
    value: node.basicInfo[4],
    memberCount: node.membersOfNode.length,
    membersList: node.membersOfNode,
    userOwnedShares: node.basicInfo[9]
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
        setTokenSymbol('token');
      }
    };

    fetchTokenSymbol();
  }, [node?.rootPath, chainId, tokenAddress, provider]);

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

  const formatCurrency = (value: string): string => {
    const number = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const metrics = useMemo(() => calculateMetrics(node), [node]);

  const handleCopyNodeId = () => {
    navigator.clipboard.writeText(node.basicInfo[0]);
    toast({
      title: 'Node ID copied',
      status: 'success',
      duration: 2000,
    });
  };

  // Add ENS resolution effect
  useEffect(() => {
    const resolveEnsNames = async () => {
      if (!metrics.membersList.length) return;

      try {
        // Use Ethereum mainnet for ENS resolution
        const mainnetProvider = new ethers.JsonRpcProvider(getRPCUrl('1'));

        const resolvedMembers = await Promise.all(
          metrics.membersList.map(async (address) => {
            try {
              const ensName = await mainnetProvider.lookupAddress(address);
              return {
                address,
                ensName
              };
            } catch (error) {
              console.error(`Error resolving ENS for ${address}:`, error);
              return {
                address,
                ensName: null
              };
            }
          })
        );

        setMemberData(resolvedMembers);
      } catch (error) {
        console.error('Error resolving ENS names:', error);
        // Fallback to addresses only
        setMemberData(metrics.membersList.map(address => ({
          address,
          ensName: null
        })));
      }
    };

    resolveEnsNames();
  }, [metrics.membersList]);

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
              <Text fontSize="sm" color={mutedColor}>Inflation</Text>
              <Text fontWeight="medium">0.09 PSC/day</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={mutedColor}>Budget</Text>
              <Text fontWeight="medium">0.03 $PSC</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={mutedColor}>Inflow</Text>
              <Text fontWeight="medium">0.00 PSC/day</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={mutedColor}>Active Shares</Text>
              <Text fontWeight="medium">{metrics.availableShares}</Text>
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