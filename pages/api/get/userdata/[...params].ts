import type { NextApiRequest, NextApiResponse } from 'next';
import { Contract, ethers } from 'ethers';
import { ChainID, BalanceItem } from "@covalenthq/client-sdk";
import { RPCurl, deployments, ABIs } from '../../../../const/envconst';
import { getCovalentERC20TokenBalancesOf, FetchedUserData, UserContext, NodeState, UserSignal } from '../../../../lib/chainData';

type RawNodeState = {
  basicInfo: any[];
  membersOfNode: any[];
  childrenNodes: any[];
  rootPath: any[];
  signals: {
    MembraneInflation: [any[], any[]];
    lastRedistSignal: any[];
  }[];
};

const convertToString = (item: any): string => item.toString();

const parseNodeState = (NS: RawNodeState): NodeState => ({
  basicInfo: NS.basicInfo.map(convertToString),
  membersOfNode: NS.membersOfNode.map(convertToString),
  childrenNodes: NS.childrenNodes.map(convertToString),
  rootPath: NS.rootPath.map(convertToString),
  signals: NS.signals.map(signal => ({
    MembraneInflation: [
      signal.MembraneInflation[0].map(convertToString),
      signal.MembraneInflation[1].map(convertToString)
    ],
    lastRedistSignal: signal.lastRedistSignal.map(convertToString)
  }))
});

const fetchUserInteractionData = async (userAddr: string, chainID: ChainID): Promise<NodeState[]> => {
  const provider = new ethers.JsonRpcProvider(RPCurl[chainID]);
  const WW = new Contract(deployments["WillWe"][chainID], ABIs["WillWe"], provider);
  const rawData = await WW.getInteractionDataOf(userAddr);
  return rawData.map(parseNodeState);
};



const createUserContext = (nodes: NodeState[]): UserContext => ({ nodes });

const serializeData = (data: any): string => 
  JSON.stringify(data, (_, value) => typeof value === 'bigint' ? value.toString() : value);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { params } = req.query;
    const chainID = params[0] as ChainID;
    const userAddr = params[1] as string;

    const [balances, nodes] = await Promise.all([
      getCovalentERC20TokenBalancesOf(userAddr, chainID),
      fetchUserInteractionData(userAddr, chainID)
    ]);

    const fetchedUserData: FetchedUserData = {
      balanceItems: balances || [],
      userContext: createUserContext(nodes)
    };

    const serializedData = JSON.parse(serializeData(fetchedUserData));
    console.log("sending back - ", serializedData);
    res.status(200).json(serializedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}