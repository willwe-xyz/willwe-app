// import type { NextApiRequest, NextApiResponse } from 'next';
// import { Contract, ethers } from 'ethers';
// import { ChainID, BalanceItem } from "@covalenthq/client-sdk";
// import { RPCurl, deployments, ABIs } from '../../../const/envconst';
// import { 
//   getCovalentERC20TokenBalancesOf, 
//   FetchedUserData, 
//   UserContext, 
//   NodeState, 
//   getAllNodesForRoot,
//   getNodeData
// } from '../../../../lib/chainData';

// type Operation = 'WILLBALANCES' | 'userdata' | 'NODE-DATA' | 'ALLNODESFOR';

// interface ParsedQuery {
//   operation: Operation;
//   chainID: ChainID;
//   param1?: string;
//   param2?: string;
// }

// type RawNodeState = {
//   basicInfo: any[];
//   membersOfNode: any[];
//   childrenNodes: any[];
//   rootPath: any[];
//   signals: {
//     MembraneInflation: [any[], any[]];
//     lastRedistSignal: any[];
//   }[];
// };

// const convertToString = (item: any): string => item.toString();

// const parseNodeState = (NS: RawNodeState): NodeState => ({
//   basicInfo: NS.basicInfo.map(convertToString),
//   membersOfNode: NS.membersOfNode.map(convertToString),
//   childrenNodes: NS.childrenNodes.map(convertToString),
//   rootPath: NS.rootPath.map(convertToString),
//   signals: NS.signals.map(signal => ({
//     MembraneInflation: [
//       signal.MembraneInflation[0].map(convertToString),
//       signal.MembraneInflation[1].map(convertToString)
//     ],
//     lastRedistSignal: signal.lastRedistSignal.map(convertToString)
//   }))
// });

// const fetchUserInteractionData = async (userAddr: string, chainID: ChainID): Promise<NodeState[]> => {
//   const provider = new ethers.JsonRpcProvider(RPCurl[chainID]);
//   const WW = new Contract(deployments["WillWe"][chainID], ABIs["WillWe"], provider);
//   const rawData = await WW.getInteractionDataOf(userAddr);
//   return rawData.map(parseNodeState);
// };

// const createUserContext = (nodes: NodeState[]): UserContext => ({ nodes });

// const serializeData = (data: any): string => 
//   JSON.stringify(data, (_, value) => typeof value === 'bigint' ? value.toString() : value);

// function parseQuery(params: string[]): ParsedQuery {
//   const [operation, chainID, param1, param2] = params;
//   return {
//     operation: operation as Operation,
//     chainID: chainID as ChainID,
//     param1,
//     param2
//   };
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Method Not Allowed' });
//   }

//   const { params } = req.query;
//   if (!Array.isArray(params) || params.length < 2) {
//     return res.status(400).json({ error: 'Invalid parameters' });
//   }

//   const { operation, chainID, param1, param2 } = parseQuery(params);

//   try {
//     let response: any;

//     switch (operation) {
//       case 'WILLBALANCES':
//         response = await getCovalentERC20TokenBalancesOf(deployments["WillWe"][chainID], chainID);
//         break;

//         case 'userdata':
//           if (!param1) {
//             return res.status(400).json({ error: "User address is required for userdata operation" });
//           }
//           console.log('Fetching user data for:', param1, 'on chain:', chainID);
//           const [balances, nodes] = await Promise.all([
//             getCovalentERC20TokenBalancesOf(param1, chainID),
//             fetchUserInteractionData(param1, chainID)
//           ]);
//           console.log('Balances len:', balances.length);
//           console.log('Nodes len:', nodes.length);
//           response = {
//             balanceItems: balances || [],
//             userContext: createUserContext(nodes)
//           };
//           break;
//       case 'NODE-DATA':
//         if (!param1) {
//           return res.status(400).json({ error: "Node ID is required for NODE-DATA operation" });
//         }
//         response = await getNodeData(chainID, param1);
//         break;

//       case 'ALLNODESFOR':
//         if (!param1) {
//           return res.status(400).json({ error: "Root address is required for ALLNODESFOR operation" });
//         }
//         response = await getAllNodesForRoot(chainID, param1);
//         break;

//       default:
//         return res.status(400).json({ error: "Invalid operation" });
//     }

//     const serializedData = JSON.parse(serializeData(response));
//     res.status(200).json(serializedData);
//   } catch (error) {
//     console.error('Error in API handler:', error);
//     res.status(500).json({ error: "Internal server error", details: error.message });
//   }
// }