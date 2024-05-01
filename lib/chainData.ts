import { ethers, Contract } from 'ethers';
import {RPCurl, deployments, ABIs} from "../const/envconst";


type ChainBalance = {
    tokenSymbol: string,
    tokenAddress: string,
    balance: string
  }
  
  type ProtocolBalance = {
    id: string,
    parentId: string,
    amount: string,
    membraneId: string
    isMember: boolean
  }
  
  type NodeState = {
    nodeId: string,
    inflationRate: string,
    balanceA: string,
    balanceB: string,
    members: string,
  }
  
  
  export type UserContext = {
    rawBalances: ChainBalance[],
    protocolBalances: ProtocolBalance[],
    nodes: NodeState[]
  }


    // Add a return statement to return a value of type UserContext
    return {
        rawBalances: [],
        protocolBalances: [],
        nodes: []
    };
}