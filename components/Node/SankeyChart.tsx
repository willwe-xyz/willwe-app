'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@chakra-ui/react';
import { PlotMouseEvent } from 'plotly.js';

// Define the actual structure of the node data
type NodeData = [
  [string, string, string, string, string, string, string, string, string], // Basic info array
  string, // IPFS hash
  string[], // Addresses
  string[], // Parent nodes
  string[], // Child nodes
  any[] // Additional data
];

// Dynamically import Plot with ssr disabled
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <Box w="100%" h="600px" display="flex" alignItems="center" justifyContent="center">Loading chart...</Box>
});

interface SankeyChartProps {
  nodes: NodeData[];
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  nodeValues: Record<string, number>;
}

export const SankeyChart: React.FC<SankeyChartProps> = ({
  nodes,
  selectedTokenColor,
  onNodeSelect,
  nodeValues,
}) => {
  const { sankeyData, nodeLabels, idMap } = useMemo(() => {
    const labels: string[] = [];
    const source: number[] = [];
    const target: number[] = [];
    const values: number[] = [];
    const nodeMap = new Map<string, number>();
    const idMap = new Map<string, string>();

    // First pass: create node indices
    nodes.forEach((node) => {
      // Get the node ID from the first element of the first array
      const nodeId = node[0]?.[0];
      if (nodeId && !nodeMap.has(nodeId)) {
        const shortId = nodeId.slice(-8);
        nodeMap.set(nodeId, nodeMap.size);
        labels.push(shortId);
        idMap.set(shortId, nodeId);
      }
    });

    // Second pass: create links
    nodes.forEach((node) => {
      const nodeId = node[0]?.[0];
      if (!nodeId) return;
      
      const currentNodeIndex = nodeMap.get(nodeId)!;
      
      // Get parent nodes from rootPath (index 3 in the node array)
      const parentNodes = node[3] as string[];
      if (parentNodes && parentNodes.length > 0) {
        parentNodes.forEach(parentId => {
          if (nodeMap.has(parentId)) {
            const parentIndex = nodeMap.get(parentId)!;
            source.push(parentIndex);
            target.push(currentNodeIndex);
            // Use the balance (index 1 in the first array) as value, or 1 if not available
            const balance = parseInt(node[0]?.[1] || '1');
            values.push(balance);
          }
        });
      }
    });

    console.log('Sankey processed data:', {
      labels,
      source,
      target,
      values,
      nodeMap: Array.from(nodeMap.entries()),
      idMap: Array.from(idMap.entries())
    });

    return {
      sankeyData: {
        source,
        target,
        value: values,
      },
      nodeLabels: labels,
      idMap,
    };
  }, [nodes, nodeValues]);

  const handleNodeClick = (event: Readonly<PlotMouseEvent>) => {
    const point = event.points?.[0];
    console.log('Click event details:', {
      point,
      curveNumber: point?.curveNumber,
      pointNumber: point?.pointNumber,
      data: point?.data,
    });
    
    // Try to detect node clicks in multiple ways
    if (point) {
      // Method 1: Check if we have a pointNumber (index in the node array)
      if (point.pointNumber !== undefined) {
        const clickedLabel = nodeLabels[point.pointNumber];
        console.log('Method 1 - Found label:', clickedLabel);
        if (clickedLabel) {
          const fullNodeId = idMap.get(clickedLabel);
          if (fullNodeId) {
            console.log('Found node ID:', fullNodeId);
            onNodeSelect(fullNodeId);
            return;
          }
        }
      }

      // Method 2: Check if we have a label directly
      if ('label' in point && point.label) {
        console.log('Method 2 - Found label:', point.label);
        const fullNodeId = idMap.get(point.label as string);
        if (fullNodeId) {
          console.log('Found node ID:', fullNodeId);
          onNodeSelect(fullNodeId);
          return;
        }
      }

      // Method 3: Check if we have a node property
      if ('nodeId' in point && point.nodeId !== undefined) {
        const clickedLabel = nodeLabels[point.nodeId as number];
        console.log('Method 3 - Found label:', clickedLabel);
        if (clickedLabel) {
          const fullNodeId = idMap.get(clickedLabel);
          if (fullNodeId) {
            console.log('Found node ID:', fullNodeId);
            onNodeSelect(fullNodeId);
            return;
          }
        }
      }
    }
    
    console.log('Could not detect valid node click');
  };

  return (
    <Box w="100%" h="100%" minH="600px">
      <Plot
        data={[
          {
            type: 'sankey' as const,
            orientation: 'h' as const,
            arrangement: 'fixed' as const,
            node: {
              pad: 15,
              thickness: 30,
              line: {
                color: 'black',
                width: 0.5,
              },
              label: nodeLabels,
              color: Array(nodeLabels.length).fill(selectedTokenColor),
              hoverinfo: 'all' as const,
              hoverlabel: {
                bgcolor: 'white',
                font: {
                  family: 'Arial',
                  size: 12,
                  color: 'black'
                }
              }
            },
            link: {
              source: sankeyData.source,
              target: sankeyData.target,
              value: sankeyData.value,
              hoverinfo: 'none' as const
            },
          },
        ]}
        layout={{
          title: 'Node Hierarchy Flow',
          font: {
            size: 12,
            family: 'Arial',
            color: 'black'
          },
          autosize: true,
          height: 600,
          margin: {
            l: 25,
            r: 25,
            t: 40,
            b: 25,
          },
          hoverlabel: {
            bgcolor: 'white',
            font: {
              family: 'Arial',
              size: 12,
              color: 'black'
            }
          },
          hovermode: 'closest' as const,
          clickmode: 'event+select' as const,
          dragmode: false as const
        }}
        config={{
          responsive: true,
          displayModeBar: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          displaylogo: false,
          scrollZoom: false,
          doubleClick: false
        }}
        style={{ width: '100%', height: '100%' }}
        onClick={handleNodeClick}
        onSelected={(event) => {
          console.log('Selection event:', event);
        }}
      />
    </Box>
  );
};
