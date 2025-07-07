export interface NodeData {
  basicInfo: [
    string,  // [0] Node identifier
    number,  // [1] Inflation rate in gwei/sec
    number,  // [2] Reserve balance
    number,  // [3] Budget balance
    number,  // [4] Root valuation budget
    number,  // [5] Root valuation reserve
    number,  // [6] Active membrane ID (complexity)
    number,  // [7] Eligibility per second
    number,  // [8] Last redistribution timestamp
    number,  // [9] User's balance in this node
    string,  // [10] User's endpoint address
    number   // [11] Total token supply
  ]
  membersOfNode: string[]
  childrenNodes: string[]
  rootPath: string[]
  signals: any[]
  rootTokenAddress: string
  position?: { x: number; y: number; z: number }
  hierarchyDepth?: number
}

export interface TokenFlow {
  type: 'minting' | 'burning' | 'redistribution' | 'inflation'
  from: string
  to: string
  amount: number
  timestamp: number
  particleColor: string
}