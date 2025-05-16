import { useState, useEffect } from 'react';
import { deployments, ABIs } from '../config/contracts';
import { NodeState } from '../types/chainData';
import { usePublicClient } from 'wagmi';
import type { Abi } from 'viem';

interface WillWeContract {
  address: `0x${string}`;
  abi: Abi;
  totalSupply: (nodeId: string) => Promise<bigint>;
  calculateUserTargetedPreferenceAmount: (
    childId: string,
    parentId: string,
    signal: number,
    user: string
  ) => Promise<bigint>;
  getNodeData: (nodeId: string) => Promise<NodeState>;
  getNodes: (nodeIds: string[]) => Promise<NodeState[]>;
}

export const useWillWeContract = (chainId: string) => {
  const [contract, setContract] = useState<WillWeContract | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    const initContract = async () => {
      if (!publicClient) return;

      try {
        const willWeAddress = deployments.WillWe[chainId];

        if (!willWeAddress) {
          throw new Error(`No WillWe contract found for chain ${chainId}`);
        }

        const willWeContract: WillWeContract = {
          address: willWeAddress as `0x${string}`,
          abi: ABIs.WillWe as Abi,
          totalSupply: async (nodeId: string) => {
            if (!publicClient) throw new Error('Public client not available');
            const result = await publicClient.readContract({
              address: willWeAddress as `0x${string}`,
              abi: ABIs.WillWe as Abi,
              functionName: 'totalSupply',
              args: [nodeId]
            });
            return result as bigint;
          },
          calculateUserTargetedPreferenceAmount: async (childId: string, parentId: string, signal: number, user: string) => {
            if (!publicClient) throw new Error('Public client not available');
            const result = await publicClient.readContract({
              address: willWeAddress as `0x${string}`,
              abi: ABIs.WillWe as Abi,
              functionName: 'calculateUserTargetedPreferenceAmount',
              args: [childId, parentId, signal, user]
            });
            return result as bigint;
          },
          getNodeData: async (nodeId: string) => {
            if (!publicClient) throw new Error('Public client not available');
            const result = await publicClient.readContract({
              address: willWeAddress as `0x${string}`,
              abi: ABIs.WillWe as Abi,
              functionName: 'getNodeData',
              args: [nodeId]
            });
            return result as NodeState;
          },
          getNodes: async (nodeIds: string[]) => {
            if (!publicClient) throw new Error('Public client not available');
            const result = await publicClient.readContract({
              address: willWeAddress as `0x${string}`,
              abi: ABIs.WillWe as Abi,
              functionName: 'getNodes',
              args: [nodeIds]
            });
            return result as NodeState[];
          }
        };

        setContract(willWeContract);
      } catch (error) {
        console.error('Error initializing WillWe contract:', error);
        setContract(null);
      }
    };

    initContract();
  }, [chainId, publicClient]);

  return contract;
}

export default useWillWeContract;