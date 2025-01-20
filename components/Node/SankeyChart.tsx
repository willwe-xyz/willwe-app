'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box, Flex, Input, List, ListItem, VStack, Text, Select } from '@chakra-ui/react';
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
  loading: () => <Box w="100%" h="600px" display="flex" alignItems="center" justifyContent="center">Loading chart...</Box>
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

    const label = clickedPoint.label;
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
    return <Box>Loading labels...</Box>;
  }

  return (
    <Flex w="100%" h="100%" gap={4}>
      <Box flex="0.85" minH="600px">
        <Plot
          data={[{
            type: 'sankey',
            node: {
              label: nodeLabels,
              color: Array(nodeLabels.length).fill(selectedTokenColor)
            },
            link: {
              source: sankeyStructure.source,
              target: sankeyStructure.target,
              value: sankeyStructure.values
            }
          }]}
          layout={{
            autosize: true,
            height: 600
          }}
          onClick={handleNodeClick}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      <VStack flex="0.15" h="600px" p={4} borderLeft="1px" borderColor="gray.200" spacing={4}>
        <Input
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
        />
        
        <Select 
          size="sm"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">A-Z</option>
          <option value="desc">Z-A</option>
        </Select>

        <List w="100%" overflowY="auto" flex="1">
          {getFilteredAndSortedNodes().map((label, index) => (
            <ListItem 
              key={index}
              p={2}
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() => handleNodeListClick(label)}
            >
              <Text>{label}</Text>
            </ListItem>
          ))}
        </List>
      </VStack>
    </Flex>
  );
};
