'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box, Flex, Input, List, ListItem, VStack, Text, Select, useColorModeValue, HStack, Badge } from '@chakra-ui/react';
import { PlotMouseEvent } from 'plotly.js';
import { getMembraneNameFromCID } from '../../utils/ipfs';
import { NodeState } from '../../types/chainData';
import { ethers } from 'ethers';

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
}

interface SankeyStructure {
  nodeMap: Map<string, number>;
  labels: string[];
  source: number[];
  target: number[];
  values: number[];
  nodeColors: string[];
  nodeSizes: number[];
  nodeDepths: number[];
  nodeSignalStrengths: number[];
}

type SankeyData = {
  type: 'sankey';
  node: {
    label: string[];
    color: string[];
    thickness: number[];
    line: {
      color: string[];
      width: number[];
    };
    pad: number;
    hovertemplate: string;
    customdata: Array<[number, number, number, number]>;
  };
  link: {
    source: number[];
    target: number[];
    value: number[];
    color: string[];
    hovertemplate: string;
    customdata: Array<[number, number]>;
  };
};

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <Box 
      w="100%" 
      h="600px" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg="gray.50"
      borderRadius="xl"
    >
      <Text color="gray.500">Loading chart...</Text>
    </Box>
  )
});

export const SankeyChart: React.FC<SankeyChartProps> = ({
  nodes,
  selectedTokenColor,
  onNodeSelect,
  nodeValues,
  chainId,
  selectedToken
}) => {
  const router = useRouter();
  const [nodeLabels, setNodeLabels] = useState<string[]>([]);
  const [isLabelsLoading, setIsLabelsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [minValueFilter, setMinValueFilter] = useState(0);
  const [selectedDepth, setSelectedDepth] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Add labelToId mapping
  const [labelToId, setLabelToId] = useState<Map<string, string>>(new Map());

  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  // Calculate node metrics with proper value scaling
  const nodeMetrics = useMemo(() => {
    const metrics = new Map<string, {
      value: number;
      inflation: number;
      inflow: number;
      memberCount: number;
      depth: number;
      signalStrength: number;
      maxValue: number;
    }>();

    // First pass - find max value and inflow for scaling
    let maxValue = 0;
    let maxInflow = 0;
    nodes.forEach(node => {
      if (!node?.basicInfo?.[4]) return;
      const value = Number(ethers.formatUnits(node.basicInfo[4] || '0', 'ether'));
      const inflow = Number(ethers.formatUnits(node.basicInfo[7] || '0', 'ether'));
      maxValue = Math.max(maxValue, value);
      maxInflow = Math.max(maxInflow, inflow);
    });

    // Second pass - calculate metrics with proper scaling
    nodes.forEach(node => {
      if (!node?.basicInfo?.[0]) return;
      
      const nodeId = node.basicInfo[0];
      const value = Number(ethers.formatUnits(node.basicInfo[4] || '0', 'ether'));
      const inflation = Number(ethers.formatUnits(node.basicInfo[1] || '0', 'ether'));
      const inflow = Number(ethers.formatUnits(node.basicInfo[7] || '0', 'ether'));
      const memberCount = node.membersOfNode?.length || 0;
      const depth = node.rootPath?.length || 0;
      
      // Calculate signal strength from various signals
      const signalStrength = Math.min(
        (node.nodeSignals?.inflationSignals?.length || 0) +
        (node.nodeSignals?.membraneSignals?.length || 0) +
        (node.nodeSignals?.redistributionSignals?.length || 0),
        10
      ) / 10;

      metrics.set(nodeId, {
        value,
        inflation,
        inflow,
        memberCount,
        depth,
        signalStrength,
        maxValue
      });
    });

    return metrics;
  }, [nodes]);

  // Initialize basic structure with enhanced metrics
  const sankeyStructure = useMemo(() => {
    const labels: string[] = [];
    const source: number[] = [];
    const target: number[] = [];
    const values: number[] = [];
    const nodeMap = new Map<string, number>();
    const nodeColors: string[] = [];
    const nodeSizes: number[] = [];
    const nodeDepths: number[] = [];
    const nodeSignalStrengths: number[] = [];

    // First pass - create nodes with metrics
    nodes.forEach(node => {
      if (!node?.basicInfo?.[0]) return;
      const nodeId = node.basicInfo[0];
      if (!nodeMap.has(nodeId)) {
        nodeMap.set(nodeId, labels.length);
        labels.push(nodeId);
        
        const metrics = nodeMetrics.get(nodeId);
        if (metrics) {
          // Size based on value
          const size = Math.log10(metrics.value + 1) * 20;
          nodeSizes.push(size);
          
          // Color based on inflation
          const inflationColor = metrics.inflation > 0 
            ? `${selectedTokenColor}${Math.min(Math.floor(metrics.inflation * 100), 100)}`
            : `${selectedTokenColor}20`;
          nodeColors.push(inflationColor);
          
          // Store depth and signal strength
          nodeDepths.push(metrics.depth);
          nodeSignalStrengths.push(metrics.signalStrength);
        }
      }
    });

    // Second pass - create links with enhanced metrics
    nodes.forEach(node => {
      if (!node?.basicInfo?.[0]) return;
      const sourceIdx = nodeMap.get(node.basicInfo[0]);
      if (typeof sourceIdx !== 'number') return;

      node.childrenNodes?.forEach(childId => {
        const targetIdx = nodeMap.get(childId);
        if (typeof targetIdx === 'number') {
          source.push(sourceIdx);
          target.push(targetIdx);
          
          // Calculate link value based on child's value
          const childMetrics = nodeMetrics.get(childId);
          const linkValue = childMetrics?.value || 1;
          values.push(linkValue);
        }
      });
    });

    return { 
      nodeMap, 
      labels, 
      source, 
      target, 
      values, 
      nodeColors,
      nodeSizes,
      nodeDepths,
      nodeSignalStrengths
    };
  }, [nodes, nodeMetrics, selectedTokenColor]);

  const formatNodeId = (nodeId: string) => {
    const halfLength = Math.floor(nodeId.length / 2);
    return '_' + nodeId.slice(halfLength);
  };

  // Load membrane names
  useEffect(() => {
    const loadMembraneNames = async () => {
      setIsLabelsLoading(true);
      const newLabels = [...sankeyStructure.labels];
      const newLabelToId = new Map<string, string>();
      
      await Promise.all(
        nodes.map(async (node) => {
          if (node?.basicInfo?.[0] && node.membraneMeta) {
            const idx = sankeyStructure.nodeMap.get(node.basicInfo[0]);
            if (idx !== undefined) {
              const membraneName = await getMembraneNameFromCID(node.membraneMeta);
              if (membraneName) {
                newLabels[idx] = membraneName;
                newLabelToId.set(membraneName, node.basicInfo[0]);
              } else {
                // Format node ID if no membrane name
                const formattedId = formatNodeId(node.basicInfo[0]);
                newLabels[idx] = formattedId;
                newLabelToId.set(formattedId, node.basicInfo[0]);
              }
            }
          }
        })
      );
      
      // Also add ID mappings for non-named nodes
      nodes.forEach(node => {
        if (node?.basicInfo?.[0]) {
          const nodeId = node.basicInfo[0];
          const formattedId = formatNodeId(nodeId);
          newLabelToId.set(formattedId, nodeId);
          
          // Update label if it hasn't been set by membrane name
          const idx = sankeyStructure.nodeMap.get(nodeId);
          if (idx !== undefined && newLabels[idx] === nodeId) {
            newLabels[idx] = formattedId;
          }
        }
      });
      
      setNodeLabels(newLabels);
      setLabelToId(newLabelToId);
      setIsLabelsLoading(false);
    };

    loadMembraneNames();
  }, [nodes, sankeyStructure]);

  const handleNodeClick = useCallback((event: PlotMouseEvent) => {
    const clickedPoint = event.points?.[0];
    if (!clickedPoint) return;

    const label = (clickedPoint as any).label;
    if (label) {
      const nodeId = labelToId.get(label);
      if (nodeId) {
        onNodeSelect(nodeId);
        router.push(`/nodes/${chainId}/${nodeId}`);
      }
    }
  }, [labelToId, onNodeSelect, router, chainId]);

  const handleNodeHover = useCallback((event: PlotMouseEvent) => {
    const hoveredPoint = event.points?.[0];
    if (!hoveredPoint) {
      setHoveredNode(null);
      return;
    }

    const label = (hoveredPoint as any).label;
    if (label) {
      const nodeId = labelToId.get(label);
      setHoveredNode(nodeId || null);
    }
  }, [labelToId]);

  const handleNodeListClick = useCallback((label: string) => {
    const nodeId = labelToId.get(label);
    if (nodeId) {
      onNodeSelect(nodeId);
      router.push(`/nodes/${chainId}/${nodeId}`);
    }
  }, [labelToId, onNodeSelect, router, chainId]);

  const getFilteredAndSortedNodes = () => {
    const filtered = nodeLabels.filter(label => {
      const nodeId = labelToId.get(label);
      if (!nodeId) return false;
      
      const metrics = nodeMetrics.get(nodeId);
      if (!metrics) return false;
      
      return (
        label.toLowerCase().includes(searchTerm.toLowerCase()) &&
        metrics.value >= minValueFilter &&
        (selectedDepth === null || metrics.depth === selectedDepth)
      );
    });
    
    return filtered.sort((a, b) => {
      const aId = labelToId.get(a);
      const bId = labelToId.get(b);
      const aMetrics = aId ? nodeMetrics.get(aId) : null;
      const bMetrics = bId ? nodeMetrics.get(bId) : null;
      
      if (!aMetrics || !bMetrics) return 0;
      
      if (sortOrder === "asc") {
        return aMetrics.value - bMetrics.value;
      }
      return bMetrics.value - aMetrics.value;
    });
  };

  const getNodeHoverTemplate = (): string => {
    return `
      <b>%{label}</b><br>
      Value: %{value:.1f}%<br>
      Inflation: %{customdata[0]:.4f}/sec<br>
      Members: %{customdata[1]}<br>
      Depth: %{customdata[2]}<br>
      Signal Strength: %{customdata[3]:.0f}%<extra></extra>
    `;
  };

  const getLinkHoverTemplate = (): string => {
    return `
      <b>Flow Details</b><br>
      From: %{source.label}<br>
      To: %{target.label}<br>
      Value: %{value:.1f}%<br>
      Source Inflation: %{customdata[0]:.4f}/sec<br>
      Target Inflation: %{customdata[1]:.4f}/sec<extra></extra>
    `;
  };

  const getNodeLineColor = (idx: number): string => {
    const nodeId = sankeyStructure.labels[idx];
    const metrics = nodeMetrics.get(nodeId);
    return (metrics?.signalStrength || 0) > 0.5 ? selectedTokenColor : "white";
  };

  const getNodeLineWidth = (idx: number): number => {
    const nodeId = sankeyStructure.labels[idx];
    const metrics = nodeMetrics.get(nodeId);
    return (metrics?.signalStrength || 0) * 2 || 0.5;
  };

  const getSankeyData = (): SankeyData => {
    const nodeCustomData: Array<[number, number, number, number]> = nodeLabels.map((_, idx) => {
      const nodeId = sankeyStructure.labels[idx];
      const metrics = nodeMetrics.get(nodeId);
      return [
        metrics?.inflation || 0, // Fallback to 0
        metrics?.memberCount || 0, // Fallback to 0
        metrics?.depth || 0, // Fallback to 0
        (metrics?.signalStrength || 0) * 100 // Fallback to 0
      ];
    });

    const linkCustomData: Array<[number, number]> = sankeyStructure.source.map((_, idx) => {
      const sourceIdx = sankeyStructure.source[idx];
      const targetIdx = sankeyStructure.target[idx];
      const sourceId = sankeyStructure.labels[sourceIdx];
      const targetId = sankeyStructure.labels[targetIdx];
      const sourceMetrics = nodeMetrics.get(sourceId);
      const targetMetrics = nodeMetrics.get(targetId);
      return [
        sourceMetrics?.inflation || 0, // Fallback to 0
        targetMetrics?.inflation || 0 // Fallback to 0
      ];
    });

    // Ensure node sizes and link values are valid
    const nodeSizes = nodeLabels.map((_, idx) => {
      const nodeId = sankeyStructure.labels[idx];
      const metrics = nodeMetrics.get(nodeId);
      return Math.max(20, Math.min(40, metrics?.value || 20)); // Fallback to 20
    });

    const linkValues = sankeyStructure.source.map((_, idx) => {
      const targetIdx = sankeyStructure.target[idx];
      const targetId = sankeyStructure.labels[targetIdx];
      const metrics = nodeMetrics.get(targetId);
      return metrics?.inflow || 1; // Fallback to 1
    });

    return {
      type: 'sankey',
      node: {
        label: nodeLabels,
        color: nodeLabels.map(() => selectedTokenColor),
        thickness: nodeSizes,
        line: {
          color: nodeLabels.map(() => selectedTokenColor),
          width: nodeLabels.map(() => 0.5)
        },
        pad: 15,
        hovertemplate: `
          <b>%{label}</b><br>
          Value: %{value:.1f}%<br>
          Inflation: %{customdata[0]:.4f}/sec<br>
          Members: %{customdata[1]}<br>
          Depth: %{customdata[2]}<br>
          Signal Strength: %{customdata[3]:.0f}%<extra></extra>
        `,
        customdata: nodeCustomData
      },
      link: {
        source: sankeyStructure.source,
        target: sankeyStructure.target,
        value: linkValues,
        color: Array(sankeyStructure.source.length).fill(`${selectedTokenColor}40`),
        hovertemplate: `
          <b>Flow Details</b><br>
          From: %{source.label}<br>
          To: %{target.label}<br>
          Value: %{value:.1f}%<br>
          Source Inflation: %{customdata[0]:.4f}/sec<br>
          Target Inflation: %{customdata[1]:.4f}/sec<extra></extra>
        `,
        customdata: linkCustomData
      }
    };
  };

  if (isLabelsLoading) {
    return (
      <Box 
        w="100%" 
        h="600px" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="gray.50"
        borderRadius="xl"
      >
        <Text color="gray.500">Loading labels...</Text>
      </Box>
    );
  }

  return (
    <Flex w="100%" h="100%" gap={6}>
      <Box 
        flex="0.85" 
        minH="600px"
        bg={bgColor}
        borderRadius="xl"
        shadow="sm"
        overflow="hidden"
      >
        <Plot
          data={[getSankeyData() as any]}
          layout={{
            autosize: true,
            height: 600,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
              family: 'Inter, sans-serif'
            },
            margin: {
              l: 25,
              r: 25,
              t: 25,
              b: 25
            }
          }}
          onClick={handleNodeClick}
          onHover={handleNodeHover}
          style={{ width: '100%', height: '100%' }}
          config={{
            displayModeBar: false,
            responsive: true
          }}
        />
      </Box>

      <VStack 
        flex="0.15" 
        h="600px" 
        p={4} 
        borderLeft="1px" 
        borderColor={borderColor}
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

        <Input
          type="number"
          placeholder="Min Value Filter"
          value={minValueFilter}
          onChange={(e) => setMinValueFilter(Number(e.target.value))}
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
          value={selectedDepth === null ? '' : selectedDepth}
          onChange={(e) => setSelectedDepth(e.target.value ? Number(e.target.value) : null)}
          placeholder="Filter by Depth"
          bg={inputBg}
          borderRadius="md"
          _focus={{
            borderColor: selectedTokenColor,
            boxShadow: `0 0 0 1px ${selectedTokenColor}`
          }}
        >
          {Array.from(new Set(sankeyStructure.nodeDepths)).map(depth => (
            <option key={depth} value={depth}>Depth {depth}</option>
          ))}
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
          {getFilteredAndSortedNodes().map((label, index) => {
            const nodeId = labelToId.get(label);
            const metrics = nodeId ? nodeMetrics.get(nodeId) : null;
            
            return (
              <ListItem 
                key={index}
                p={2}
                cursor="pointer"
                borderRadius="md"
                transition="all 0.2s"
                bg={hoveredNode === nodeId ? `${selectedTokenColor}10` : 'transparent'}
                _hover={{ 
                  bg: `${selectedTokenColor}10`,
                  color: selectedTokenColor
                }}
                onClick={() => handleNodeListClick(label)}
              >
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="medium">{label}</Text>
                  {metrics && (
                    <HStack spacing={2}>
                      <Badge colorScheme="purple" variant="subtle">
                        {metrics.value.toFixed(2)}%
                      </Badge>
                      <Badge colorScheme="green" variant="subtle">
                        {metrics.memberCount} members
                      </Badge>
                    </HStack>
                  )}
                </VStack>
              </ListItem>
            );
          })}
        </List>
      </VStack>
    </Flex>
  );
};

export default SankeyChart;
