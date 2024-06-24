import { VStack, Box, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Container } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { NodeState } from "../lib/chainData";
import SubNodes from "./SubNodes";

interface NodeStacksProps {
  nodeStack: NodeState[];
  selectedNode: NodeState;
  userAddress: string;
  chainID: string;
}

export const NodeStacks: React.FC<NodeStacksProps> = ({ nodeStack, selectedNode, userAddress, chainID }) => {
  const [activeStack, setActiveStack] = useState<NodeState[]>([]);
  const [indexOfSelected, setIndexOfSelected] = useState<number>(0);

  useEffect(() => {
    const selectedIndex = nodeStack.findIndex((node) => node.nodeId === selectedNode.nodeId);
    setActiveStack(nodeStack.slice(0, selectedIndex + 1));
    setIndexOfSelected(selectedIndex);
  }, [nodeStack, selectedNode]);

  async function handleNodeClick(nodeId: string) {
    console.log('node clicked', nodeId);
    const index = nodeStack.findIndex((node) => node.nodeId === nodeId);
  
    if (index === -1) {
      try {
        const response = await fetch(`/api/get/NODE-DATA/${chainID}/${nodeId}`);
        const newNodeData: NodeState = await response.json();
  
        if (newNodeData.nodeId !== '') {
          const updatedNodeStack = [...nodeStack, newNodeData];
          setActiveStack(updatedNodeStack);
          setIndexOfSelected(updatedNodeStack.length - 1);
        } else {
          const newStack: NodeState[] = newNodeData.rootPath.map(n => 
            nodeStack.find(node => node.nodeId === n) || {} as NodeState
          );
          setActiveStack(newStack);
          setIndexOfSelected(newStack.length - 1);
        }
      } catch (error) {
        console.error("Error fetching node data:", error);
      }
    } else {
      setIndexOfSelected(index);
      setActiveStack(nodeStack.slice(0, index + 1));
    }
  }

  return (
    <VStack spacing={4} align="stretch" key={selectedNode.nodeId}>
      {activeStack.map((node) => (
        <Box key={node.nodeId} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
          <Accordion allowToggle>
            <AccordionItem key={node.nodeId}>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Node ID: {node.nodeId}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Container id='nodeData'>
                  {/* Add more node-specific content here */}
                  <Text>User Address: {userAddress}</Text>
                </Container>
                <SubNodes
                  chNodes={node.childrenNodes}
                  handleNodeClick={handleNodeClick}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      ))}
    </VStack>
  );
};
