import React, { useState, useEffect } from 'react';
import { Grid, GridItem, Text, Box } from "@chakra-ui/react";
import { NodeState } from "../lib/chainData";

interface GridNavigationProps {
  nodes: NodeState[];
  initialNodeId: string;
  onNodeSelect: (node: NodeState) => void;
  selectedNodeId: string | null;
}

export const GridNavigation: React.FC<GridNavigationProps> = ({ nodes, initialNodeId, onNodeSelect, selectedNodeId }) => {
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);

  useEffect(() => {
    const node = nodes.find(n => n.basicInfo[0] === (selectedNodeId || initialNodeId)) || nodes[0];
    if (node) {
      setSelectedNode(node);
    }
  }, [nodes, initialNodeId, selectedNodeId]);

  const handleNodeClick = (node: NodeState) => {
    setSelectedNode(node);
    onNodeSelect(node);
  };

  if (!selectedNode) return null;

  const getNodeDepth = (node: NodeState) => node.rootPath.length;

  const parentNode = nodes.find(node => node.basicInfo[0] === selectedNode.rootPath[getNodeDepth(selectedNode) - 2]);
  const childNodes = nodes.filter(node => node.rootPath[getNodeDepth(node) - 2] === selectedNode.basicInfo[0]);
  const siblingNodes = nodes.filter(node => 
    getNodeDepth(node) === getNodeDepth(selectedNode) &&
    node.rootPath[getNodeDepth(node) - 2] === selectedNode.rootPath[getNodeDepth(selectedNode) - 2] &&
    node.basicInfo[0] !== selectedNode.basicInfo[0]
  );

  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
      {parentNode && (
        <GridItem colSpan={3} key={`parent-${parentNode.basicInfo[0]}`}>
          <NodeBox node={parentNode} onClick={handleNodeClick} isSelected={false} />
        </GridItem>
      )}
      {siblingNodes.slice(0, 2).map((node) => (
        <GridItem key={`sibling-${node.basicInfo[0]}`}>
          <NodeBox node={node} onClick={handleNodeClick} isSelected={false} />
        </GridItem>
      ))}
      <GridItem key={`selected-${selectedNode.basicInfo[0]}`}>
        <NodeBox node={selectedNode} onClick={handleNodeClick} isSelected={true} />
      </GridItem>
      {childNodes.slice(0, 4).map((node) => (
        <GridItem key={`child-${node.basicInfo[0]}`}>
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
    <Text fontWeight="bold">{node.basicInfo[0]}</Text>
    <Text fontSize="sm">Value: {node.basicInfo[4]}</Text>
  </Box>
);

export default GridNavigation;