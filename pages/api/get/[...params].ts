import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { getAllData, getNodeData, getCovalentERC20TokenBalancesOf } from '../../../lib/chainData'
import { deployments, getChainById } from '../../../const/envconst'
import JSONBig from 'json-bigint'
import { BalanceItem } from '@covalenthq/client-sdk'
import { NodeState } from '../../../lib/chainData'  
import {RPCurl} from '../../../const/envconst' 


type Operation = 'WILLBALANCES' | 'userdata' | 'NODE-DATA' 

interface ParsedQuery {
  operation: Operation
  chainID: string
  contract?: string
  userAddress?: string
  nodeId?: string
}

export type UserContext = {
  nodes: NodeState[],
}

export type FetchedUserData = {
  balanceItems: BalanceItem[],
  userContext: UserContext
}

function parseQuery(query: { params?: string[] }): ParsedQuery {
  const [operation, chainID, thirdParam] = query.params || []
  
  return {
    operation: operation as Operation,
    chainID,
    contract: operation === 'WILLBALANCES' ? thirdParam : undefined,
    userAddress: operation === 'userdata' ? thirdParam : undefined,
    nodeId: operation === 'NODE-DATA' ? thirdParam : undefined
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { operation, chainID, userAddress, nodeId, contract } = parseQuery(req.query)
    
    if (!operation || !chainID) {
      return res.status(400).json({ error: "Operation and chainID are required" })
    }

    const currentChain = getChainById(chainID)
    const provider = new ethers.JsonRpcProvider(RPCurl[chainID] || currentChain.rpcUrls.default.http[0])
    let response: any = null

    switch (operation) {
      case 'WILLBALANCES':
        response = await getCovalentERC20TokenBalancesOf(deployments["WillWe"][chainID], chainID)
        break
      case 'userdata':
        if (!userAddress) {
          return res.status(400).json({ error: "userAddress is required for userdata operation" })
        }
        const allData = await getAllData(chainID, userAddress)
        response = {
          balanceItems: allData.chainBalances,
          userContext: {
            activeBalancesResponse: allData.activeBalancesResponse,
            nodes: allData.userNodes
          }
        } as FetchedUserData
        break
      case 'NODE-DATA':
        if (!nodeId) {
          return res.status(400).json({ error: "nodeId is required for NODE-DATA operation" })
        }
        response = await getNodeData(chainID, nodeId)
        break
      default:
        return res.status(400).json({ error: "Invalid operation" })
    }

    res.status(200).json(JSONBig.parse(JSONBig.stringify(response)))
  } catch (error) {
    console.error('Error in API handler:', error)
    res.status(500).json({ error: "Internal server error" })
  }
}