import type { NextApiRequest, NextApiResponse } from 'next';
import { Contract, ethers } from 'ethers';
import { ChainID, BalanceItem } from "@covalenthq/client-sdk";
import { COV_APIKEY, RPCurl, deployments, ABIs } from '../../../../const/envconst';
import { getCovalentERC20TokenBalancesOf, FetchedUserData, UserContext, NodeState, UserSignal } from '../../../../lib/chainData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { params } = req.query;
    const chainID: ChainID = params[0] as ChainID;
    const userAddr: string = params[1] as string;

    const balances: BalanceItem[] = await getCovalentERC20TokenBalancesOf(userAddr, chainID) || [];
    const provider = new ethers.JsonRpcProvider(RPCurl[chainID]);
    const WW = new Contract(deployments["WillWe"][chainID], ABIs["WillWe"], provider);

    try {
        const data = await WW.getInteractionDataOf(userAddr);
        console.log("all interaction data : ", data);

        const activeBalancesResponse: [string[], string[]] = [
            data[0][0].map((item: any) => item.toString()),
            data[0][1].map((item: any) => item.toString())
        ];

        const NSs: NodeState[] = data[1].map((NS: any) => ({
            nodeId: NS.nodeId,
            inflation: NS.inflation,
            balanceAnchor: NS.balanceAnchor,
            balanceBudget: NS.balanceBudget,
            value: NS.value,
            membraneId: NS.membraneId,
            membersOfNode: NS.membersOfNode.map((member: any) => member.toString()),
            childrenNodes: NS.childrenNodes.map((child: any) => child.toString()),
            rootPath: NS.rootPath.map((path: any) => path.toString()),
            signals: NS.signals.map((signal: any) => ({
                MembraneInflation: [
                    signal.MembraneInflation[0].map((inflation: any) => inflation.toString()),
                    signal.MembraneInflation[1].map((inflation: any) => inflation.toString())
                ],
                lastRedistSignal: signal.lastRedistSignal.map((signal: any) => signal.toString())
            }))
        }));

        const userContext: UserContext = {
            activeBalancesResponse,
            nodes: NSs
        };

        const fetchedUserData: FetchedUserData = {
            balanceItems: balances,
            userContext
        };

        // Convert BigInt to string for JSON serialization
        const serializedData = JSON.parse(JSON.stringify(fetchedUserData, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        console.log("sending back - ", serializedData);
        res.status(200).json(serializedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
}
