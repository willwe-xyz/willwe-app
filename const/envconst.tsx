import { baseSepolia } from "viem/chains";
// import { defineChain, Hex } from "viem";
import {  InterfaceAbi }  from "ethers"
 

// export const virtualTenderlyBase = defineChain({
//   id: 8453,
//   name: 'Virtual Base',
//   nativeCurrency: { name: 'vETH', symbol: 'vETH', decimals: 18 },
//   rpcUrls: {
//     default: { http: ['https://virtual.base.rpc.tenderly.co/0814d5bb-2565-4a2a-a783-05b8e57eb7f8'] }
//   },
//   blockExplorers: {
//     default: {
//       name: 'Tenderly Explorer',
//       url: 'https://virtual.base.rpc.tenderly.co/6167980a-133f-48b2-a55b-137c7b3e8630'
//     }
//   },
// });


export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
export const COV_APIKEY= process.env.COV_APIKEY;

// ###############################
// Foundation Agent Safe at:  0xDf71f5fbf030007CC7ce340Ce21f16f616004eE4
// RVI:  0x8AA1A5c88A22B4174bb19Fb114EE41785a4Ee8De
// Membrane:  0x782dCc38cf28fbdc010c9aABDA5C14fbA11bA859
// Execution:  0x61CB8eC9E8A11d021F57DF4374A547f2dEbcC038
// WillWe:  0x49Bd9804DBbF57C3D240840EB72e2BdECBdc2E06
// ###############################

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
        "84532" :  "0x49Bd9804DBbF57C3D240840EB72e2BdECBdc2E06"
    },
    "Membrane" : {
    "84532": "0x782dCc38cf28fbdc010c9aABDA5C14fbA11bA859"
},
    "Execution": { 
        "84532": "0x61CB8eC9E8A11d021F57DF4374A547f2dEbcC038",
}, "RVI": {
        "84532" : "0x8AA1A5c88A22B4174bb19Fb114EE41785a4Ee8De"
} 

}

export const ABIs: ABIKP = {
    "WillWe" : [
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
            "name": "getInteractionDataOf",
            "inputs": [
                {
                    "name": "user_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "activeBalances",
                    "type": "uint256[][2]",
                    "internalType": "uint256[][2]"
                },
                {
                    "name": "NSs",
                    "type": "tuple[]",
                    "internalType": "struct NodeState[]",
                    "components": [
                        {
                            "name": "nodeId",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "inflation",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "balanceAnchor",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "balanceBudget",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "value",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "membraneId",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "lastMinted",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "inflPerSec",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "membersOfNode",
                            "type": "address[]",
                            "internalType": "address[]"
                        },
                        {
                            "name": "childrenNodes",
                            "type": "uint256[]",
                            "internalType": "uint256[]"
                        },
                        {
                            "name": "rootPath",
                            "type": "uint256[]",
                            "internalType": "uint256[]"
                        },
                        {
                            "name": "signals",
                            "type": "tuple[]",
                            "internalType": "struct UserSignal[]",
                            "components": [
                                {
                                    "name": "MembraneInflation",
                                    "type": "uint256[][2]",
                                    "internalType": "uint256[][2]"
                                },
                                {
                                    "name": "lastRedistSignal",
                                    "type": "uint256[]",
                                    "internalType": "uint256[]"
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
            "name": "proposeMovement",
            "inputs": [
                {
                    "name": "typeOfMovement",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "node_",
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
            "name": "totalSupplyOf",
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
            "name": "NewMovement",
            "inputs": [
                {
                    "name": "nodeID",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "movementID",
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
            "name": "Signal",
            "inputs": [
                {
                    "name": "nodeID",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
                },
                {
                    "name": "origin",
                    "type": "address",
                    "indexed": false,
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
            "name": "CoreGasTransferFailed",
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
            "name": "Noise",
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
        }
    ],
    "Execution" : [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "rootValueToken_",
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
            "name": "BagBok",
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
            "name": "FoundationAgent",
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
            "name": "RootValueToken",
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
            "name": "createEndpointForOwner",
            "inputs": [
                {
                    "name": "origin",
                    "type": "address",
                    "internalType": "address"
                },
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
            "name": "proposeMovement",
            "inputs": [
                {
                    "name": "origin",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "typeOfMovement",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "node_",
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
            "name": "removeLatentAction",
            "inputs": [
                {
                    "name": "actionHash_",
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
                    "name": "sigHash_",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "index_",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "who_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setBagBook",
            "inputs": [
                {
                    "name": "bb_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setFoundationAgent",
            "inputs": [
                {
                    "name": "baseNodeId_",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
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
            "name": "BagBokSet",
            "inputs": [
                {
                    "name": "BBImplementation",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "EndpointCreatedForAgent",
            "inputs": [
                {
                    "name": "nodeid",
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
            "name": "NewMovementCreated",
            "inputs": [
                {
                    "name": "movementHash",
                    "type": "bytes32",
                    "indexed": true,
                    "internalType": "bytes32"
                },
                {
                    "name": "node_",
                    "type": "uint256",
                    "indexed": true,
                    "internalType": "uint256"
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
            "name": "NoType",
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
    "RVI" :[
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
            "name": "pingInit",
            "inputs": [],
            "outputs": [],
            "stateMutability": "nonpayable"
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
            "name": "setBagBook",
            "inputs": [
                {
                    "name": "bagb_",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "setPointer",
            "inputs": [
                {
                    "name": "newPointer_",
                    "type": "address",
                    "internalType": "address"
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
            "type": "function",
            "name": "transferGas",
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
            "name": "BurnRefundF",
            "inputs": []
        },
        {
            "type": "error",
            "name": "InsufficentBalance",
            "inputs": []
        },
        {
            "type": "error",
            "name": "OnlyFun",
            "inputs": []
        },
        {
            "type": "error",
            "name": "OnlyPointer",
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
            "name": "TrippinFrFr",
            "inputs": []
        },
        {
            "type": "error",
            "name": "ValueMismatch",
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
}

