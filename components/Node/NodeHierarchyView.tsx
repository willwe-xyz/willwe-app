import React from 'react';
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  Flex,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { NodeState } from '../../types/chainData';

interface NodeHierarchyViewProps {
  nodes: NodeState[];
  selectedTokenColor: string;
  onNodeSelect: (nodeId: string) => void;
  nodeValues: Record<string, number>;
}

interface HierarchyNode {
  node: NodeState;
  children: HierarchyNode[];
}

export const NodeHierarchyView: React.FC<NodeHierarchyViewProps> = ({
  nodes,
  selectedTokenColor,
  onNodeSelect,
  nodeValues,
}) => {
  // Move the color mode values to the component level
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Build hierarchy tree
  const buildHierarchyTree = (nodes: NodeState[]): HierarchyNode[] => {
    const nodeMap = new Map<string, HierarchyNode>();
    const roots: HierarchyNode[] = [];

    // Create nodes
    nodes.forEach(node => {
      nodeMap.set(node.basicInfo[0], {
        node,
        children: [],
      });
    });

    // Build relationships
    nodes.forEach(node => {
      const nodeId = node.basicInfo[0];
      const parentId = node.rootPath[node.rootPath.length - 2];
      
      if (parentId) {
        const parent = nodeMap.get(parentId);
        const current = nodeMap.get(nodeId);
        if (parent && current) {
          parent.children.push(current);
        }
      } else {
        const root = nodeMap.get(nodeId);
        if (root) {
          roots.push(root);
        }
      }
    });

    return roots;
  };

  const renderNode = (hierarchyNode: HierarchyNode, level: number = 0) => {
    const { node, children } = hierarchyNode;
    const depth = node.rootPath?.length || 0;

    // Calculate indentation and sizing based on depth
    const ml = level * 6; // Reduced margin
    const width = `calc(100% - ${ml}px)`;

    return (
      <Box key={node.basicInfo[0]} ml={`${ml}px`} width={width}>
        <Box
          p={3} // Reduced padding
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          mb={2}
          cursor="pointer"
          onClick={() => onNodeSelect(node.basicInfo[0])}
          _hover={{ shadow: 'md', borderColor: selectedTokenColor }}
          position="relative"
        >
          {/* Connection lines */}
          {level > 0 && (
            <>
              <Box
                position="absolute"
                left="-16px" // Reduced line length
                top="50%"
                width="16px"
                height="1px"
                bg={borderColor}
              />
              <Box
                position="absolute"
                left="-16px"
                top="-50%"
                width="1px"
                height="calc(100% + 16px)"
                bg={borderColor}
                display={level > 1 ? 'block' : 'none'}
              />
            </>
          )}
          
          <Grid templateColumns="repeat(4, 1fr)" gap={2}>
            <GridItem colSpan={2}>
              <Text fontWeight="bold" fontSize="sm">
                Node {node.basicInfo[0].slice(0, 6)}...
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">
                Depth: {depth}
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">
                {nodeValues[node.basicInfo[0]]}%
              </Text>
            </GridItem>
          </Grid>
          
          <Text fontSize="xs" color="gray.500">
            Members: {node.membersOfNode?.length || 0}
          </Text>
        </Box>
        
        {children.length > 0 && (
          <VStack align="stretch" spacing={1}> {/* Reduced spacing */}
            {children.map(child => renderNode(child, level + 1))}
          </VStack>
        )}
      </Box>
    );
  };

  const hierarchyTree = buildHierarchyTree(nodes);

  return (
    <Box overflowX="auto" p={4}>
      <VStack align="stretch" spacing={4}>
        {hierarchyTree.map(root => renderNode(root))}
      </VStack>
    </Box>
  );
};