import type { NextApiRequest, NextApiResponse } from 'next'
import {Contract, ethers, parseEther, parseUnits} from 'ethers'
import {ChainID, BalancesResponse, BalanceItem } from "@covalenthq/client-sdk";
import {getAllData, getCovalentERC20TokenBalancesOf} from '../../../lib/chainData'

import { deployments, ABIs, getChainById } from '../../../const/envconst';
import * as chainsData from 'viem/chains';
import { extractChain } from 'viem'
import JSONBig from 'json-bigint';




 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { params } = req.query

    const OPERATION:string = params[0]
    const chainID:string = params?.length > 2 ? params[1] : null
    const contract:string = params?.length > 2 ? params[2] : null
    const whoAbout:string = params?.length > 3 ? params[3] : null


    const currentChain = getChainById(chainID);    
    const provider = new ethers.JsonRpcProvider(currentChain.rpcUrls.default.http[0]);
    // const WWE = new Contract(deployments["WillWe"][chainID], ABIs["WillWe"]["abi"], provider);
    let response : any = null; 

    if (OPERATION === "WILLBALANCES") {
    response = await getCovalentERC20TokenBalancesOf(`${deployments["WillWe"][chainID]}`,chainID);
    response = response;
    }

    if (OPERATION === "GETUSERCONTEXT") {
        response = await getAllData(chainID, whoAbout);
    }



    res.status(200).json(JSONBig.parse(JSONBig.stringify( response )));
 
  
}
