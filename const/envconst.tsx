import { baseSepolia,  } from "viem/chains";
// import { defineChain, Hex } from "viem";
import {  InterfaceAbi }  from "ethers";
import * as chains from 'viem/chains';
import { BalanceItem } from "@covalenthq/client-sdk";
import { Chain } from "viem";

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
export const COV_APIKEY= process.env.COV_APIKEY;
export const SUPABASE_URL : string = process.env.SUPABASE_URL
export const SUPABASE_KEY : string = process.env.SUPABASE_KEY




// == Logs ==
//   ###############################
                                                               
//      Deploy script started for network :  11155420
                                                               
//   ###############################
//   ##### Deployer :  0x259c1F1FaF930a23D009e85867A6b5206b2a6d44 | expected 0x259c1F1FaF930a23D009e85867A6b5206b2a6d44
//   #________________________________
//   ###############################
   
//   Fun deployed at :  0x264336ec33fab9CC7859b2C5b431f42020a20E75
   
//   ###############################
//   ###############################
   
//   Root Value in Control :  0x9d814170537951fE8eD28A534CDE9F30Fd731A64
//   Controling Extrmity:  0xDD9e56E94B6166f47D8F597AECeB38e72e274E92
//   ###############################
//   Balances: deployer | Agent 
//   0 10000000
//   Will Price in ETH: 1000000000
   
//   ###############################
   
//   ###############################
//   Foundation Agent Safe at:  0xDD9e56E94B6166f47D8F597AECeB38e72e274E92
//   Will:  0x9d814170537951fE8eD28A534CDE9F30Fd731A64
//   Membrane:  0x36C70f035c39e4072822F8C33C4427ae59298451
//   Execution:  0xEDf98928d9513051D75e72244e0b4DD254DB1462
//   WillWe:  0x264336ec33fab9CC7859b2C5b431f42020a20E75
//   ###############################

//   ###############################
//   ##### Deployer :  0x259c1F1FaF930a23D009e85867A6b5206b2a6d44 | expected 0x259c1F1FaF930a23D009e85867A6b5206b2a6d44
//   #________________________________
//   ###############################
   
//   Fun deployed at :  0x8f45bEe4c58C7Bb74CDa9fBD40aD86429Dba3E41
   
//   ###############################
//   ###############################
   
//   Root Value in Control :  0xDf17125350200A99E5c06E5E2b053fc61Be7E6ae
//   Controling Extrmity:  0xc01F390530ca36Ec1871F9E4D74b0B2aaf852A44
//   ###############################
//   Balances: deployer | Agent 
//   0 10000000
//   Will Price in ETH: 1000000000
   
//   ###############################
   
//   ###############################
//   Foundation Agent Safe at:  0xc01F390530ca36Ec1871F9E4D74b0B2aaf852A44
//   Will:  0xDf17125350200A99E5c06E5E2b053fc61Be7E6ae
//   Membrane:  0xaBbd15F9eD0cab9D174b5e9878E9f104a993B41f
//   Execution:  0x3D52a3A5D12505B148a46B5D69887320Fc756F96
//   WillWe:  0x8f45bEe4c58C7Bb74CDa9fBD40aD86429Dba3E41
//   ###############################

type Deployments = {
    [key: string]: {
        [key: string]: string;
    };
};

type ABIKP = {
    [key: string]: 
         InterfaceAbi; 
};


export const deployments: Deployments  = {
    "WillWe" : {
        "84532" :  "0x8f45bEe4c58C7Bb74CDa9fBD40aD86429Dba3E41",
        "11155420": "0xcdf01592c88eaa45cf3efff824f7c7e0687263ad"

    },
    "Membrane" : {
    "84532": "0xaBbd15F9eD0cab9D174b5e9878E9f104a993B41f",
    "11155420": "0xc2985039aeb2040ac403484c8d792a5de53cdfb1"
},
    "Execution": { 
        "84532": "0x3D52a3A5D12505B148a46B5D69887320Fc756F96",
        "11155420": "0xd5717a4bfc0c06540700e5f326d8c63b23d9216d"
}, "RVI": {
        "84532" : "0xDf17125350200A99E5c06E5E2b053fc61Be7E6ae",
        "11155420": "0xa0f47ae56845209db2f22c32af206ce33f8447a0"
} 

}





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
            "name": "spawnBranchWithMembrane",
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
    "Execution" : [
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
    "RVI" :  [
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
    // "84532" : "https://base-sepolia.gateway.tenderly.co/jEm0PDO7ZJVvgOxvBZhg"
    "84532": process.env.BB_BASE_SEPOLIA_RPC || baseSepolia.rpcUrls.default.http[0],
    "11155420": process.env.OPTIMISM_SEPOLIA_RPC || baseSepolia.rpcUrls.default.http[0],

}
