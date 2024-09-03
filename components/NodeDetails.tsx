import React from 'react';
import { Box, Text, VStack, HStack, Badge, Code, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { NodeState, UserSignal } from '../types/chainData';
import { useNodeData } from '../hooks/useNodeData';
import router from 'next/router';

interface NodeDetailsProps {
  chainId: string;
  nodeId: string;
  onNodeSelect?: (nodeId: string) => void;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({  chainId, nodeId, onNodeSelect }) => {


   chainId = chainId ? chainId : router.query.chainId as string;
   nodeId = nodeId ? nodeId : router.query.nodeId as string;


  const { data: nodeData, error, isNodeLoading } = useNodeData<NodeState>(chainId, nodeId);

  
  // We should investigate where this incorrect assignment occurs
  if (!nodeData) {
    // TODO: Handle the case where node data is not available
    return (
      <Box borderWidth="1px" borderRadius="lg" p={4} bg="yellow.50">
        <Text fontSize="xl" fontWeight="bold">No Node Data Available</Text>
        <Text mt={2}>Please select a node to view its details.</Text>
      </Box>
    );
  }

  

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
          <Text>{nodeData.basicInfo[1]}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Balance Anchor:</Text>
          <Text>{nodeData.basicInfo[2]}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Balance Budget:</Text>
          <Text>{nodeData.basicInfo[3]}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Value:</Text>
          <Text>{nodeData.basicInfo[4]}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Membrane ID:</Text>
          <Text>{nodeData.basicInfo[5]}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Current User Balance:</Text>
          <Text>{nodeData.basicInfo[6]}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Members:</Text>
          <Badge colorScheme="green">{nodeData.membersOfNode.length}</Badge>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Children:</Text>
          <Badge colorScheme="blue">{nodeData.childrenNodes.length}</Badge>
        </HStack>
          <Text fontWeight="bold">Root Path:</Text>
          <Text fontSize="sm">{nodeData.rootPath.join(' > ')}</Text>
        
        {nodeData.signals.length > 0 && (
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
              {nodeData.signals.map((signal: UserSignal, index: number) => (
  <Tr key={index}>
    <Td>{signal.MembraneAndInflation[0][index].join(', ')}</Td>
    <Td>{signal.MembraneAndInflation[1][index].join(', ')}</Td>
    <Td>{signal.lastReidstriSig[index].join(', ')}</Td>
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