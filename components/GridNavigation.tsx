import React, { useState, useEffect } from 'react';
import { Grid, GridItem, Text, Box } from "@chakra-ui/react";
import { NodeState } from "../lib/chainData";
import { useRouter } from 'next/router';

interface GridNavigationProps {
  nodes: NodeState[];
  initialNodeId: string;
  onNodeSelect: (nodeId: string) => void;
}

export const GridNavigation: React.FC<GridNavigationProps> = ({ nodes, initialNodeId, onNodeSelect }) => {
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const router = useRouter();

  useEffect(() => {
    const node = nodes.find(n => n.nodeId === initialNodeId) || nodes[0];
    if (node) {
      setSelectedNode(node);
      router.push(`/node/${node.nodeId}`, undefined, { shallow: true });
    }
  }, [nodes, initialNodeId, router]);

  const handleNodeClick = (node: NodeState) => {
    setSelectedNode(node);
    onNodeSelect(node.nodeId);
    router.push(`/node/${node.nodeId}`, undefined, { shallow: true });
  };


  if (!selectedNode) return null;

  const parentNode = nodes.find(node => node.nodeId === selectedNode.rootPath[selectedNode.rootPath.length - 2]);
  const childNodes = nodes.filter(node => node.rootPath[node.rootPath.length - 2] === selectedNode.nodeId);
  const siblingNodes = nodes.filter(node => 
    node.rootPath[node.rootPath.length - 2] === selectedNode.rootPath[selectedNode.rootPath.length - 2] &&
    node.nodeId !== selectedNode.nodeId
  );

  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
      {parentNode && (
        <GridItem colSpan={3} key={`parent-${parentNode.nodeId}`}>
          <NodeBox node={parentNode} onClick={handleNodeClick} isSelected={false} />
        </GridItem>
      )}
      {siblingNodes.slice(0, 2).map((node) => (
        <GridItem key={`sibling-${node.nodeId}`}>
          <NodeBox node={node} onClick={handleNodeClick} isSelected={false} />
        </GridItem>
      ))}
      <GridItem key={`selected-${selectedNode.nodeId}`}>
        <NodeBox node={selectedNode} onClick={handleNodeClick} isSelected={true} />
      </GridItem>
      {childNodes.slice(0, 4).map((node) => (
        <GridItem key={`child-${node.nodeId}`}>
          <NodeBox node={node} onClick={handleNodeClick} isSelected={false} />
        </GridItem>
      ))}
    </Grid>
  );
};

interface NodeBoxProps {
  node: NodeState;
  onClick: (node: NodeState) => void;
  isSelected: boolean;
}

const NodeBox: React.FC<NodeBoxProps> = ({ node, onClick, isSelected }) => (
  <Box
    p={2}
    border="1px solid"
    borderColor={isSelected ? "blue.500" : "gray.200"}
    borderRadius="md"
    bg={isSelected ? "blue.50" : "white"}
    cursor="pointer"
    onClick={() => onClick(node)}
  >
    <Text fontWeight="bold">{node.nodeId}</Text>
    <Text fontSize="sm">Value: {node.value}</Text>
  </Box>
);

export default GridNavigation;