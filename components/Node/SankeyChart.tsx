'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  useColorModeValue, 
  Input, 
  VStack, 
  List, 
  ListItem, 
  Text, 
  HStack, 
  Badge, 
  Select,
  Flex,
  Spinner,
  Tooltip,
  InputGroup,
  InputLeftElement,
  Button
} from '@chakra-ui/react';
import { NodeState } from '../../types/chainData';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../../config/contracts';
import { getMembraneNameFromCID } from '../../utils/ipfs';
import { nodeIdToAddress, isEndpoint, getEndpointDisplayName } from '../../utils/formatters';
import Color from 'color';
import { 
  Users,
  Activity,
  GitBranch, 
  Signal,
  Plus,
  GitBranchPlus,
  Check,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  Wallet,
  Copy,
  Search,
  PieChart
} from 'lucide-react';

// Dynamic import of Plotly
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <Box>Loading...</Box>
});

// Array of random emojis for WillWe-owned endpoints
const ENDPOINT_EMOJIS = ['🚀', '🌟', '💫', '✨', '⚡', '🔥', '💎', '🎯', '🎨', '🎭', '🎪', '🎡', '🎢', '🎠', '🎨', '🎭', '🎪', '🎡', '🎢', '🎠'];

interface SankeyChartProps {
  nodes: NodeState[];
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  nodeValues: Record<string, number>;
  chainId: string | number;
  selectedToken: string;
  onCreateNode?: () => void;
  isProcessing?: boolean;
  canCreateNode?: boolean;
  tokenName?: string;
}

interface NodeMetrics {
  value: number;
  absoluteValue: number;
  inflation: number;
  inflow: number;
  memberCount: number;
  depth: number;
  signalStrength: number;
  totalSupply: number;
  label: string;
  nodeId: string;
}

export const SankeyChart: React.FC<SankeyChartProps> = ({
  nodes,
  selectedTokenColor,
  onNodeSelect,
  nodeValues,
  chainId,
  selectedToken,
  onCreateNode,
  isProcessing = false,
  canCreateNode = false,
  tokenName: providedTokenName,
}) => {
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("value_desc");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodeLabels, setNodeLabels] = useState<Map<string, string>>(new Map());
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [tokenName, setTokenName] = useState<string>(providedTokenName || '');
  const [endpointNames, setEndpointNames] = useState<Map<string, string>>(new Map());

  // Fetch labels from IPFS and endpoint names
  useEffect(() => {
    const fetchLabels = async () => {
      setIsLoadingLabels(true);
      const labels = new Map<string, string>();
      const endpointLabels = new Map<string, string>();
      
      try {
        await Promise.all(nodes.map(async (node) => {
          if (!node?.basicInfo?.[0]) return;
          
          const nodeId = node.basicInfo[0].toString();
          
          try {
            const response = await fetch(`/api/nodes/labels?nodeId=${nodeId}&chainId=${chainId}&rootPath=${JSON.stringify(node.rootPath || [])}`);
            if (response.ok) {
              const data = await response.json();
              if (data.label) {
                labels.set(nodeId, data.label);
              }
            }
          } catch (error) {
            console.warn(`Error fetching label for node ${nodeId}:`, error);
            labels.set(nodeId, `Node ${nodeId.slice(0, 6)}...${nodeId.slice(-4)}`);
          }
        }));
        
        setNodeLabels(labels);
        setEndpointNames(endpointLabels);
      } catch (error) {
        console.error('Error fetching labels:', error);
      } finally {
        setIsLoadingLabels(false);
      }
    };

    fetchLabels();
  }, [nodes, chainId]);

  // Fetch token name if not provided
  useEffect(() => {
    const fetchTokenName = async () => {
      if (providedTokenName) {
        setTokenName(providedTokenName);
        return;
      }

      if (!selectedToken) {
        setTokenName('');
        return;
      }

      try {
        const response = await fetch(`/api/tokens/name?tokenId=${selectedToken}&chainId=${chainId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.name) {
            setTokenName(data.name);
          }
        }
      } catch (error) {
        console.warn('Error fetching token name:', error);
        setTokenName(selectedToken.slice(0, 6) + '...' + selectedToken.slice(-4));
      }
    };

    fetchTokenName();
  }, [selectedToken, chainId, providedTokenName]);

  // Add endpoint name resolution
  useEffect(() => {
    const fetchEndpointNames = async () => {
      const endpointLabels = new Map<string, string>();
      try {
        await Promise.all(nodes.map(async (node) => {
          if (!node?.basicInfo?.[0] || !node?.rootPath?.length) return;
          
          const nodeId = node.basicInfo[0].toString();
          const parentNodeId = node.rootPath[node.rootPath.length - 1];
          
          // Check if this is an endpoint
          if (isEndpoint(nodeId, parentNodeId)) {
            try {
              // Convert nodeId to address
              const nodeIdBigInt = BigInt(nodeId);
              const endpointAddress = ethers.getAddress('0x' + nodeIdBigInt.toString(16).padStart(40, '0'));

              // Get the owner of the endpoint
              const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId.toString()));
              const powerProxy = new ethers.Contract(
                endpointAddress,
                ['function owner() view returns (address)'],
                provider
              );

              const ownerAddress = await powerProxy.owner();

              // If owner is Execution contract, it's an execution endpoint
              const executionAddress = deployments.Execution[chainId.toString()];
              if (ownerAddress.toLowerCase() === executionAddress.toLowerCase()) {
                // Execution endpoint: random emoji
                try {
                  const willweContract = new ethers.Contract(
                    deployments.WillWe[chainId.toString()],
                    ABIs.WillWe,
                    provider
                  );
                  const nodeData = await willweContract.getNodeData(parentNodeId, ethers.ZeroAddress);
                  const endpoints = nodeData.movementEndpoints || [];
                  const index = endpoints.findIndex((ep: string) => ep.toLowerCase() === endpointAddress.toLowerCase());
                  const emojiIndex = index % ENDPOINT_EMOJIS.length;
                  endpointLabels.set(nodeId, ENDPOINT_EMOJIS[emojiIndex]);
                } catch (error) {
                  // Fallback to hash-based emoji selection
                  const addressHash = ethers.keccak256(ethers.toUtf8Bytes(endpointAddress));
                  const emojiIndex = Number(addressHash.slice(0, 8)) % ENDPOINT_EMOJIS.length;
                  endpointLabels.set(nodeId, ENDPOINT_EMOJIS[emojiIndex]);
                }
              } else {
                // User endpoint: try to resolve Base ENS name
                try {
                  const response = await fetch(`/api/ens/resolve?address=${ownerAddress}`);
                  if (response.ok) {
                    const data = await response.json();
                    if (data.name) {
                      endpointLabels.set(nodeId, `🚪 ${data.name}`);
                    } else {
                      endpointLabels.set(nodeId, `🚪 ${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`);
                    }
                  } else {
                    endpointLabels.set(nodeId, `🚪 ${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`);
                  }
                } catch (error) {
                  console.warn('Error resolving ENS name:', error);
                  endpointLabels.set(nodeId, `🚪 ${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`);
                }
              }
            } catch (error) {
              console.warn('Error fetching endpoint name:', error);
              endpointLabels.set(nodeId, `Endpoint ${nodeId.slice(0, 6)}...${nodeId.slice(-4)}`);
            }
          }
        }));

        setEndpointNames(endpointLabels);
      } catch (error) {
        console.error('Error fetching endpoint names:', error);
      }
    };

    fetchEndpointNames();
  }, [nodes, chainId]);

  // Calculate node metrics
  const nodeMetrics = useMemo(() => {
    const metrics = new Map<string, NodeMetrics>();
    let totalValue = BigInt(0);

    // First pass: calculate total value
    nodes.forEach((node: NodeState) => {
      if (!node?.basicInfo?.[4]) return;
      try {
        const value = BigInt(node.basicInfo[4]);
        totalValue += value;
      } catch (error) {
        console.warn('Error parsing node value:', error);
      }
    });

    // Second pass: calculate metrics
    nodes.forEach((node: NodeState) => {
      if (!node?.basicInfo?.[0]) return;
      
      try {
        const nodeId = node.basicInfo[0].toString();
        const value = BigInt(node.basicInfo[4] || '0');
        const inflation = BigInt(node.basicInfo[1] || '0');
        const inflow = BigInt(node.basicInfo[7] || '0');
        const totalSupply = BigInt(node.basicInfo[2] || '0');
        
        // Calculate value percentage relative to total value
        const valuePercent = totalValue > 0 ? 
          Number((value * BigInt(10000)) / totalValue) / 100 : 0;
        
        const inflationRate = Number(ethers.formatUnits(inflation, 'ether'));
        const inflowRate = Number(ethers.formatUnits(inflow, 'ether'));
        const nodeValue = Number(ethers.formatUnits(value, 'ether'));
        
        const memberCount = Array.isArray(node.membersOfNode) ? node.membersOfNode.length : 0;
        const depth = Array.isArray(node.rootPath) ? node.rootPath.length : 0;
        
        const signalStrength = Math.min(
          (Array.isArray(node.nodeSignals?.inflationSignals) ? node.nodeSignals.inflationSignals.length : 0) +
          (Array.isArray(node.nodeSignals?.membraneSignals) ? node.nodeSignals.membraneSignals.length : 0) +
          (Array.isArray(node.nodeSignals?.redistributionSignals) ? node.nodeSignals.redistributionSignals.length : 0)
        ) / 10;

        // Get the label, preferring endpoint name if available
        let label = endpointNames.get(nodeId) || 
                     nodeLabels.get(nodeId) || 
                     `Node ${nodeId.slice(0, 6)}...${nodeId.slice(-4)}`;
        // Only append 0x... if not a user endpoint (door emoji)
        if (label && !label.startsWith('🚪') && label.length === 2 && !/\w/.test(label)) {
          label += ` 0x${nodeId.slice(0, 6)}`;
        }

        metrics.set(nodeId, {
          value: valuePercent,
          absoluteValue: nodeValue,
          inflation: inflationRate,
          inflow: inflowRate,
          memberCount,
          depth,
          signalStrength,
          totalSupply: Number(ethers.formatUnits(totalSupply, 'ether')),
          label,
          nodeId
        });
      } catch (error) {
        console.warn('Error processing node metrics:', error);
      }
    });

    return metrics;
  }, [nodes, nodeLabels, endpointNames]);

  // Calculate color intensity based on value and member count
  const getNodeColor = (nodeId: string, metrics: NodeMetrics) => {
    const baseColor = Color(selectedTokenColor);
    
    // Normalize value to 0-1 range
    const maxValue = Math.max(...Array.from(nodeMetrics.values()).map(m => m.value));
    const normalizedValue = maxValue > 0 ? metrics.value / maxValue : 0;
    
    // Normalize member count to 0-1 range
    const maxMembers = Math.max(...Array.from(nodeMetrics.values()).map(m => m.memberCount));
    const normalizedMembers = maxMembers > 0 ? metrics.memberCount / maxMembers : 0;
    
    // Combine both factors (60% value, 40% members)
    const intensity = (normalizedValue * 0.6) + (normalizedMembers * 0.4);
    
    // Adjust color intensity (keeping it between 30% and 100% to maintain visibility)
    return baseColor.alpha(0.3 + (intensity * 0.7)).toString();
  };

  // Get link color based on source and target nodes
  const getLinkColor = (sourceId: string, targetId: string) => {
    const sourceMetrics = nodeMetrics.get(sourceId);
    const targetMetrics = nodeMetrics.get(targetId);
    
    if (!sourceMetrics || !targetMetrics) {
      return `${selectedTokenColor}40`;
    }
    
    const sourceColor = Color(getNodeColor(sourceId, sourceMetrics));
    const targetColor = Color(getNodeColor(targetId, targetMetrics));
    
    // Mix colors and reduce opacity for links
    return sourceColor.mix(targetColor, 0.5).alpha(0.4).toString();
  };

  // Prepare Sankey data
  const sankeyData = useMemo(() => {
    const displayLabels: string[] = [];
    const nodeColors: string[] = [];
    const source: number[] = [];
    const target: number[] = [];
    const values: number[] = [];
    const nodeMap = new Map<string, number>();
    const fullIds: string[] = [];
    const customdata: Array<{ value: number, members: number, absoluteValue: number }> = [];

    // First pass: create nodes
    nodes.forEach(node => {
      if (!node?.basicInfo?.[0]) return;
      const nodeId = node.basicInfo[0].toString();
      const metrics = nodeMetrics.get(nodeId);
      if (!metrics) return;

      nodeMap.set(nodeId, displayLabels.length);
      displayLabels.push(metrics.label);
      fullIds.push(nodeId);
      nodeColors.push(getNodeColor(nodeId, metrics));
      customdata.push({
        value: metrics.value,
        members: metrics.memberCount,
        absoluteValue: metrics.absoluteValue
      });
    });

    // Second pass: create links
    nodes.forEach(node => {
      if (!node?.basicInfo?.[0]) return;
      const sourceId = node.basicInfo[0].toString();
      const sourceIndex = nodeMap.get(sourceId);
      
      node.childrenNodes?.forEach(childId => {
        const targetIndex = nodeMap.get(childId);
        if (sourceIndex !== undefined && targetIndex !== undefined) {
          const targetMetrics = nodeMetrics.get(childId);
          if (targetMetrics) {
            source.push(sourceIndex);
            target.push(targetIndex);
            values.push(Math.max(0.1, targetMetrics.absoluteValue)); // Use absolute value for link thickness
          }
        }
      });
    });

    return {
      type: 'sankey' as const,
      orientation: 'h' as const,
      node: {
        pad: 15,
        thickness: 20,
        line: { color: 'black', width: 0.5 },
        label: displayLabels,
        color: nodeColors,
        customdata: customdata,
        hovertemplate: 
          '<b>%{label}</b><br>' +
          'Total Value: %{customdata.absoluteValue:.4f} ETH<br>' +
          'Share of Network: %{customdata.value:.2f}%<br>' +
          'Members: %{customdata.members}<br>' +
          '<extra></extra>'
      },
      link: {
        source,
        target,
        value: values,
        color: source.map((_, i) => getLinkColor(fullIds[source[i]], fullIds[target[i]])),
        hovertemplate: 
          '<b>From: %{source.label}</b><br>' +
          '<b>To: %{target.label}</b><br>' +
          'Value: %{value:.4f} ETH<br>' +
          '<extra></extra>'
      }
    };
  }, [nodes, nodeMetrics, selectedTokenColor, getLinkColor, getNodeColor]);

  const handleNodeClick = (event: any) => {
    const pointData = event.points?.[0];
    if (pointData?.customdata) {
      const nodeId = pointData.customdata;
      onNodeSelect(nodeId);
      router.push(`/nodes/${chainId}/${nodeId}`);
    }
  };

  if (isLoadingLabels) {
    return (
      <Box 
        w="100%" 
        h="600px" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg={bgColor}
        borderRadius="xl"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color={selectedTokenColor} />
          <Text>Loading node labels...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Flex direction={{ base: 'column', lg: 'row' }} w="100%" gap={3}>
      <Box 
        flex="0.85"
        h={{ base: "400px", lg: "700px" }}
        bg={bgColor}
        borderRadius="xl"
        shadow="sm"
        overflow="hidden"
        borderWidth="1px"
        borderColor="gray.100"
      >
        <Plot
          data={[sankeyData]}
          layout={{
            autosize: true,
            margin: { l: 50, r: 50, b: 50, t: 50 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { 
              size: 12,
              family: 'Inter, system-ui, sans-serif'
            },
            width: undefined,
            height: undefined,
          } as any}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
          onClick={handleNodeClick}
          config={{ displayModeBar: false }}
        />
      </Box>

      <VStack 
        flex="0.15" 
        minW="280px"
        h={{ base: "300px", lg: "700px" }}
        p={4} 
        borderLeft="1px" 
        borderColor="gray.100"
        bg={bgColor}
        borderRadius="xl"
        shadow="sm"
        spacing={4}
        borderWidth="1px"
      >
        <Flex width="100%" justify="space-between" align="center" mb={-2}>
          {onCreateNode && (
            <Tooltip 
              label="Create a new primary node. This will add a new low level core node for this coin."
              placement="top"
              hasArrow
            >
              <Button
                p={0}
                onClick={onCreateNode}
                variant="outline"
                borderColor={selectedTokenColor}
                color={selectedTokenColor}
                _hover={{
                  bg: selectedTokenColor,
                  color: "white"
                }}
                isLoading={isProcessing}
                isDisabled={!canCreateNode}
                size="sm"
                width="32px"
                height="32px"
                minW="32px"
              >
                <Plus size={16} />
              </Button>
            </Tooltip>
          )}
          <HStack spacing={1}>
            <Text fontWeight="bold" fontSize="xl" color={selectedTokenColor}>
              {tokenName || 'Loading...'}
            </Text>
          </HStack>
        </Flex>

        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <Search size={14} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={inputBg}
            borderRadius="md"
            _focus={{
              borderColor: selectedTokenColor,
              boxShadow: `0 0 0 1px ${selectedTokenColor}`
            }}
          />
        </InputGroup>
        
        <Select 
          size="sm"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          bg={inputBg}
          borderRadius="md"
          _focus={{
            borderColor: selectedTokenColor,
            boxShadow: `0 0 0 1px ${selectedTokenColor}`
          }}
        >
          <option value="value_desc">Value (High to Low)</option>
          <option value="value_asc">Value (Low to High)</option>
          <option value="share_desc">Network Share (High to Low)</option>
          <option value="share_asc">Network Share (Low to High)</option>
          <option value="members_desc">Members (High to Low)</option>
          <option value="members_asc">Members (Low to High)</option>
        </Select>

        <List 
          w="100%" 
          overflowY="auto" 
          flex="1"
          spacing={2}
          sx={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
              bg: inputBg,
            },
            '&::-webkit-scrollbar-thumb': {
              bg: 'gray.300',
              borderRadius: '24px',
            },
          }}
        >
          {Array.from(nodeMetrics.entries())
            .filter(([, metrics]) => 
              metrics.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
              metrics.nodeId.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort(([, a], [, b]) => {
              switch (sortOrder) {
                case 'value_desc':
                  return b.absoluteValue - a.absoluteValue;
                case 'value_asc':
                  return a.absoluteValue - b.absoluteValue;
                case 'share_desc':
                  return b.value - a.value;
                case 'share_asc':
                  return a.value - b.value;
                case 'members_desc':
                  return b.memberCount - a.memberCount;
                case 'members_asc':
                  return a.memberCount - b.memberCount;
                default:
                  return b.absoluteValue - a.absoluteValue;
              }
            })
            .map(([nodeId, metrics]) => (
              <ListItem 
                key={nodeId}
                p={3}
                cursor="pointer"
                borderRadius="lg"
                transition="all 0.2s"
                bg={hoveredNode === nodeId ? `${selectedTokenColor}10` : 'gray.50'}
                _hover={{ 
                  bg: `${selectedTokenColor}10`,
                  transform: 'none'
                }}
                onClick={() => onNodeSelect(nodeId)}
                onMouseEnter={() => setHoveredNode(nodeId)}
                onMouseLeave={() => setHoveredNode(null)}
                borderWidth="1px"
                borderColor={hoveredNode === nodeId ? selectedTokenColor : 'gray.100'}
              >
                <VStack align="start" spacing={2}>
                  <HStack justify="space-between" width="100%" align="center">
                    <Text 
                      fontSize="sm" 
                      fontWeight="semibold" 
                      noOfLines={1}
                      color={hoveredNode === nodeId ? selectedTokenColor : 'gray.900'}
                    >
                      {metrics.label}
                    </Text>
                    <Tooltip 
                      label={
                        <VStack spacing={1} p={1}>
                          <Text fontWeight="medium">
                            Network Share: {metrics.value.toFixed(1)}%
                          </Text>
                          <Text fontSize="xs" color="gray.300">
                            {metrics.value > 50 ? 'High Impact' : 
                             metrics.value > 10 ? 'Medium Impact' : 'Low Impact'} Node
                          </Text>
                        </VStack>
                      }
                      placement="top"
                      hasArrow
                      bg="gray.800"
                    >
                      <HStack spacing={1.5}>
                        {[...Array(3)].map((_, i) => (
                          <Box
                            key={i}
                            w="3px"
                            h="12px"
                            bg={metrics.value > (i * 25) ? selectedTokenColor : 'gray.200'}
                            borderRadius="1px"
                            transition="all 0.2s"
                            opacity={metrics.value > (i * 25) ? 1 : 0.3}
                          />
                        ))}
                      </HStack>
                    </Tooltip>
                  </HStack>
                  
                  <HStack spacing={2} wrap="wrap">
                    <Tooltip 
                      label="Total Value in ETH" 
                      placement="top"
                      hasArrow
                    >
                      <Badge 
                        variant="outline"
                        px={2}
                        py={0.5}
                        display="flex"
                        alignItems="center"
                        gap={1.5}
                        color={selectedTokenColor}
                        borderColor={selectedTokenColor}
                        fontWeight="medium"
                      >
                        <Wallet size={12} />
                        {metrics.absoluteValue.toFixed(4)}
                      </Badge>
                    </Tooltip>
                    
                    <Tooltip 
                      label="Share of Total Network Value" 
                      placement="top"
                      hasArrow
                    >
                      <Badge 
                        variant="outline"
                        px={2}
                        py={0.5}
                        display="flex"
                        alignItems="center"
                        gap={1.5}
                        color="blue.500"
                        borderColor="blue.200"
                        fontWeight="medium"
                      >
                        <PieChart size={12} />
                        {metrics.value.toFixed(2)}%
                      </Badge>
                    </Tooltip>
                    
                    <Tooltip 
                      label="Number of Members" 
                      placement="top"
                      hasArrow
                    >
                      <Badge 
                        variant="outline"
                        px={2}
                        py={0.5}
                        display="flex"
                        alignItems="center"
                        gap={1.5}
                        color="gray.600"
                        borderColor="gray.200"
                        fontWeight="medium"
                      >
                        <Users size={12} />
                        {metrics.memberCount}
                      </Badge>
                    </Tooltip>
                  </HStack>
                </VStack>
              </ListItem>
            ))}
        </List>
      </VStack>
    </Flex>
  );
};

export default SankeyChart;
