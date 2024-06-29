import React from 'react';
import {
  VStack,
  Box,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Container,
} from "@chakra-ui/react";
import { NodeState } from "../lib/chainData";
import { SubNodes } from "./SubNodes";

interface NodeStacksProps {
  stack: NodeState[];
  nodeClick: (nodeId: string) => void;
}

export const NodeStacks: React.FC<NodeStacksProps> = ({ stack, nodeClick }) => {
  if (!stack || stack.length === 0) {
    return <Text>No nodes available.</Text>;
  }

  return (
    <VStack spacing={4} align="stretch">
      {stack.map((node, index) => (
        <Box key={index} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
          <Accordion defaultIndex={[0]} allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Node ID: {node.nodeId}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Container id="nodeData">
                  <Text>User Address: {node.userAddress}</Text>
                  <Text>Inflation: {node.inflation}</Text>
                  <Text>Balance Anchor: {node.balanceAnchor}</Text>
                  <Text>Balance Budget: {node.balanceBudget}</Text>
                  <Text>Value: {node.value}</Text>
                  <Text>Membrane ID: {node.membraneId}</Text>
                  <Text>Members: {node.membersOfNode?.join(", ") || "None"}</Text>
                </Container>
                
                {node.childrenNodes && node.childrenNodes.length > 0 && (
                  <SubNodes
                    chNodes={node.childrenNodes}
                    handleNodeClick={nodeClick}
                    stackid={node.nodeId}
                  />
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>          
        </Box>
      ))}
    </VStack>
  );
};