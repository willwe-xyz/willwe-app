import type { NextApiRequest, NextApiResponse } from 'next'
import {Contract, ethers} from 'ethers'
import { CovalentClient, ChainID } from "@covalenthq/client-sdk";


import {deployments, ABIs, RPCurl, COV_APIKEY} from '../../../../const/envconst'

type ChainBalance = {
    tokenSymbol: string,
    tokenAddress: string,
    balance: string
  }

  type UserInteractions = {
    nodeId: string,
    balanceOf: string
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

interface ExtendedContextApiRequest extends NextApiResponse {
    body: {
        UserContext: UserContext
    }
}
 
export default async function handler(req: NextApiRequest, res: ExtendedContextApiRequest) {

    const { params } = req.query
    console.log("params", params)
    const chainID:string = params[0]
    const userAddr:string = params[1] 
  
    console.log("###### chain - addr  ", chainID, userAddr);
    
      const provider = new ethers.JsonRpcProvider(RPCurl[chainID]);
      const BB : Contract = new Contract(deployments["BagBok"][chainID], ABIs["BagBok"], provider);
      const Membrane : Contract= new Contract(deployments["Membrane"][chainID], ABIs["Membrane"], provider);
      const RVI : Contract = new Contract(deployments["RVI"][chainID], ABIs["RVI"], provider);
      const Execution : Contract = new Contract(deployments["Execution"][chainID], ABIs["Execution"], provider);

      const client = new CovalentClient(COV_APIKEY);
      const chain_id : ChainID = chainID; 

      const resp = await client.BalanceService.getTokenBalancesForWalletAddress(chain_id, userAddr);
      console.log("#### covaleent data : ", resp);

        let response: UserContext = {
          rawBalances: [],
          protocolBalances: [],
          nodes: []
        };

        const balances: UserInteractions[] = await BB.getUserInteractions(userAddr);
        console.log(balances);
        


        // response.protocolBalances = ;

        // Add a return statement to return the value of 'response'
        res.status(200).json(response);


}

// { } // GET `/api/post` (empty object)
// { "slug": ["a"] } // `GET /api/post/a` (single-element array)
// { "slug": ["a", "b"] } // `GET /api/post/a/b` (multi-element array)

// type ChainBalance = {
//     tokenSymbol: string,
//     tokenAddress: string,
//     balance: string
//   }
  
//   type ProtocolBalance = {
//     id: string,
//     parentId: string,
//     amount: string,
//     membraneId: string
//     isMember: boolean
//   }
  
//   type NodeState = {
//     nodeId: string,
//     inflationRate: string,
//     balanceA: string,
//     balanceB: string,
//     members: string,
//   }
  
  
//   export type UserContext = {
//     rawBalances: ChainBalance[],
//     protocolBalances: ProtocolBalance[],
//     nodes: NodeState[]
//   }