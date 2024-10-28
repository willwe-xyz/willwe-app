import React, { useCallback, useRef, useEffect } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { ForceGraph2D } from 'react-force-graph';
import { NodeState } from '../types/chainData';

interface NodeChartProps {
  nodes: NodeState[];
  selectedNodeId?: string;
  onNodeClick: (nodeId: string) => void;
  width?: number;
  height?: number;
  color: string;
}

interface GraphNode {
  id: string;
  name: string;
  value: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

const NodeChart: React.FC<NodeChartProps> = ({
  nodes,
  selectedNodeId,
  onNodeClick,
  width = 800,
  height = 600,
  color
}) => {
  const fgRef = useRef();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  // Transform node data for the graph
  const graphData = React.useMemo(() => {
    const graphNodes: GraphNode[] = nodes.map(node => ({
      id: node.basicInfo[0],
      name: node.basicInfo[0].slice(-6),
      value: Number(node.basicInfo[4]),
      color: node.basicInfo[0] === selectedNodeId ? color : `${color}40`
    }));

    const graphLinks: GraphLink[] = nodes.flatMap(node =>
      node.childrenNodes.map(childId => ({
        source: node.basicInfo[0],
        target: childId,
        value: 1
      }))
    );

    return { nodes: graphNodes, links: graphLinks };
  }, [nodes, selectedNodeId, color]);

  // Handle zoom on selected node
  useEffect(() => {
    if (selectedNodeId && fgRef.current) {
      const node = graphData.nodes.find(n => n.id === selectedNodeId);
      if (node) {
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(2, 1000);
      }
    }
  }, [selectedNodeId, graphData.nodes]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    onNodeClick(node.id);
  }, [onNodeClick]);

  return (
    <Box
      width={width}
      height={height}
      bg={bgColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor="color"
        nodeRelSize={8}
        linkColor={() => `${color}20`}
        linkWidth={2}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        backgroundColor={bgColor}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = textColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, node.x, node.y);
        }}
        cooldownTicks={100}
      />
    </Box>
  );
};

export default React.memo(NodeChart);