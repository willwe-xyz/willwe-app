import {deployments, ABIs, RPCurl, COV_APIKEY} from '../const/envconst'
import {BalanceItem } from "@covalenthq/client-sdk";
import {Contract, ethers} from "ethers";

export type ProtocolBalance = {
  id: string,
  parentId: string,
  amount: string,
  membraneId: string
  isMember: boolean
}

export type NodeState = {
  nodeId: string,
  inflationRate: string,
  balanceA: string,
  balanceB: string,
  members: string[],
}

export type UserContext = {
  protocolBalances: ProtocolBalance[],
  nodes: NodeState[],
  chainBalances: BalanceItem[]
}

export async function getAllData(chainID: string, userAddr: string) {

let PB  : ProtocolBalance[] = [];
let NodeStates : NodeState[] = [];

const provider = new ethers.JsonRpcProvider(RPCurl[chainID]);
const BB : Contract = new Contract(deployments["BagBok"][chainID], ABIs["BagBok"], provider);
const Membrane : Contract= new Contract(deployments["Membrane"][chainID], ABIs["Membrane"], provider);
const RVI : Contract = new Contract(deployments["RVI"][chainID], ABIs["RVI"], provider);
const Execution : Contract = new Contract(deployments["Execution"][chainID], ABIs["Execution"], provider);


const BBbalances = await BB.getUserInteractions(userAddr);

  
  BBbalances[0].forEach(async (X) => {
  let nodeId:string = X.toString();
  //// ignores membrane ids - extra call - @todo pack in one multicall or create util contract
  let parent: string = await BB.getParentOf(nodeId);
  if (nodeId.length > 20 && parent != "0") {
    let nodeAsAddress = await BB.toAddress(nodeId);
    let membrane: string = await BB.getMembraneOf(nodeId);
    let isMember: boolean = await BB.isMember(userAddr,nodeId);
    let inflation: string = await BB.inflationOf(nodeId);
    let balanceA: string = await BB.balanceOf(nodeAsAddress, parent);
    let balanceB: string = await BB.balanceOf(nodeAsAddress, nodeId);
    let membersOfNode: string[] = parent != "0" ? await BB.allMembersOf(nodeId) : [];



    let protocolB = {
      id: nodeId,
      parentId: parent,
      amount: String(BBbalances[1][BBbalances[0].indexOf(X)]),
      membraneId: membrane,
      isMember: isMember
    }

    let NS: NodeState = {
      nodeId: nodeId,
      inflationRate: inflation,
      balanceA: balanceA,
      balanceB: balanceB,
      members: membersOfNode,
    };
    
    NodeStates.push(NS);
    PB.push(protocolB);

    PB = PB;
    NodeStates = NodeStates;
  }
})

return { PB,  NodeStates }
}
