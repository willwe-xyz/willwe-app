import type { NextApiRequest, NextApiResponse } from 'next'
import {Contract, ethers, parseEther, parseUnits} from 'ethers'
import { CovalentClient, ChainID, BalancesResponse, BalanceItem } from "@covalenthq/client-sdk";

import JSONBig from 'json-bigint';
import {COV_APIKEY} from '../../../../const/envconst'
import {getCovalentERC20TokenBalancesOf, SocialData, FetchedUserData} from '../../../../lib/chainData'
import { Chain } from 'viem';
import { getFarcasterProfileData } from '../../../../lib/airstackData';

  

 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
    const { params } = req.query
    const chainID:ChainID = params[0]
    const userAddr:string = params[1] 


    const balances: BalanceItem[] = await getCovalentERC20TokenBalancesOf(userAddr,chainID) || []
    // let fd: SocialData =  //= await getFarcasterProfileData(userAddr);

    const d: FetchedUserData = {
    balanceItems: balances,
    farcasterData: <SocialData>{}
    }
    

    res.status(200).json(JSONBig.parse(JSONBig.stringify( d)) );

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