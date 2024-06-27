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
import { useEffect, useState } from "react";
import { NodeState } from "../lib/chainData";
import SubNodes from "./SubNodes";

interface NodeStacksProps {
  nodeStack: NodeState[];
  selectedNode: NodeState;
  userAddress: string;
  chainID: string;
}

export const NodeStacks: React.FC<NodeStacksProps> = ({
  nodeStack,
  selectedNode,
  userAddress,
  chainID,
}) => {
  const [activeStack, setActiveStack] = useState<NodeState[]>(nodeStack);

  useEffect(() => {
    if (nodeStack.length == 0) setActiveStack(nodeStack);
  }, []);

  async function handleNodeClick(nodeId: string) {
    console.log(nodeStack);
    console.log("node clicked", nodeId);

    let selectedNode : NodeState = nodeStack.find((node) => node.nodeId === nodeId) || {} as NodeState;
    const indexOfSelected = nodeStack.indexOf(selectedNode);
    console.log("selected node", selectedNode);
    console.log("index of selected", indexOfSelected);

    if (! selectedNode.nodeId) {
      const response = await fetch(`/api/get/NODE-DATA/${chainID}/${nodeId}`);
       selectedNode = await response.json();
      console.log("got node data", selectedNode);
    }

    if (indexOfSelected == -1) {
      nodeStack.push(selectedNode);
      setActiveStack(nodeStack);
    } else {
      nodeStack.slice(0,indexOfSelected + 1);
      setActiveStack(nodeStack);
    }

    const newStack : NodeState[] = nodeStack.slice(0, parseInt(indexOfSelected) + 1);
    setActiveStack(newStack);




    // try {
    //   const response = await fetch(`/api/get/NODE-DATA/${chainID}/${nodeId}`);
    //   const clickedNodeData: NodeState = await response.json();

    //   if (clickedNodeData.nodeId !== "") {
    //     let newStack: NodeState[] = [...activeStack];

    //     const parentIndex = newStack.findIndex((node) => node.nodeId === nodeId);
    //     if (parentIndex === -1) {
    //       newStack = [...newStack, clickedNodeData];
    //     } else {
    //       newStack[parentIndex] = clickedNodeData;
    //     }

    //     setActiveStack(newStack);
    //     console.log("New active stack:", newStack);
    //   } else {
    //     console.log("Clicked node is invalid");
    //   }
    // } catch (error) {
    //   console.error("Error fetching node data:", error);
    // }
  }

  return (
    <VStack spacing={4} align="stretch" >
      {activeStack.map((node, index) => (
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
                  <Text>User Address: {userAddress}</Text>
                  <Text>Inflation: {node.inflation}</Text>
                  <Text>Balance Anchor: {node.balanceAnchor}</Text>
                  <Text>Balance Budget: {node.balanceBudget}</Text>
                  <Text>Value: {node.value}</Text>
                  <Text>Membrane ID: {node.membraneId}</Text>
                  <Text>Members: {node.membersOfNode?.join(", ")}</Text>
                </Container>
                
                  <SubNodes
                    key={index}
                    chNodes={node.childrenNodes}
                    handleNodeClick={handleNodeClick}
                    stackid={node.nodeId}
                  />
                
              </AccordionPanel>
            </AccordionItem>
          </Accordion>          
        </Box>
      ))}
    </VStack>
  );
};
