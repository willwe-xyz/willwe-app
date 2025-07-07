import { ethers } from 'ethers';
import { NodeData } from '../types/nodeData';

// Contract ABI snippets - add full ABI when available
const WILLWE_ABI = [
  "function getNodeInfo(uint256 nodeId) view returns (uint256[] memory basicInfo, address[] memory members, uint256[] memory children, uint256[] memory rootPath, address rootTokenAddress)",
  "function balanceOf(address account, uint256 nodeId) view returns (uint256)",
  "function totalSupplyOf(uint256 nodeId) view returns (uint256)",
  "function parentOf(uint256 nodeId) view returns (uint256)",
  "function childrenOf(uint256 nodeId) view returns (uint256[] memory)",
  "function isMember(address account, uint256 nodeId) view returns (bool)",
  "function getUserNodeSignals(address user, uint256 nodeId) view returns (uint256[] memory)",
  "function inUseMembraneId(uint256 nodeId) view returns (uint256[] memory)",
  "function inflationRateOf(uint256 nodeId) view returns (uint256)"
];

interface OnchainConfig {
  rpcUrl: string;
  willweAddress: string;
  executionAddress: string;
  membraneAddress: string;
}

export class OnchainDataFetcher {
  private provider: ethers.JsonRpcProvider;
  private willweContract: ethers.Contract;
  private config: OnchainConfig;

  constructor(config: OnchainConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.willweContract = new ethers.Contract(config.willweAddress, WILLWE_ABI, this.provider);
  }

  async fetchNodeData(nodeId: string | number): Promise<NodeData> {
    try {
      const numericNodeId = typeof nodeId === 'string' ? parseInt(nodeId) : nodeId;
      
      // Fetch basic node information
      const nodeInfo = await this.willweContract.getNodeInfo(numericNodeId);
      const [basicInfo, members, children, rootPath, rootTokenAddress] = nodeInfo;
      
      // Convert BigInt arrays to regular numbers/strings
      const formattedBasicInfo = basicInfo.map((value: bigint, index: number) => {
        // Convert addresses to strings, numbers to numbers
        if (index === 0 || index === 10) { // nodeId and userEndpoint
          return `0x${value.toString(16).padStart(40, '0')}`;
        }
        return Number(value);
      });

      const formattedMembers = members.map((addr: string) => addr.toLowerCase());
      const formattedChildren = children.map((childId: bigint) => `0x${childId.toString(16)}`);
      const formattedRootPath = rootPath.map((pathId: bigint) => `0x${pathId.toString(16)}`);

      // Calculate hierarchy depth
      const hierarchyDepth = formattedRootPath.length;

      return {
        basicInfo: formattedBasicInfo as [string, number, number, number, number, number, number, number, number, number, string, number],
        membersOfNode: formattedMembers,
        childrenNodes: formattedChildren,
        rootPath: formattedRootPath,
        signals: [], // Will be populated separately
        rootTokenAddress: rootTokenAddress.toLowerCase(),
        hierarchyDepth
      };
    } catch (error) {
      console.error(`Error fetching node data for ${nodeId}:`, error);
      throw error;
    }
  }

  async fetchUserBalance(userAddress: string, nodeId: string | number): Promise<number> {
    try {
      const numericNodeId = typeof nodeId === 'string' ? parseInt(nodeId) : nodeId;
      const balance = await this.willweContract.balanceOf(userAddress, numericNodeId);
      return Number(balance);
    } catch (error) {
      console.error(`Error fetching user balance:`, error);
      return 0;
    }
  }

  async fetchUserSignals(userAddress: string, nodeId: string | number): Promise<number[]> {
    try {
      const numericNodeId = typeof nodeId === 'string' ? parseInt(nodeId) : nodeId;
      const signals = await this.willweContract.getUserNodeSignals(userAddress, numericNodeId);
      return signals.map((signal: bigint) => Number(signal));
    } catch (error) {
      console.error(`Error fetching user signals:`, error);
      return [];
    }
  }

  async fetchUserNodes(userAddress: string): Promise<string[]> {
    try {
      // This would need to be implemented based on how user nodes are tracked
      // For now, return empty array - would need contract method or event filtering
      return [];
    } catch (error) {
      console.error(`Error fetching user nodes:`, error);
      return [];
    }
  }

  async isUserMember(userAddress: string, nodeId: string | number): Promise<boolean> {
    try {
      const numericNodeId = typeof nodeId === 'string' ? parseInt(nodeId) : nodeId;
      return await this.willweContract.isMember(userAddress, numericNodeId);
    } catch (error) {
      console.error(`Error checking membership:`, error);
      return false;
    }
  }

  async fetchNodeChildren(nodeId: string | number): Promise<string[]> {
    try {
      const numericNodeId = typeof nodeId === 'string' ? parseInt(nodeId) : nodeId;
      const children = await this.willweContract.childrenOf(numericNodeId);
      return children.map((childId: bigint) => `0x${childId.toString(16)}`);
    } catch (error) {
      console.error(`Error fetching node children:`, error);
      return [];
    }
  }

  async fetchNodeParent(nodeId: string | number): Promise<string | null> {
    try {
      const numericNodeId = typeof nodeId === 'string' ? parseInt(nodeId) : nodeId;
      const parentId = await this.willweContract.parentOf(numericNodeId);
      return parentId === numericNodeId ? null : `0x${parentId.toString(16)}`;
    } catch (error) {
      console.error(`Error fetching node parent:`, error);
      return null;
    }
  }
}

// Factory function to create fetcher with environment variables
export const createOnchainDataFetcher = (): OnchainDataFetcher => {
  const config: OnchainConfig = {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_BASE || 'https://mainnet.base.org',
    willweAddress: process.env.NEXT_PUBLIC_WILLWE_CONTRACT_ADDRESS || '',
    executionAddress: process.env.NEXT_PUBLIC_EXECUTION_CONTRACT_ADDRESS || '',
    membraneAddress: process.env.NEXT_PUBLIC_MEMBRANE_CONTRACT_ADDRESS || ''
  };

  if (!config.willweAddress) {
    throw new Error('NEXT_PUBLIC_WILLWE_CONTRACT_ADDRESS not set in environment');
  }

  return new OnchainDataFetcher(config);
};