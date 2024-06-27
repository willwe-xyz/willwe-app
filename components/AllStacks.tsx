import { HStack, Box, Text, Button, Card } from "@chakra-ui/react";
import { TokenBalance } from "./TokenBalance";
import { BalanceItem } from "@covalenthq/client-sdk";
import { sortChainBalances, evmAddressToFullIntegerString } from "../lib/chainData";
import { useState, useEffect } from "react";
import { NodeState } from "../lib/chainData";
import { NodeStacks } from "./NodeStacks";
import { SiCreatereactapp } from "react-icons/si";

interface RootStack {
  chainBalances: BalanceItem[],
  WillBals: BalanceItem[],
  userNodes: NodeState[],
  chainID: string,
  userAddress: string
}

export const AllStacks: React.FC<RootStack> = ({ chainBalances, WillBals, userNodes, chainID, userAddress }) => {
  const safeWillBals = Array.isArray(WillBals) ? WillBals : [];
  const [sortedChainBalances, setSortedChainBalances] = useState<BalanceItem[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const [nodeStack, setNodeStack] = useState<NodeState[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState('');

  useEffect(() => {
    setSortedChainBalances(sortChainBalances(chainBalances, safeWillBals));
  }, []);

  function handleNodeClick(nodeId: string) {
    const clickedNode = userNodes.find(node => node.nodeId === nodeId);
    if (clickedNode) {
      setSelectedNode(clickedNode);
      setNodeStack([clickedNode]);
      setSelectedNodeId(nodeId);
    } else {
      setSelectedNode(null);
      setNodeStack([]);
      setSelectedNodeId('');
    }
  }

  return (
    <div className="allstacks">
      <HStack spacing='3px' overflowX="auto" sx={{
        '&::-webkit-scrollbar': {
          height: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'gray',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
      }}>
        {sortedChainBalances.map((balance, index) => (
          <Box
            key={index}
            onClick={() => handleNodeClick(evmAddressToFullIntegerString(balance.contract_address))}
            _hover={{ backgroundColor: 'gray.200' }}
            _selected={{ bg: 'gray.200' }}
          >
            <TokenBalance
              balanceItem={balance}
              chainID={chainID}
              protocolDeposit={safeWillBals.find(willBal => willBal.contract_address === balance.contract_address)}
              isSelected={selectedNode?.nodeId === evmAddressToFullIntegerString(balance.contract_address)}
            />
          </Box>
        ))}
      </HStack>
      <Card>
        {selectedNode ? (
          <NodeStacks nodeStack={nodeStack} selectedNode={selectedNode} userAddress={userAddress} chainID={chainID} />
        ) : (
          <div className="NoNodeContent">
            {selectedNodeId ? (
              <div>
                <Text>No Nodes Found</Text>
                <hr />
                <Button>
                  <SiCreatereactapp />Spawn Node
                </Button>
              </div>
            ) : (
              <Text>No node Selected</Text>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};