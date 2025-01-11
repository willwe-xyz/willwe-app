'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Box } from '@chakra-ui/react';
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
        labels.push(nodeId.slice(0, 12)); // Temporary label
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

  // Load membrane names
  useEffect(() => {
    const loadMembraneNames = async () => {
      setIsLabelsLoading(true);
      const newLabels = [...sankeyStructure.labels];
      
      await Promise.all(
        nodes.map(async (node) => {
          if (node?.basicInfo?.[0] && node.membraneMeta) {
            const idx = sankeyStructure.nodeMap.get(node.basicInfo[0]);
            if (idx !== undefined) {
              const membraneName = await getMembraneNameFromCID(node.membraneMeta);
              if (membraneName) {
                newLabels[idx] = membraneName;
              }
            }
          }
        })
      );
      
      setNodeLabels(newLabels);
      setIsLabelsLoading(false);
    };

    loadMembraneNames();
  }, [nodes, sankeyStructure]);

  const handleNodeClick = useCallback((event: PlotMouseEvent) => {
    const clickedPoint = event.points?.[0];
    if (clickedPoint?.pointNumber !== undefined) {
      const nodeId = nodes[clickedPoint.pointNumber]?.basicInfo[0];
      if (nodeId) {
        onNodeSelect(nodeId);
        router.push(`/nodes/${chainId}/${nodeId}`);
      }
    }
  }, [nodes, onNodeSelect, router, chainId]);

  if (isLabelsLoading) {
    return <Box>Loading labels...</Box>;
  }

  return (
    <Box w="100%" h="100%" minH="600px">
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
  );
};
