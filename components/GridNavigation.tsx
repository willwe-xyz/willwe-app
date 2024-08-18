import React, { useState, useEffect } from 'react';
import { Grid, GridItem, Text, Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { NodeState } from "../lib/chainData";
import { useRouter } from 'next/router';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface GridNavigationProps {
  nodes: NodeState[];
  initialNodeId: string;
  onNodeSelect: (nodeId: string) => void;
}

export const GridNavigation: React.FC<GridNavigationProps> = ({ nodes, initialNodeId, onNodeSelect }) => {
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const router = useRouter();

  useEffect(() => {
    const node = nodes.find(n => n.basicInfo[0] === initialNodeId) || nodes[0];
    if (node) {
      setSelectedNode(node);
      router.push(`/node/${node.basicInfo[0]}`, undefined, { shallow: true });
    }
  }, [nodes, initialNodeId, router]);

  const handleNodeClick = (node: NodeState) => {
    setSelectedNode(node);
    onNodeSelect(node.basicInfo[0]);
    router.push(`/node/${node.basicInfo[0]}`, undefined, { shallow: true });
  };

  if (!selectedNode) return null;

  const parentNode = nodes.find(node => node.basicInfo[0] === selectedNode.rootPath[selectedNode.rootPath.length - 2]);
  const childNodes = nodes.filter(node => node.rootPath[node.rootPath.length - 2] === selectedNode.basicInfo[0]);
  const siblingNodes = nodes.filter(node => 
    node.rootPath[node.rootPath.length - 2] === selectedNode.rootPath[selectedNode.rootPath.length - 2] &&
    node.basicInfo[0] !== selectedNode.basicInfo[0]
  );

  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
      {parentNode && (
        <GridItem colSpan={{ base: 1, md: 3 }} key={`parent-${parentNode.basicInfo[0]}`}>
          <NodeBox node={parentNode} onClick={handleNodeClick} isSelected={false} direction="up" />
        </GridItem>
      )}
      <GridItem colSpan={{ base: 1, md: 3 }}>
        <Flex justifyContent="space-between">
          {siblingNodes.slice(0, 2).map((node) => (
            <NodeBox key={`sibling-${node.basicInfo[0]}`} node={node} onClick={handleNodeClick} isSelected={false} />
          ))}
          <NodeBox node={selectedNode} onClick={handleNodeClick} isSelected={true} />
        </Flex>
      </GridItem>
      {childNodes.slice(0, 4).map((node) => (
        <GridItem key={`child-${node.basicInfo[0]}`}>
          <NodeBox node={node} onClick={handleNodeClick} isSelected={false} direction="down" />
        </GridItem>
      ))}
    </Grid>
  );
};

interface NodeBoxProps {
  node: NodeState;
  onClick: (node: NodeState) => void;
  isSelected: boolean;
  direction?: 'up' | 'down';
}

const NodeBox: React.FC<NodeBoxProps> = ({ node, onClick, isSelected, direction }) => {
  const bgColor = useColorModeValue(isSelected ? "blue.50" : "white", isSelected ? "blue.900" : "gray.800");
  const borderColor = useColorModeValue(isSelected ? "blue.500" : "gray.200", isSelected ? "blue.500" : "gray.600");
  const hoverBg = useColorModeValue("gray.100", "gray.700");

  return (
    <Box
      p={3}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      bg={bgColor}
      cursor="pointer"
      onClick={() => onClick(node)}
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
    >
      {direction === 'up' && <ChevronUp size={16} />}
      <Text fontWeight="bold" fontSize="sm">{node.basicInfo[0]}</Text>
      <Text fontSize="xs">Value: {node.basicInfo[4]}</Text>
      {direction === 'down' && <ChevronDown size={16} />}
    </Box>
  );
};

export default GridNavigation;