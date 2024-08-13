import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Grid, GridItem, Text, Button, VStack } from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { NodeState } from "../lib/chainData";

interface GridNavigationProps {
  nodes: NodeState[];
  initialNodeId: string;
  onNodeSelect: (nodeId: string) => void;
}

const GridNode: React.FC<{ node: NodeState; isSelected: boolean; onClick: () => void }> = ({ node, isSelected, onClick }) => (
  <Box 
    p={2} 
    border="1px" 
    borderColor={isSelected ? "blue.500" : "gray.200"} 
    borderRadius="md"
    bg={isSelected ? "blue.100" : "white"}
    onClick={onClick}
    cursor="pointer"
  >
    <Text fontWeight="bold">{node.nodeId}</Text>
    <Text fontSize="sm">{node.balanceBudget}</Text>
  </Box>
);

export const GridNavigation: React.FC<GridNavigationProps> = ({ nodes, initialNodeId, onNodeSelect }) => {
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const [visibleNodes, setVisibleNodes] = useState<NodeState[]>([]);
  const [gridSize, setGridSize] = useState({ width: 3, height: 3 });
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = nodes.find(n => n.nodeId === initialNodeId) || nodes[0];
    setSelectedNode(node);
  }, [initialNodeId, nodes]);

  const updateVisibleNodes = useCallback(() => {
    if (!selectedNode) return;

    const getNodesAtLevel = (startNode: NodeState, level: number): NodeState[] => {
      if (level === 0) return [startNode];
      const children = nodes.filter(n => n.rootPath[n.rootPath.length - 2] === startNode.nodeId);
      return children.flatMap(child => getNodesAtLevel(child, level - 1));
    };

    const getSiblings = (node: NodeState, count: number): NodeState[] => {
      const siblings = nodes.filter(n => n.rootPath[n.rootPath.length - 2] === node.rootPath[node.rootPath.length - 2] && n.nodeId !== node.nodeId);
      const leftSiblings = siblings.slice(-count);
      const rightSiblings = siblings.slice(0, count);
      return [...leftSiblings, node, ...rightSiblings];
    };

    const parent = nodes.find(n => n.nodeId === selectedNode.rootPath[selectedNode.rootPath.length - 2]);
    const siblings = getSiblings(selectedNode, Math.floor(gridSize.width / 2));
    const children = getNodesAtLevel(selectedNode, 1).slice(0, gridSize.height - 1);

    setVisibleNodes([
      parent,
      ...siblings,
      ...children,
    ].filter(Boolean));
  }, [selectedNode, nodes, gridSize]);

  useEffect(() => {
    updateVisibleNodes();
  }, [selectedNode, updateVisibleNodes]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedNode) return;

    switch(e.key) {
      case 'ArrowUp':
        const parent = nodes.find(n => n.nodeId === selectedNode.rootPath[selectedNode.rootPath.length - 2]);
        if (parent) setSelectedNode(parent);
        break;
      case 'ArrowDown':
        const child = nodes.find(n => n.rootPath[n.rootPath.length - 2] === selectedNode.nodeId);
        if (child) setSelectedNode(child);
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        const siblings = nodes.filter(n => n.rootPath[n.rootPath.length - 2] === selectedNode.rootPath[selectedNode.rootPath.length - 2]);
        const currentIndex = siblings.findIndex(n => n.nodeId === selectedNode.nodeId);
        const newIndex = e.key === 'ArrowLeft' ? 
          (currentIndex - 1 + siblings.length) % siblings.length : 
          (currentIndex + 1) % siblings.length;
        setSelectedNode(siblings[newIndex]);
        break;
    }
  }, [selectedNode, nodes]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.shiftKey) {
      setGridSize(prev => ({ ...prev, width: Math.max(3, prev.width - Math.sign(e.deltaY)) }));
    } else {
      setGridSize(prev => ({ ...prev, height: Math.max(3, prev.height - Math.sign(e.deltaY)) }));
    }
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (grid) {
      grid.addEventListener('wheel', handleWheel, { passive: false });
      return () => grid.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  useEffect(() => {
    if (selectedNode) {
      onNodeSelect(selectedNode.nodeId);
    }
  }, [selectedNode, onNodeSelect]);

  return (
    <VStack spacing={4} align="stretch">
      <Box position="relative" ref={gridRef} tabIndex={0}>
        <Grid 
          templateColumns={`repeat(${gridSize.width}, 1fr)`} 
          templateRows={`repeat(${gridSize.height}, 1fr)`}
          gap={2}
        >
          {visibleNodes.map((node) => (
            <GridItem key={node.nodeId}>
              <GridNode
                node={node}
                isSelected={node.nodeId === selectedNode?.nodeId}
                onClick={() => setSelectedNode(node)}
              />
            </GridItem>
          ))}
        </Grid>
        <ChevronUpIcon 
          position="absolute" 
          top="-20px" 
          left="50%" 
          transform="translateX(-50%)"
        />
        <ChevronDownIcon 
          position="absolute" 
          bottom="-20px" 
          left="50%" 
          transform="translateX(-50%)"
        />
        <ChevronLeftIcon 
          position="absolute" 
          left="-20px" 
          top="50%" 
          transform="translateY(-50%)"
        />
        <ChevronRightIcon 
          position="absolute" 
          right="-20px" 
          top="50%" 
          transform="translateY(-50%)"
        />
      </Box>
      <Text>Use arrow keys to navigate, Shift+Scroll to adjust width, Scroll to adjust height</Text>
    </VStack>
  );
};

export default GridNavigation;