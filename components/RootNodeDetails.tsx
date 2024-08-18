import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Heading, Text, VStack, Alert, AlertIcon, Button, Skeleton,
  Code, Accordion, AccordionItem, AccordionButton, AccordionPanel,
  AccordionIcon, Input, InputGroup, InputLeftElement, Tooltip
} from "@chakra-ui/react";
import { NodeState, getAllNodesForRoot, RootNodeState } from "../lib/chainData";
import { RefreshCw, Search, ChevronRight } from 'lucide-react';
import { motion } from "framer-motion";

interface RootNodeDetailsProps {
  chainId: string;
  rootToken: string;
}

interface NodeBoxProps {
  node: NodeState;
  depth: number;
}

const NodeBox: React.FC<NodeBoxProps> = ({ node, depth }) => {
  const [nodeId, inflation, balanceAnchor, balanceBudget, value, membraneId, currentUserBalance] = node.basicInfo;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: depth * 0.1 }}
    >
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="bold">Node ID: {nodeId}</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm">Inflation: {inflation}</Text>
              <Text fontSize="sm">Balance Anchor: {balanceAnchor}</Text>
              <Text fontSize="sm">Balance Budget: {balanceBudget}</Text>
              <Text fontSize="sm">Value: {value}</Text>
              <Text fontSize="sm">Membrane ID: {membraneId}</Text>
              <Text fontSize="sm">Current User Balance: {currentUserBalance}</Text>
              <Text fontSize="sm">Members: {node.membersOfNode.length}</Text>
              <Text fontSize="sm">Children: {node.childrenNodes.length}</Text>
              {node.childrenNodes.length > 0 && (
                <Button
                  size="sm"
                  leftIcon={<ChevronRight size={16} />}
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Implement logic to expand child nodes
                  }}
                >
                  Show Children
                </Button>
              )}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
};

const RootNodeDetails: React.FC<RootNodeDetailsProps> = ({ chainId, rootToken }) => {
  const [nodes, setNodes] = useState<RootNodeState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const numericChainId = useMemo(() => {
    const match = chainId.match(/:\s*(\d+)/);
    return match ? match[1] : chainId;
  }, [chainId]);

  const fetchNodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRawError(null);
    
    if (!numericChainId || !rootToken) {
      setError(`Missing ${!numericChainId ? 'chainId' : 'rootToken'}`);
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching nodes for chainId:", numericChainId, "and rootToken:", rootToken);
      const fetchedNodes = await getAllNodesForRoot(numericChainId, rootToken);
      setNodes(fetchedNodes);
    } catch (error) {
      console.error("Error fetching nodes:", error);
      setError("Failed to fetch nodes. Please check the console for more details.");
      setRawError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }, [numericChainId, rootToken]);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const filteredNodes = useMemo(() => {
    return nodes.map(rootNode => ({
      ...rootNode,
      nodes: rootNode.nodes.filter(node => 
        node.basicInfo[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.basicInfo.some(info => info.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    })).filter(rootNode => rootNode.nodes.length > 0);
  }, [nodes, searchTerm]);

  if (isLoading) {
    return (
      <Box p={4}>
        <Skeleton height="40px" mb={4} />
        <VStack spacing={4}>
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} height="100px" width="100%" />
          ))}
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" p={4}>
        <AlertIcon boxSize="40px" mr={0} />
        <Text mt={4} mb={2}>{error}</Text>
        {rawError && (
          <Code p={2} maxWidth="100%" overflowX="auto" fontSize="sm" mt={2}>
            {rawError}
          </Code>
        )}
        <Button leftIcon={<RefreshCw size={16} />} onClick={handleRetry} mt={4}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box p={4}>
      <Heading size="md" mb={4}>Nodes for Root Token: {rootToken}</Heading>
      <Text mb={2}>Chain ID: {chainId} (Numeric: {numericChainId})</Text>
      <Button leftIcon={<RefreshCw size={16} />} onClick={handleRetry} mb={4} size="sm">
        Refresh
      </Button>
      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <Search size={20} />
        </InputLeftElement>
        <Input
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>
      {filteredNodes.length === 0 ? (
        <Text>No nodes found matching your search criteria.</Text>
      ) : (
        filteredNodes.map((rootNode, index) => (
          <Box key={index} mb={4}>
            <Heading size="sm" mb={2}>Depth: {rootNode.depth}</Heading>
            <VStack spacing={4} align="stretch">
              {rootNode.nodes.map((node) => (
                <NodeBox key={node.basicInfo[0]} node={node} depth={rootNode.depth} />
              ))}
            </VStack>
          </Box>
        ))
      )}
    </Box>
  );
};

export default RootNodeDetails;