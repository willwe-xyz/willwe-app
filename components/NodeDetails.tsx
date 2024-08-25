import React from 'react';
import { Box, Text, VStack, HStack, Badge, Code, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

export type UserSignal = {
    MembraneAndInflation: [string[], string[]],
    lastReidstriSig: string[]
}

export type NodeState = {
  basicInfo: string[]; // [nodeId, inflation, balanceAnchor, balanceBudget, value, membraneId, currentUserBalance]
  membersOfNode: string[]; // Assuming 'address' is represented as a string
  childrenNodes: string[];
  rootPath: string[];
  signals: UserSignal[];
}

interface NodeDetailsProps {
  node: NodeState | null;
  chainId: string;
  onNodeSelect?: (nodeId: string) => void;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({ node, chainId, onNodeSelect }) => {
  console.log("NodeDetails props:", { node, chainId });

  if (!node) {
    return (
      <Box borderWidth="1px" borderRadius="lg" p={4} bg="yellow.50">
        <Text fontSize="xl" fontWeight="bold">No Node Data Available</Text>
        <Text mt={2}>Please select a node to view its details.</Text>
      </Box>
    );
  }

  const [nodeId, inflation, balanceAnchor, balanceBudget, value, membraneId, currentUserBalance] = node.basicInfo;

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <VStack align="start" spacing={3}>
        <Text fontSize="xl" fontWeight="bold">Node Details</Text>
        <HStack>
          <Text fontWeight="bold">Chain ID:</Text>
          <Code>{chainId}</Code>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Node ID:</Text>
          <Code>{nodeId}</Code>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Inflation:</Text>
          <Text>{inflation}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Balance Anchor:</Text>
          <Text>{balanceAnchor}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Balance Budget:</Text>
          <Text>{balanceBudget}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Value:</Text>
          <Text>{value}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Membrane ID:</Text>
          <Text>{membraneId}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Current User Balance:</Text>
          <Text>{currentUserBalance}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Members:</Text>
          <Badge colorScheme="green">{node.membersOfNode.length}</Badge>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Children:</Text>
          <Badge colorScheme="blue">{node.childrenNodes.length}</Badge>
        </HStack>
        <Text fontWeight="bold">Root Path:</Text>
        <Text fontSize="sm">{node.rootPath.join(' > ')}</Text>
        
        {node.signals.length > 0 && (
          <Box>
            <Text fontWeight="bold" mt={4}>Signals:</Text>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Membrane</Th>
                  <Th>Inflation</Th>
                  <Th>Last Redistribution Signal</Th>
                </Tr>
              </Thead>
              <Tbody>
                {node.signals.map((signal, index) => (
                  <Tr key={index}>
                    <Td>{signal.MembraneAndInflation[0].join(', ')}</Td>
                    <Td>{signal.MembraneAndInflation[1].join(', ')}</Td>
                    <Td>{signal.lastReidstriSig.join(', ')}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default NodeDetails;