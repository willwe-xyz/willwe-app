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

export type UserSignal = {
    MembraneAndInflation: [string[], string[]],
    lastReidstriSig: string[]
}

export type NodeState =  {
  signals: UserSignal[],
  nodeId: string,
   inflation: string,
   balanceAnchor: string,
   balanceBudget: string,
   value: string,
   membraneId: string,
   lastMinted: string,
   inflPerSec: string,
   membersOfNode: string[],
  childrenNodes: string[],
  rootPath: string[]
}
export type UserContext = {
  protocolBalances: ProtocolBalance[],
  nodes: NodeState[],
}

export type ActiveBalances = {
  IDs: string[],
  Balances: string[]
}




export async function getAllData(chainID: string, userAddr: string) {

let PB  : ProtocolBalance[] = [];
let NodeStates : NodeState[] = [];

const provider = new ethers.JsonRpcProvider(RPCurl[chainID]);
const BB : Contract = new Contract(deployments["WillWe"][chainID], ABIs["WillWe"], provider);
const Membrane : Contract= new Contract(deployments["Membrane"][chainID], ABIs["Membrane"], provider);
const RVI : Contract = new Contract(deployments["RVI"][chainID], ABIs["RVI"], provider);
const Execution : Contract = new Contract(deployments["Execution"][chainID], ABIs["Execution"], provider);


const UC :UserContext = await BB.getInteractionDataOf(userAddr);
console.log(UC);
return UC;
}
