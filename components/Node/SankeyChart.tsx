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
  Spinner
} from '@chakra-ui/react';
import { NodeState } from '../../types/chainData';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../../config/contracts';
import { getMembraneNameFromCID } from '../../utils/ipfs';
import Color from 'color';

// Dynamic import of Plotly
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <Box>Loading...</Box>
});

interface SankeyChartProps {
  nodes: NodeState[];
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  nodeValues: Record<string, number>;
  chainId: string | number;
  selectedToken: string;
}

interface NodeMetrics {
  value: number;
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
}) => {
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodeLabels, setNodeLabels] = useState<Map<string, string>>(new Map());
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);

  // Fetch labels from IPFS
  useEffect(() => {
    const fetchLabels = async () => {
      setIsLoadingLabels(true);
      const labels = new Map<string, string>();
      
      try {
        await Promise.all(nodes.map(async (node) => {
          if (!node?.basicInfo?.[0]) return;
          
          const nodeId = node.basicInfo[0].toString();
          // Use basicInfo[3] for membrane metadata CID
          const labelCID = node.basicInfo[6].toString(); // Active membrane ID
          
          try {
            if (labelCID && labelCID !== '0') {
              const cleanChainId = chainId.toString().replace('eip155:', '');
              const provider = new ethers.JsonRpcProvider(getRPCUrl(cleanChainId));
              const membraneContract = new ethers.Contract(
                deployments.Membrane[cleanChainId],
                ABIs.Membrane,
                provider
              );

              // Get membrane data from contract
              const membrane = await membraneContract.getMembraneById(labelCID);
              if (membrane && membrane.meta) {
                const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';
                const response = await fetch(`${IPFS_GATEWAY}${membrane.meta}`);
                if (response.ok) {
                  const metadata = await response.json();
                  labels.set(nodeId, metadata.name || metadata.title || `Node ${nodeId.slice(0, 6)}...${nodeId.slice(-4)}`);
                  return;
                }
              }
            }
            // Fallback if no valid membrane metadata
            labels.set(nodeId, `Node ${nodeId.slice(0, 6)}...${nodeId.slice(-4)}`);
          } catch (error) {
            console.warn(`Error fetching label for node ${nodeId}:`, error);
            labels.set(nodeId, `Node ${nodeId.slice(0, 6)}...${nodeId.slice(-4)}`);
          }
        }));
        
        setNodeLabels(labels);
      } catch (error) {
        console.error('Error fetching labels:', error);
      } finally {
        setIsLoadingLabels(false);
      }
    };

    fetchLabels();
  }, [nodes, chainId]);

  // Calculate node metrics
  const nodeMetrics = useMemo(() => {
    const metrics = new Map<string, NodeMetrics>();

    nodes.forEach(node => {
      if (!node?.basicInfo?.[0]) return;
      
      try {
        const nodeId = node.basicInfo[0].toString();
        const value = BigInt(node.basicInfo[4] || '0');
        const inflation = BigInt(node.basicInfo[1] || '0');
        const inflow = BigInt(node.basicInfo[7] || '0');
        const totalSupply = BigInt(node.basicInfo[2] || '0');
        
        const valuePercent = totalSupply > 0 ? 
          Number((value * BigInt(10000)) / totalSupply) / 100 : 0;
        
        const inflationRate = Number(ethers.formatUnits(inflation, 'ether'));
        const inflowRate = Number(ethers.formatUnits(inflow, 'ether'));
        
        const memberCount = Array.isArray(node.membersOfNode) ? node.membersOfNode.length : 0;
        const depth = Array.isArray(node.rootPath) ? node.rootPath.length : 0;
        
        const signalStrength = Math.min(
          (Array.isArray(node.nodeSignals?.inflationSignals) ? node.nodeSignals.inflationSignals.length : 0) +
          (Array.isArray(node.nodeSignals?.membraneSignals) ? node.nodeSignals.membraneSignals.length : 0) +
          (Array.isArray(node.nodeSignals?.redistributionSignals) ? node.nodeSignals.redistributionSignals.length : 0)
        ) / 10;

        metrics.set(nodeId, {
          value: valuePercent,
          inflation: inflationRate,
          inflow: inflowRate,
          memberCount,
          depth,
          signalStrength,
          totalSupply: Number(ethers.formatUnits(totalSupply, 'ether')),
          label: nodeLabels.get(nodeId) || `Node ${nodeId.slice(0, 6)}...${nodeId.slice(-4)}`,
          nodeId
        });
      } catch (error) {
        console.warn('Error processing node metrics:', error);
      }
    });

    return metrics;
  }, [nodes, nodeLabels]);

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
            values.push(Math.max(1, targetMetrics.value));
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
        customdata: fullIds,
        hovertemplate: 
          '<b>%{label}</b><br>' +
          'Value: %{value:.2f}%<br>' +
          'Members: %{customdata:members}<br>' +
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
          'Value: %{value:.2f}%<br>' +
          '<extra></extra>'
      }
    };
  }, [nodes, nodeMetrics, selectedTokenColor]);

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
    <Flex direction={{ base: 'column', lg: 'row' }} w="100%" gap={6}>
      <Box 
        flex="0.85"
        h={{ base: "400px", lg: "600px" }}
        bg={bgColor}
        borderRadius="xl"
        shadow="sm"
        overflow="hidden"
      >
        <Plot
          data={[sankeyData]}
          layout={{
            autosize: true,
            margin: { l: 50, r: 50, b: 50, t: 50 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { size: 12 },
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
        h={{ base: "300px", lg: "600px" }}
        p={4} 
        borderLeft="1px" 
        borderColor="gray.100"
        bg={bgColor}
        borderRadius="xl"
        shadow="sm"
        spacing={4}
      >
        <Input
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          bg={inputBg}
          borderRadius="md"
          _focus={{
            borderColor: selectedTokenColor,
            boxShadow: `0 0 0 1px ${selectedTokenColor}`
          }}
        />
        
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
          <option value="asc">Value (Low to High)</option>
          <option value="desc">Value (High to Low)</option>
        </Select>

        <List 
          w="100%" 
          overflowY="auto" 
          flex="1"
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
            .sort(([, a], [, b]) => 
              sortOrder === 'asc' ? 
                a.value - b.value : 
                b.value - a.value
            )
            .map(([nodeId, metrics]) => (
              <ListItem 
                key={nodeId}
                p={2}
                cursor="pointer"
                borderRadius="md"
                transition="all 0.2s"
                bg={hoveredNode === nodeId ? `${selectedTokenColor}10` : 'transparent'}
                _hover={{ 
                  bg: `${selectedTokenColor}10`,
                  color: selectedTokenColor
                }}
                onClick={() => onNodeSelect(nodeId)}
                onMouseEnter={() => setHoveredNode(nodeId)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    {metrics.label}
                  </Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="purple" variant="subtle">
                      {metrics.value.toFixed(2)}%
                    </Badge>
                    <Badge colorScheme="green" variant="subtle">
                      {metrics.memberCount} members
                    </Badge>
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
