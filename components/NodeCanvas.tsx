import React, { useMemo } from 'react';
import { Box, HStack, VStack, Text, Button } from "@chakra-ui/react";
import { motion } from 'framer-motion';
import { root } from 'postcss';
import { NodeState } from '../lib/chainData';


interface NodeCanvasProps {
  nodes: NodeState[];
  rootNodeId: string;
  nodeClick: (nodeId: string) => void;
}

const colorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const NodeComponent: React.FC<{ 
  node: NodeState, 
  nodeClick: (nodeId: string) => void
}> = ({ node, nodeClick }) => {
  const color = colorFromString(node.nodeId);
  const width = Math.max(30, (node.balanceAnchor / (node.membersOfNode?.length || 1)) * 300);
  const intensity = Math.min(1, (node.membersOfNode?.length || 1) / 100);

  return (
    <motion.div
      style={{ 
        width: `${width}px`,
        height: '30px',
        backgroundColor: `rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},${intensity})`,
        border: '2px solid #000000'
      }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      onClick={() => nodeClick(node.nodeId)}
    >
      <Text fontSize="xs" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
        {node.nodeId}
      </Text>
    </motion.div>
  );
};

const spawnNode = (nodeId: string) => { 
  console.log(nodeId);
}


export const NodeCanvas: React.FC<NodeCanvasProps> = ({ nodes, nodeClick, rootNodeId }) => {
  const organizedNodes = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      
      return (
        <>      
                <p>No Nodes Found</p>
                <Button onClick={(e) => {spawnNode(rootNodeId) } }>Spawn a Node</Button>
        </>
      )
    }
    const nodesByRow: { [key: number]: NodeState[] } = {};
    nodes.forEach(node => {
      if (node && Array.isArray(node.rootPath)) {
        const rowIndex = node.rootPath.length - 1;
        if (!nodesByRow[rowIndex]) {
          nodesByRow[rowIndex] = [];
        }
        nodesByRow[rowIndex].push(node);
      }
    });
    return nodesByRow;
  }, [nodes]);

  if (!nodes) {
    return <Box p={4}>Loading nodes...</Box>;
  }

  if (nodes.length === 0 || Object.keys(organizedNodes).length === 0) {
    return <Box p={4}>No nodes available to display.</Box>;
  }


  return (
    <Box width="full" height="full" overflowX="auto" overflowY="auto" p={4}>
      <VStack align="flex-start" spacing={4}>
        {Object.entries(organizedNodes).map(([rowIndex, rowNodes]) => (
          <HStack key={rowIndex} spacing={2} overflowX="auto" width="full">
            {rowNodes.map((node: NodeState) => (
              <NodeComponent 
                key={node.nodeId}
                node={node}
                nodeClick={nodeClick}
              />
            ))}
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};