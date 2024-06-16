import { HStack } from "@chakra-ui/react";
import { TokenBalance } from "../components/TokenBalance";
import { BalanceItem } from "@covalenthq/client-sdk";
import {sortChainBalances} from "../lib/chainData";
import { useEffect, useState } from "react";
import { UserSignal, NodeState, evmAddressToFullIntegerString } from "../lib/chainData";




interface RootStack {
    chainBalances: BalanceItem[], 
    WillBals: BalanceItem[], 
    userNodes: NodeState[], 
    chainID: string
}

export const AllStacks: React.FC<RootStack> = ({ chainBalances, WillBals, userNodes, chainID }) => {
  chainBalances = sortChainBalances(chainBalances, WillBals);
  console.log(userNodes);
  
  let nodesArray : NodeState[] = []
  let lastActivatedNode : NodeState = {} as NodeState;

  const [activeStack, setStack] = useState(nodesArray);
  const [selectedNode, setSelectedNode] = useState(lastActivatedNode);




  function setNodeStack(selectedNode: NodeState) {
    let nodeStack: NodeState[] = [];
    let path : string[] = selectedNode.rootPath;
    console.log('path : ', path);
    for (let i = 0; i < path.length; i++) {
      let node: NodeState = userNodes.find(x => x.nodeId === path[i]) as NodeState;
      nodeStack.push(node);
    }
    console.log('nodeStack : ', nodeStack);
    setStack(nodeStack);
  }

  async function setCurrentActivatedNode(selectedNodeId: string) {
    console.log(userNodes);
    const selectedN: NodeState = userNodes.find(x => x.nodeId === selectedNodeId) as NodeState;

    console.log('selected node : ', evmAddressToFullIntegerString(selectedNodeId) )
    // const isRoot: boolean = selectedNodeId == selectedN.rootPath[0];
    // let nodeNumber = isRoot ? evmAddressToFullIntegerString(selectedNodeId) : selectedNodeId;

    

    // console.log('nodeNumber : ', nodeNumber);
    // console.log('selectedN : ', selectedN);

    // if (selectedN.rootPath.length == 0) console.log(Error("Bad Path or None Found"));
    // setSelectedNode(selectedN);
    // setNodeStack(selectedN);


  }


return (

<div className="allstacks">
  <div className="WalletHStack">
  <HStack 
    spacing="2px" 
    overflow="scroll" 
    overflowY={'hidden'} 
    className={`h-30 scrollbar custom-scrollbar scrollbar-h-2 scrollbar-thumb-[#5EA9B3] hover:scrollbar-thumb-[#19232F] active:scrollbar-thumb-[#dad6d6]`}
  > 
    
    {chainBalances.map((balance, index) => {
      if (balance.contract_address == '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        return null;
      }
      return (
        <div className="tokenBalWrap" key={index} onClick={() => setCurrentActivatedNode(balance.contract_address) } >
          <div className="tbContaier">
          <TokenBalance 
            balanceItem={balance} 
            chainID={chainID.toString()} 
            protocolDeposit={WillBals[WillBals.findIndex(x => x.contract_address === balance.contract_address)]}
          />
          </div>

        </div>
      );
    })}
  </HStack>
  </div>
</div>


);
}