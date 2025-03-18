import { baseSepolia, base, taiko, taikoHekla  } from "viem/chains";
// import { defineChain, Hex } from "viem";
import {  InterfaceAbi }  from "ethers";
import * as chains from 'viem/chains';
import { BalanceItem } from "@covalenthq/client-sdk";
import { Chain } from "viem";

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
export const COV_APIKEY= process.env.COV_APIKEY;




type Deployments = {
    [key: string]: {
        [key: string]: string;
    };
};

type ABIKP = {
    [key: string]: 
         InterfaceAbi; 
};






  /**
   * Gets the chain object for the given chain id.
   * @param chainId - Chain id of the target EVM chain.
   * @returns Viem's chain object.
   */
  export function getChainById(chainId: string) : Chain {
    for (const chain of Object.values(chains)) {
      if ('id' in chain) {
        if (chain.id === Number(chainId)) {
          return chain as Chain;
        }
      }
    }

    throw new Error(`Chain with id ${chainId} not found`);
  }



export const ABIs: ABIKP = {
    "WillWe" :   [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "Execution",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "Membrane",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "Will",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "allMembersOf",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address[]",
                    "internalType": "address[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "asRootValuation",
            "inputs": [
                {
                    "name": "target_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "rAmt",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "balanceOf",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "balanceOfBatch",
            "inputs": [
                {
                    "name": "owners",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "ids",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "outputs": [
                {
                    "name": "balances",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "burn",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "topVal",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "burnPath",
            "inputs": [
                {
                    "name": "target_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "calculateUserTargetedPreferenceAmount",
            "inputs": [
                {
                    "name": "childId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "parentId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "signal",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "user",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "control",
            "inputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "createEndpointForOwner",
            "inputs": [
                {
                    "name": "nodeId_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "endpoint",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "entityCount",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "executeQueue",
            "inputs": [
                {
                    "name": "SignatureQueueHash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "s",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "executionAddress",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getAllNodesForRoot",
            "inputs": [
                {
                    "name": "rootAddress",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "userIfAny",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "nodes",
                    "type": "tuple[]",
                    "internalType": "struct NodeState[]",
                    "components": [
                        {
                            "name": "basicInfo",
                            "type": "string[9]",
                            "internalType": "string[9]"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "string[2][]",
                                    "internalType": "string[2][]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "string[]",
                                    "internalType": "string[]"
                                }
                            ]
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getChildParentEligibilityPerSec",
            "inputs": [
                {
                    "name": "childId_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "parentId_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getChildrenOf",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getFidPath",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "fids",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getMembraneOf",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getNodeData",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "NodeData",
                    "type": "tuple",
                    "internalType": "struct NodeState",
                    "components": [
                        {
                            "name": "basicInfo",
                            "type": "string[9]",
                            "internalType": "string[9]"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "string[2][]",
                                    "internalType": "string[2][]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "string[]",
                                    "internalType": "string[]"
                                }
                            ]
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getNodeDataWithUserSignals",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "user",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "nodeData",
                    "type": "tuple",
                    "internalType": "struct NodeState",
                    "components": [
                        {
                            "name": "basicInfo",
                            "type": "string[9]",
                            "internalType": "string[9]"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "string[2][]",
                                    "internalType": "string[2][]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "string[]",
                                    "internalType": "string[]"
                                }
                            ]
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getNodes",
            "inputs": [
                {
                    "name": "nodeIds",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "outputs": [
                {
                    "name": "nodes",
                    "type": "tuple[]",
                    "internalType": "struct NodeState[]",
                    "components": [
                        {
                            "name": "basicInfo",
                            "type": "string[9]",
                            "internalType": "string[9]"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "string[]",
                            "internalType": "string[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "string[2][]",
                                    "internalType": "string[2][]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "string[]",
                                    "internalType": "string[]"
                                }
                            ]
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getParentOf",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getSigQueue",
            "inputs": [
                {
                    "name": "hash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "internalType": "struct SignatureQueue",
                    "components": [
                        {
                            "name": "state",
                            "type": "uint8",
                            "internalType": "enum SQState"
                        },
                        {
                            "name": "Action",
                            "type": "tuple",
                            "internalType": "struct Movement",
                            "components": [
                                {
                                    "name": "category",
                                    "type": "uint8",
                                    "internalType": "enum MovementType"
                                },
                                {
                                    "name": "initiatior",
                                    "type": "address",
                                    "internalType": "address"
                                },
                                {
                                    "name": "exeAccount",
                                    "type": "address",
                                    "internalType": "address"
                                },
                                {
                                    "name": "viaNode",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "expiresAt",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "descriptionHash",
                                    "type": "bytes32",
                                    "internalType": "bytes32"
                                },
                                {
                                    "name": "executedPayload",
                                    "type": "bytes",
                                    "internalType": "bytes"
                                }
                            ]
                        },
                        {
                            "name": "Signers",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "Sigs",
                            "type": "bytes[]",
                            "internalType": "bytes[]"
                        },
                        {
                            "name": "exeSig",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getUserNodeSignals",
            "inputs": [
                {
                    "name": "signalOrigin",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "parentNodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "UserNodeSignals",
                    "type": "uint256[2][]",
                    "internalType": "uint256[2][]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "inParentDenomination",
            "inputs": [
                {
                    "name": "amt_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "id_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "inParentVal",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "inflationOf",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "initSelfControl",
            "inputs": [],
            "outputs": [
                {
                    "name": "controlingAgent",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "isApprovedForAll",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "operator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isMember",
            "inputs": [
                {
                    "name": "whoabout_",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "whereabout_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isQueueValid",
            "inputs": [
                {
                    "name": "sigHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isValidSignature",
            "inputs": [
                {
                    "name": "_hash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "_signature",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "localizeEndpoint",
            "inputs": [
                {
                    "name": "endpoint_",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "endpointParent_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "endpointOwner_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "membershipEnforce",
            "inputs": [
                {
                    "name": "target",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "s",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "membershipID",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "mint",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "mintInflation",
            "inputs": [
                {
                    "name": "node",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "mintMembership",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "mintPath",
            "inputs": [
                {
                    "name": "target_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "name",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "redistribute",
            "inputs": [
                {
                    "name": "nodeId_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "distributedAmt",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "redistributePath",
            "inputs": [
                {
                    "name": "nodeId_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "distributedAmt",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "removeSignature",
            "inputs": [
                {
                    "name": "sigHash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "index_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "resignal",
            "inputs": [
                {
                    "name": "targetNode_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "signals",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                },
                {
                    "name": "originator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "safeBatchTransferFrom",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "ids",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                },
                {
                    "name": "amounts",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "safeTransferFrom",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "sendSignal",
            "inputs": [
                {
                    "name": "targetNode_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "signals",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setApprovalForAll",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "isApproved",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setControl",
            "inputs": [
                {
                    "name": "newController",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "spawnBranch",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "newID",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "spawnNodeWithMembrane",
            "inputs": [
                {
                    "name": "fid_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "membraneID_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "newID",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "spawnRootBranch",
            "inputs": [
                {
                    "name": "fungible20_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "fID",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "startMovement",
            "inputs": [
                {
                    "name": "typeOfMovement",
                    "type": "uint8",
                    "internalType": "uint8"
                },
                {
                    "name": "node",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "expiresInDays",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "executingAccount",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "descriptionHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "submitSignatures",
            "inputs": [
                {
                    "name": "sigHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "signers",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "signatures",
                    "type": "bytes[]",
                    "internalType": "bytes[]"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "supportsInterface",
            "inputs": [
                {
                    "name": "interfaceId",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "symbol",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "taxPolicyPreference",
            "inputs": [
                {
                    "name": "rootToken_",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "taxRate_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "toAddress",
            "inputs": [
                {
                    "name": "x",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "toID",
            "inputs": [
                {
                    "name": "x",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "totalSupply",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "uri",
            "inputs": [
                {
                    "name": "id_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "ApprovalForAll",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "operator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "isApproved",
                    "type": "bool",
                    "indexed": false,
                    "internalType": "bool"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "BranchSpawned",
            "inputs": [
                {
                    "name": "parentId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "newBranchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "creator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "InflationMinted",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "InflationRateChanged",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "oldInflationRate",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "newInflationRate",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "MembershipMinted",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "member",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "MembraneChanged",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "previousMembrane",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "newMembrane",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NewMovement",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "indexed": false,
                    "internalType": "bytes32"
                },
                {
                    "name": "descriptionHash",
                    "type": "bytes32",
                    "indexed": false,
                    "internalType": "bytes32"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "SelfControlAtAddress",
            "inputs": [
                {
                    "name": "AgencyLocus",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "SignalSent",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "sender",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "signals",
                    "type": "uint256[]",
                    "indexed": false,
                    "internalType": "uint256[]"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TokensBurned",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "burner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TokensMinted",
            "inputs": [
                {
                    "name": "branchId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "minter",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TransferBatch",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "ids",
                    "type": "uint256[]",
                    "indexed": false,
                    "internalType": "uint256[]"
                },
                {
                    "name": "amounts",
                    "type": "uint256[]",
                    "indexed": false,
                    "internalType": "uint256[]"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "TransferSingle",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "URI",
            "inputs": [
                {
                    "name": "value",
                    "type": "string",
                    "indexed": false,
                    "internalType": "string"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "AccountBalanceOverflow",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AlreadyMember",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ArrayLengthsMismatch",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BadLen",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BaseOrNonFungible",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BranchAlreadyExists",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BranchNotFound",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BurnE20TransferFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "CannotSkip",
            "inputs": []
        },
        {
            "type": "error",
            "name": "CoreGasTransferFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Disabled",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EOA",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ExecutionOnly",
            "inputs": []
        },
        {
            "type": "error",
            "name": "IncompleteSign",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficientAmt",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficientBalance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficientRootBalance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "MembershipOp",
            "inputs": []
        },
        {
            "type": "error",
            "name": "MembraneNotFound",
            "inputs": []
        },
        {
            "type": "error",
            "name": "MintE20TransferFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "No",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoControl",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoMembership",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoSoup",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoTimeDelta",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Noise",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoiseNotVoice",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotMember",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotOwnerNorApproved",
            "inputs": []
        },
        {
            "type": "error",
            "name": "PathTooShort",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ResignalMismatch",
            "inputs": []
        },
        {
            "type": "error",
            "name": "RootExists",
            "inputs": []
        },
        {
            "type": "error",
            "name": "RootNodeOrNone",
            "inputs": []
        },
        {
            "type": "error",
            "name": "SignalOverflow",
            "inputs": []
        },
        {
            "type": "error",
            "name": "StableRoot",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TargetIsRoot",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TransferToNonERC1155ReceiverImplementer",
            "inputs": []
        },
        {
            "type": "error",
            "name": "TransferToZeroAddress",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Unautorised",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UniniMembrane",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Unqualified",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UnregisteredFungible",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UnsupportedTransfer",
            "inputs": []
        },
        {
            "type": "error",
            "name": "isControled",
            "inputs": []
        }
    ],
    "Execution" :  [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "WillToken_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "fallback",
            "stateMutability": "payable"
        },
        {
            "type": "receive",
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "EIP712_DOMAIN_TYPEHASH",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "MOVEMENT_TYPEHASH",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "WillToken",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "WillWe",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "contract IFun"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "createEndpointForOwner",
            "inputs": [
                {
                    "name": "origin",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "endpoint",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "endpointOwner",
            "inputs": [
                {
                    "name": "endpointAddress",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "executeQueue",
            "inputs": [
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "success",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "getSigQueue",
            "inputs": [
                {
                    "name": "hash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "internalType": "struct SignatureQueue",
                    "components": [
                        {
                            "name": "state",
                            "type": "uint8",
                            "internalType": "enum SQState"
                        },
                        {
                            "name": "Action",
                            "type": "tuple",
                            "internalType": "struct Movement",
                            "components": [
                                {
                                    "name": "category",
                                    "type": "uint8",
                                    "internalType": "enum MovementType"
                                },
                                {
                                    "name": "initiatior",
                                    "type": "address",
                                    "internalType": "address"
                                },
                                {
                                    "name": "exeAccount",
                                    "type": "address",
                                    "internalType": "address"
                                },
                                {
                                    "name": "viaNode",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "expiresAt",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "descriptionHash",
                                    "type": "bytes32",
                                    "internalType": "bytes32"
                                },
                                {
                                    "name": "executedPayload",
                                    "type": "bytes",
                                    "internalType": "bytes"
                                }
                            ]
                        },
                        {
                            "name": "Signers",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "Sigs",
                            "type": "bytes[]",
                            "internalType": "bytes[]"
                        },
                        {
                            "name": "exeSig",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "hashDomain",
            "inputs": [
                {
                    "name": "domain",
                    "type": "tuple",
                    "internalType": "struct EIP712Domain",
                    "components": [
                        {
                            "name": "name",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "version",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "chainId",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "verifyingContract",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "salt",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "hashMessage",
            "inputs": [
                {
                    "name": "movement",
                    "type": "tuple",
                    "internalType": "struct Movement",
                    "components": [
                        {
                            "name": "category",
                            "type": "uint8",
                            "internalType": "enum MovementType"
                        },
                        {
                            "name": "initiatior",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "exeAccount",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "viaNode",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "expiresAt",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "descriptionHash",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        },
                        {
                            "name": "executedPayload",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "hashMovement",
            "inputs": [
                {
                    "name": "movement",
                    "type": "tuple",
                    "internalType": "struct Movement",
                    "components": [
                        {
                            "name": "category",
                            "type": "uint8",
                            "internalType": "enum MovementType"
                        },
                        {
                            "name": "initiatior",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "exeAccount",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "viaNode",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "expiresAt",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "descriptionHash",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        },
                        {
                            "name": "executedPayload",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "isQueueValid",
            "inputs": [
                {
                    "name": "sigHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isValidSignature",
            "inputs": [
                {
                    "name": "_hash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "_signature",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "removeLatentAction",
            "inputs": [
                {
                    "name": "actionHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "index",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "removeSignature",
            "inputs": [
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "index",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "signer",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setWillWe",
            "inputs": [
                {
                    "name": "implementation",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "startMovement",
            "inputs": [
                {
                    "name": "origin",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "typeOfMovement",
                    "type": "uint8",
                    "internalType": "uint8"
                },
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "expiresInDays",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "executingAccount",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "descriptionHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "submitSignatures",
            "inputs": [
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "signers",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "signatures",
                    "type": "bytes[]",
                    "internalType": "bytes[]"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "verifyMessage",
            "inputs": [
                {
                    "name": "movement",
                    "type": "tuple",
                    "internalType": "struct Movement",
                    "components": [
                        {
                            "name": "category",
                            "type": "uint8",
                            "internalType": "enum MovementType"
                        },
                        {
                            "name": "initiatior",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "exeAccount",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "viaNode",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "expiresAt",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "descriptionHash",
                            "type": "bytes32",
                            "internalType": "bytes32"
                        },
                        {
                            "name": "executedPayload",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                },
                {
                    "name": "v",
                    "type": "uint8",
                    "internalType": "uint8"
                },
                {
                    "name": "r",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "s",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "expectedAddress",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "EndpointCreatedForAgent",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "endpoint",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                },
                {
                    "name": "agent",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "LatentActionRemoved",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "actionHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                },
                {
                    "name": "index",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NewMovementCreated",
            "inputs": [
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                },
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "NewSignaturesSubmitted",
            "inputs": [
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "QueueExecuted",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "SignatureRemoved",
            "inputs": [
                {
                    "name": "nodeId",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "queueHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                },
                {
                    "name": "signer",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "WillWeSet",
            "inputs": [
                {
                    "name": "implementation",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "AlreadyHasEndpoint",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AlreadyInit",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AlreadyInitialized",
            "inputs": []
        },
        {
            "type": "error",
            "name": "AlreadySigned",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_A0sig",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_ActionIndexMismatch",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_BadOwnerOrAuthType",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_InProgress",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_NoDescription",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_NoType",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_OnlyMore",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_OnlySigner",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_SQInvalid",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_ZeroLen",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EXEC_exeQFail",
            "inputs": []
        },
        {
            "type": "error",
            "name": "EmptyUnallowed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ExpiredMovement",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ExpiredQueue",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InvalidQueue",
            "inputs": []
        },
        {
            "type": "error",
            "name": "LenErr",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoMembersForNode",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoMovementType",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NoSignatures",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotExeAccOwner",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotNodeMember",
            "inputs": []
        },
        {
            "type": "error",
            "name": "OnlyFun",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UnavailableState",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UninitQueue",
            "inputs": []
        }
    ],
    "Membrane" : [
        {
            "type": "function",
            "name": "createMembrane",
            "inputs": [
                {
                    "name": "tokens_",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "balances_",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                },
                {
                    "name": "meta_",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "outputs": [
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "gCheck",
            "inputs": [
                {
                    "name": "who_",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "membraneID_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "s",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getMembraneById",
            "inputs": [
                {
                    "name": "id_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "internalType": "struct Membrane",
                    "components": [
                        {
                            "name": "tokens",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "balances",
                            "type": "uint256[]",
                            "internalType": "uint256[]"
                        },
                        {
                            "name": "meta",
                            "type": "string",
                            "internalType": "string"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "error",
            "name": "Membrane__EmptyFieldOnMembraneCreation",
            "inputs": []
        },
        {
            "type": "error",
            "name": "membraneNotFound",
            "inputs": []
        }
    ],
    "Will" :  [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "price_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "pps_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "initMintAddrs_",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "initMintAmts_",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "fallback",
            "stateMutability": "payable"
        },
        {
            "type": "receive",
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "allowance",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "spender",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "approve",
            "inputs": [
                {
                    "name": "spender",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "balanceOf",
            "inputs": [
                {
                    "name": "account",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "burn",
            "inputs": [
                {
                    "name": "howMany_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "amtValReturned",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "burnReturns",
            "inputs": [
                {
                    "name": "amt_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "rv",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "burnTo",
            "inputs": [
                {
                    "name": "howMany_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "to_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "currentPrice",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "decimals",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint8",
                    "internalType": "uint8"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "deconstructBurn",
            "inputs": [
                {
                    "name": "amountToBurn_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "tokensToRedeem",
                    "type": "address[]",
                    "internalType": "address[]"
                }
            ],
            "outputs": [
                {
                    "name": "shareBurned",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "decreaseAllowance",
            "inputs": [
                {
                    "name": "spender",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "subtractedValue",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "increaseAllowance",
            "inputs": [
                {
                    "name": "spender",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "addedValue",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "initTime",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "mint",
            "inputs": [
                {
                    "name": "howMany_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "mintCost",
            "inputs": [
                {
                    "name": "amt_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "mintFromETH",
            "inputs": [],
            "outputs": [
                {
                    "name": "howMuchMinted",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "name",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "pps",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "relayERC20",
            "inputs": [
                {
                    "name": "_from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "sendERC20",
            "inputs": [
                {
                    "name": "_to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_amount",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "_chainId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "simpleBurn",
            "inputs": [
                {
                    "name": "amountToBurn_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "amtValReturned",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "symbol",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "totalSupply",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "transfer",
            "inputs": [
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "transferFrom",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "event",
            "name": "Approval",
            "inputs": [
                {
                    "name": "owner",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "spender",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "value",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "RelayERC20",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "source",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "SendERC20",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                },
                {
                    "name": "destination",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "Transfer",
            "inputs": [
                {
                    "name": "from",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "to",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "value",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "ATransferFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "BurnRefundF",
            "inputs": []
        },
        {
            "type": "error",
            "name": "CallerNotL2ToL2CrossDomainMessenger",
            "inputs": []
        },
        {
            "type": "error",
            "name": "DelegateCallFailed",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficentBalance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InvalidCalldata",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InvalidCrossDomainSender",
            "inputs": []
        },
        {
            "type": "error",
            "name": "OnlyFun",
            "inputs": []
        },
        {
            "type": "error",
            "name": "PayCallF",
            "inputs": []
        },
        {
            "type": "error",
            "name": "PingF",
            "inputs": []
        },
        {
            "type": "error",
            "name": "Reentrant",
            "inputs": []
        },
        {
            "type": "error",
            "name": "UnqualifiedCall",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ValueMismatch",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ZeroAddress",
            "inputs": []
        }
    ],
    "IERC20" : [
            {
                "constant": true,
                "inputs": [],
                "name": "name",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_spender",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "approve",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "totalSupply",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_from",
                        "type": "address"
                    },
                    {
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "transferFrom",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "decimals",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint8"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "_owner",
                        "type": "address"
                    }
                ],
                "name": "balanceOf",
                "outputs": [
                    {
                        "name": "balance",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "symbol",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "transfer",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "_owner",
                        "type": "address"
                    },
                    {
                        "name": "_spender",
                        "type": "address"
                    }
                ],
                "name": "allowance",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "payable": true,
                "stateMutability": "payable",
                "type": "fallback"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "Approval",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "from",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "Transfer",
                "type": "event"
            }
        
        ],
    "PowerProxy" : [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "proxyOwner_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "fallback",
            "stateMutability": "payable"
        },
        {
            "type": "receive",
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "implementation",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "isValidSignature",
            "inputs": [
                {
                    "name": "hash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "_signature",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "onERC1155Received",
            "inputs": [
                {
                    "name": "operator",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "from",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "value",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "data",
                    "type": "bytes",
                    "internalType": "bytes"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bytes4",
                    "internalType": "bytes4"
                }
            ],
            "stateMutability": "pure"
        },
        {
            "type": "function",
            "name": "owner",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "setImplementation",
            "inputs": [
                {
                    "name": "implementation_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setOwner",
            "inputs": [
                {
                    "name": "owner_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setSignedHash",
            "inputs": [
                {
                    "name": "hash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "tryAggregate",
            "inputs": [
                {
                    "name": "requireSuccess",
                    "type": "bool",
                    "internalType": "bool"
                },
                {
                    "name": "calls",
                    "type": "tuple[]",
                    "internalType": "struct PowerProxy.Call[]",
                    "components": [
                        {
                            "name": "target",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "callData",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "returnData",
                    "type": "tuple[]",
                    "internalType": "struct PowerProxy.Result[]",
                    "components": [
                        {
                            "name": "success",
                            "type": "bool",
                            "internalType": "bool"
                        },
                        {
                            "name": "returnData",
                            "type": "bytes",
                            "internalType": "bytes"
                        }
                    ]
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "error",
            "name": "Multicall2",
            "inputs": []
        },
        {
            "type": "error",
            "name": "NotOwner",
            "inputs": []
        },
        {
            "type": "error",
            "name": "noFallback",
            "inputs": []
        }
    ]
}



export const RPCurl : {[key: string]: string } = {
    "84532": process.env.BB_BASE_SEPOLIA_RPC || baseSepolia.rpcUrls.default.http[0],
    "11155420": process.env.OPTIMISM_SEPOLIA_RPC || baseSepolia.rpcUrls.default.http[0],
    "167009":  taikoHekla.rpcUrls.default.http[0] || process.env.TAIKO_HEKLA_RPC,
    "167000":  taiko.rpcUrls.default.http[0] || process.env.TAIKO_RPC
}


export const ERC20Bytecode = "0x60806040523480156200001157600080fd5b5060405162001c6438038062001c648339818101604052810190620000379190620007c1565b838381600390816200004a919062000af0565b5080600490816200005c919062000af0565b5050508051825114620000a6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016200009d9062000c5e565b60405180910390fd5b60005b81518110156200011557620000ff838281518110620000cd57620000cc62000c80565b5b6020026020010151838381518110620000eb57620000ea62000c80565b5b60200260200101516200012060201b60201c565b80806200010c9062000cde565b915050620000a9565b505050505062000dff565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603620001955760006040517fec442f050000000000000000000000000000000000000000000000000000000081526004016200018c919062000d3c565b60405180910390fd5b620001a960008383620001ad60201b60201c565b5050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160362000203578060026000828254620001f6919062000d59565b92505081905550620002d9565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490508181101562000292578381836040517fe450d38c000000000000000000000000000000000000000000000000000000008152600401620002899392919062000da5565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160362000324578060026000828254039250508190555062000371565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051620003d0919062000de2565b60405180910390a3505050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6200044682620003fb565b810181811067ffffffffffffffff821117156200046857620004676200040c565b5b80604052505050565b60006200047d620003dd565b90506200048b82826200043b565b919050565b600067ffffffffffffffff821115620004ae57620004ad6200040c565b5b620004b982620003fb565b9050602081019050919050565b60005b83811015620004e6578082015181840152602081019050620004c9565b60008484015250505050565b600062000509620005038462000490565b62000471565b905082815260208101848484011115620005285762000527620003f6565b5b62000535848285620004c6565b509392505050565b600082601f830112620005555762000554620003f1565b5b815162000567848260208601620004f2565b91505092915050565b600067ffffffffffffffff8211156200058e576200058d6200040c565b5b602082029050602081019050919050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620005d182620005a4565b9050919050565b620005e381620005c4565b8114620005ef57600080fd5b50565b6000815190506200060381620005d8565b92915050565b6000620006206200061a8462000570565b62000471565b905080838252602082019050602084028301858111156200064657620006456200059f565b5b835b818110156200067357806200065e8882620005f2565b84526020840193505060208101905062000648565b5050509392505050565b600082601f830112620006955762000694620003f1565b5b8151620006a784826020860162000609565b91505092915050565b600067ffffffffffffffff821115620006ce57620006cd6200040c565b5b602082029050602081019050919050565b6000819050919050565b620006f481620006df565b81146200070057600080fd5b50565b6000815190506200071481620006e9565b92915050565b6000620007316200072b84620006b0565b62000471565b905080838252602082019050602084028301858111156200075757620007566200059f565b5b835b818110156200078457806200076f888262000703565b84526020840193505060208101905062000759565b5050509392505050565b600082601f830112620007a657620007a5620003f1565b5b8151620007b88482602086016200071a565b91505092915050565b60008060008060808587031215620007de57620007dd620003e7565b5b600085015167ffffffffffffffff811115620007ff57620007fe620003ec565b5b6200080d878288016200053d565b945050602085015167ffffffffffffffff811115620008315762000830620003ec565b5b6200083f878288016200053d565b935050604085015167ffffffffffffffff811115620008635762000862620003ec565b5b62000871878288016200067d565b925050606085015167ffffffffffffffff811115620008955762000894620003ec565b5b620008a3878288016200078e565b91505092959194509250565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200090257607f821691505b602082108103620009185762000917620008ba565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620009827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8262000943565b6200098e868362000943565b95508019841693508086168417925050509392505050565b6000819050919050565b6000620009d1620009cb620009c584620006df565b620009a6565b620006df565b9050919050565b6000819050919050565b620009ed83620009b0565b62000a05620009fc82620009d8565b84845462000950565b825550505050565b600090565b62000a1c62000a0d565b62000a29818484620009e2565b505050565b5b8181101562000a515762000a4560008262000a12565b60018101905062000a2f565b5050565b601f82111562000aa05762000a6a816200091e565b62000a758462000933565b8101602085101562000a85578190505b62000a9d62000a948562000933565b83018262000a2e565b50505b505050565b600082821c905092915050565b600062000ac56000198460080262000aa5565b1980831691505092915050565b600062000ae0838362000ab2565b9150826002028217905092915050565b62000afb82620008af565b67ffffffffffffffff81111562000b175762000b166200040c565b5b62000b238254620008e9565b62000b3082828562000a55565b600060209050601f83116001811462000b68576000841562000b53578287015190505b62000b5f858262000ad2565b86555062000bcf565b601f19841662000b78866200091e565b60005b8281101562000ba25784890151825560018201915060208501945060208101905062000b7b565b8683101562000bc2578489015162000bbe601f89168262000ab2565b8355505b6001600288020188555050505b505050505050565b600082825260208201905092915050565b7f526563697069656e747320616e642062616c616e636573206c656e677468206d60008201527f69736d6174636800000000000000000000000000000000000000000000000000602082015250565b600062000c4660278362000bd7565b915062000c538262000be8565b604082019050919050565b6000602082019050818103600083015262000c798162000c37565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600062000ceb82620006df565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820362000d205762000d1f62000caf565b5b600182019050919050565b62000d3681620005c4565b82525050565b600060208201905062000d53600083018462000d2b565b92915050565b600062000d6682620006df565b915062000d7383620006df565b925082820190508082111562000d8e5762000d8d62000caf565b5b92915050565b62000d9f81620006df565b82525050565b600060608201905062000dbc600083018662000d2b565b62000dcb602083018562000d94565b62000dda604083018462000d94565b949350505050565b600060208201905062000df9600083018462000d94565b92915050565b610e558062000e0f6000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063313ce56711610066578063313ce5671461013457806370a082311461015257806395d89b4114610182578063a9059cbb146101a0578063dd62ed3e146101d057610093565b806306fdde0314610098578063095ea7b3146100b657806318160ddd146100e657806323b872dd14610104575b600080fd5b6100a0610200565b6040516100ad9190610aa9565b60405180910390f35b6100d060048036038101906100cb9190610b64565b610292565b6040516100dd9190610bbf565b60405180910390f35b6100ee6102b5565b6040516100fb9190610be9565b60405180910390f35b61011e60048036038101906101199190610c04565b6102bf565b60405161012b9190610bbf565b60405180910390f35b61013c6102ee565b6040516101499190610c73565b60405180910390f35b61016c60048036038101906101679190610c8e565b6102f7565b6040516101799190610be9565b60405180910390f35b61018a61033f565b6040516101979190610aa9565b60405180910390f35b6101ba60048036038101906101b59190610b64565b6103d1565b6040516101c79190610bbf565b60405180910390f35b6101ea60048036038101906101e59190610cbb565b6103f4565b6040516101f79190610be9565b60405180910390f35b60606003805461020f90610d2a565b80601f016020809104026020016040519081016040528092919081815260200182805461023b90610d2a565b80156102885780601f1061025d57610100808354040283529160200191610288565b820191906000526020600020905b81548152906001019060200180831161026b57829003601f168201915b5050505050905090565b60008061029d61047b565b90506102aa818585610483565b600191505092915050565b6000600254905090565b6000806102ca61047b565b90506102d7858285610495565b6102e2858585610529565b60019150509392505050565b60006012905090565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60606004805461034e90610d2a565b80601f016020809104026020016040519081016040528092919081815260200182805461037a90610d2a565b80156103c75780601f1061039c576101008083540402835291602001916103c7565b820191906000526020600020905b8154815290600101906020018083116103aa57829003601f168201915b5050505050905090565b6000806103dc61047b565b90506103e9818585610529565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600033905090565b610490838383600161061d565b505050565b60006104a184846103f4565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146105235781811015610513578281836040517ffb8f41b200000000000000000000000000000000000000000000000000000000815260040161050a93929190610d6a565b60405180910390fd5b6105228484848403600061061d565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361059b5760006040517f96c6fd1e0000000000000000000000000000000000000000000000000000000081526004016105929190610da1565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361060d5760006040517fec442f050000000000000000000000000000000000000000000000000000000081526004016106049190610da1565b60405180910390fd5b6106188383836107f4565b505050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff160361068f5760006040517fe602df050000000000000000000000000000000000000000000000000000000081526004016106869190610da1565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036107015760006040517f94280d620000000000000000000000000000000000000000000000000000000081526004016106f89190610da1565b60405180910390fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555080156107ee578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516107e59190610be9565b60405180910390a35b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361084657806002600082825461083a9190610deb565b92505081905550610919565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050818110156108d2578381836040517fe450d38c0000000000000000000000000000000000000000000000000000000081526004016108c993929190610d6a565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361096257806002600082825403925050819055506109af565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610a0c9190610be9565b60405180910390a3505050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610a53578082015181840152602081019050610a38565b60008484015250505050565b6000601f19601f8301169050919050565b6000610a7b82610a19565b610a858185610a24565b9350610a95818560208601610a35565b610a9e81610a5f565b840191505092915050565b60006020820190508181036000830152610ac38184610a70565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610afb82610ad0565b9050919050565b610b0b81610af0565b8114610b1657600080fd5b50565b600081359050610b2881610b02565b92915050565b6000819050919050565b610b4181610b2e565b8114610b4c57600080fd5b50565b600081359050610b5e81610b38565b92915050565b60008060408385031215610b7b57610b7a610acb565b5b6000610b8985828601610b19565b9250506020610b9a85828601610b4f565b9150509250929050565b60008115159050919050565b610bb981610ba4565b82525050565b6000602082019050610bd46000830184610bb0565b92915050565b610be381610b2e565b82525050565b6000602082019050610bfe6000830184610bda565b92915050565b600080600060608486031215610c1d57610c1c610acb565b5b6000610c2b86828701610b19565b9350506020610c3c86828701610b19565b9250506040610c4d86828701610b4f565b9150509250925092565b600060ff82169050919050565b610c6d81610c57565b82525050565b6000602082019050610c886000830184610c64565b92915050565b600060208284031215610ca457610ca3610acb565b5b6000610cb284828501610b19565b91505092915050565b60008060408385031215610cd257610cd1610acb565b5b6000610ce085828601610b19565b9250506020610cf185828601610b19565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610d4257607f821691505b602082108103610d5557610d54610cfb565b5b50919050565b610d6481610af0565b82525050565b6000606082019050610d7f6000830186610d5b565b610d8c6020830185610bda565b610d996040830184610bda565b949350505050565b6000602082019050610db66000830184610d5b565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610df682610b2e565b9150610e0183610b2e565b9250828201905080821115610e1957610e18610dbc565b5b9291505056fea2646970667358221220dde26259188310601e90c42c29f32358f866bb4ebf582b425186c6914931b34564736f6c63430008130033"
export const ERC20CreateABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_symbol",
				"type": "string"
			},
			{
				"internalType": "address[]",
				"name": "recipients",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "balances",
				"type": "uint256[]"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]