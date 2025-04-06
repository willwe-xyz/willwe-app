'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box, Flex, Input, List, ListItem, VStack, Text, Select, useColorModeValue } from '@chakra-ui/react';
import { PlotMouseEvent } from 'plotly.js';
import { getMembraneNameFromCID } from '../../utils/ipfs';
import { NodeState } from '../../types/chainData';

interface SankeyChartProps {
  nodes: NodeState[];
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  nodeValues: Record<string, number>;
  chainId: string | number;
}

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
  chainId
}) => {
  const router = useRouter();
  const [nodeLabels, setNodeLabels] = useState<string[]>([]);
  const [isLabelsLoading, setIsLabelsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Add labelToId mapping
  const [labelToId, setLabelToId] = useState<Map<string, string>>(new Map());

  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  // Initialize basic structure with node IDs
  const sankeyStructure = useMemo(() => {
    const labels: string[] = [];
    const source: number[] = [];
    const target: number[] = [];
    const values: number[] = [];
    const nodeMap = new Map<string, number>();

    // First pass - create nodes with temporary labels
    nodes.forEach(node => {
      if (!node?.basicInfo?.[0]) return;
      const nodeId = node.basicInfo[0];
      if (!nodeMap.has(nodeId)) {
        nodeMap.set(nodeId, labels.length);
        labels.push(nodeId); // Remove slice to keep full ID
      }
    });

    // Second pass - create links
    nodes.forEach(node => {
      if (!node?.basicInfo?.[0]) return;
      const sourceIdx = nodeMap.get(node.basicInfo[0]);
      if (typeof sourceIdx !== 'number') return;

      node.childrenNodes?.forEach(childId => {
        const targetIdx = nodeMap.get(childId);
        if (typeof targetIdx === 'number') {
          source.push(sourceIdx);
          target.push(targetIdx);
          values.push(nodeValues[childId] || 1);
        }
      });
    });

    return { nodeMap, labels, source, target, values };
  }, [nodes, nodeValues]);

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

  const handleNodeListClick = useCallback((label: string) => {
    const nodeId = labelToId.get(label);
    if (nodeId) {
      onNodeSelect(nodeId);
      router.push(`/nodes/${chainId}/${nodeId}`);
    }
  }, [labelToId, onNodeSelect, router, chainId]);

  const getFilteredAndSortedNodes = () => {
    const filtered = nodeLabels.filter(label => 
      label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      if (sortOrder === "asc") return a.localeCompare(b);
      return b.localeCompare(a);
    });
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
          data={[{
            type: 'sankey',
            node: {
              label: nodeLabels,
              color: Array(nodeLabels.length).fill(selectedTokenColor),
              thickness: 20,
              line: {
                color: "white",
                width: 0.5
              },
              pad: 15,
              hovertemplate: '%{label}<br>Value: %{value:.1f}%<extra></extra>'
            },
            link: {
              source: sankeyStructure.source,
              target: sankeyStructure.target,
              value: sankeyStructure.values,
              color: Array(sankeyStructure.source.length).fill(`${selectedTokenColor}40`),
              hovertemplate: 'From: %{source.label}<br>To: %{target.label}<br>Value: %{value:.1f}%<extra></extra>'
            }
          }]}
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
          <option value="asc">A-Z</option>
          <option value="desc">Z-A</option>
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
          {getFilteredAndSortedNodes().map((label, index) => (
            <ListItem 
              key={index}
              p={2}
              cursor="pointer"
              borderRadius="md"
              transition="all 0.2s"
              _hover={{ 
                bg: `${selectedTokenColor}10`,
                color: selectedTokenColor
              }}
              onClick={() => handleNodeListClick(label)}
            >
              <Text fontSize="sm">{label}</Text>
            </ListItem>
          ))}
        </List>
      </VStack>
    </Flex>
  );
};
