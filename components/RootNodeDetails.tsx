import React, { useState, useCallback, useMemo } from 'react';
import { Box, Text, Flex, Input, IconButton, Spinner } from "@chakra-ui/react";
import { Search, ZoomIn, ZoomOut } from 'lucide-react';
import { NodeState, RootNodeState } from "../types/chainData";
import { useColorManagement } from './AllStackComponents';
import { useRootNodes } from '../hooks/useRootNodes';
import { useRouter } from 'next/router';
import { NodePill } from './NodePill';

interface RootNodeDetailsProps {
  chainId: string;
  rootToken: string;
  selectedTokenColor: string
  onNodeSelect: (nodeId: string) => void;
}

export const RootNodeDetails: React.FC<RootNodeDetailsProps> = ({ chainId, rootToken, selectedTokenColor, onNodeSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredNodePath, setHoveredNodePath] = useState<string[]>([]);
  const [tokenColor, setTokenColor] = useState(`#${rootToken.slice(-6)}`);
  const router = useRouter();

  const { rootNodeStates, isLoading, error } = useRootNodes(chainId, rootToken);

  const handleNodeClick = useCallback((nodeId: string) => {
    onNodeSelect(nodeId);
    // router.push(`/nodes/${chainId}/${nodeId}`);
  }, [router, chainId]);

  const filteredNodes = useMemo(() => {
    return rootNodeStates.flatMap(state => state.nodes.filter(node => 
      node.basicInfo[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.basicInfo[4].toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }, [rootNodeStates, searchTerm]);

  const getNodeColor = useCallback((value: string, maxValue: number) => {
    const normalizedValue = Math.min(parseInt(value) / maxValue, 1);
    return `rgba(${parseInt(tokenColor.slice(1, 3), 16)}, ${parseInt(tokenColor.slice(3, 5), 16)}, ${parseInt(tokenColor.slice(5, 7), 16)}, ${normalizedValue})`;
  }, [tokenColor]);

  const totalValue = useMemo(() => {
    return filteredNodes.reduce((sum, node) => sum + parseInt(node.basicInfo[4]), 0);
  }, [filteredNodes]);

  const maxValue = useMemo(() => {
    return Math.max(...filteredNodes.map(node => parseInt(node.basicInfo[4])));
  }, [filteredNodes]);

  const handleNodeHover = useCallback((node: NodeState) => {
    setHoveredNodePath(node.rootPath);
  }, []);

  const renderNode = (node: NodeState, depth: number) => {
    const nodeColor = getNodeColor(node.basicInfo[4], maxValue);
    const isHighlighted = hoveredNodePath.includes(node.basicInfo[0]);

    return (
      <Box 
        key={node.basicInfo[0]} 
        ml={depth * 20} 
        mb={1}
        opacity={isHighlighted ? 1 : hoveredNodePath.length > 0 ? 0.5 : 1}
        transition="opacity 0.2s"
        backgroundColor={`${selectedTokenColor}`}
      >
        <Flex alignItems="center">
          <Box width={depth > 0 ? "20px" : "0"} borderTop="1px solid" borderColor={tokenColor} backgroundColor={`${selectedTokenColor}`} mr={2} />
          <NodePill
            node={node}
            totalValue={totalValue}
            backgroundColor={`${selectedTokenColor}99`}
            borderColor={selectedTokenColor}
            textColor={tokenColor}
            onNodeClick={handleNodeClick}
            onMintMembership={(nodeId) => console.log(`Mint membership for ${nodeId}`)}
            onSpawnNode={(nodeId) => console.log(`Spawn node from ${nodeId}`)}
            onTrickle={(nodeId) => console.log(`Trickle/redistribute for ${nodeId}`)}
          />
        </Flex>
        <Box ml={4}>
          {node.childrenNodes.map(childId => {
            const childNode = filteredNodes.find(n => n.basicInfo[0] === childId);
            return childNode ? renderNode(childNode, depth + 1) : null;
          })}
        </Box>
      </Box>
    );
  };

  if (isLoading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">Error: {error.message}</Text>;

  const rootNode = filteredNodes.find(node => node.rootPath.length === 1);

  return (
    <Box p={4} position="relative" height="100%" overflowY="auto" bg={tokenColor}>
      <Flex justify="space-between" align="center" mb={4}>
        <Input
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          width="200px"
          bg="white"
        />
        <Flex>
          <IconButton
            aria-label="Zoom out"
            icon={<ZoomOut size={20} />}
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
            mr={2}
          />
          <IconButton
            aria-label="Zoom in"
            icon={<ZoomIn size={20} />}
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
          />
        </Flex>
      </Flex>
      <Box 
        transform={`scale(${zoomLevel})`} 
        transformOrigin="top left"
        onMouseLeave={() => setHoveredNodePath([])}
      >
        {rootNode && renderNode(rootNode, 0)}
      </Box>
    </Box>
  );
};

export default RootNodeDetails;