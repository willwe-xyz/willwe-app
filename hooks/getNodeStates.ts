import { useState, useEffect, useCallback } from 'react';
import { NodeState } from '../types/chainData';
import { ethers } from 'ethers';
import { deployments, ABIs, getRPCUrl } from '../config/contracts';

interface UseNodeStatesResult {
    nodeStates: (NodeState | null)[];
    isLoading: boolean;
    errors: (Error | null)[];
    refetch: () => Promise<void>;
}

export function useNodeStates(
    chainId: string | undefined,
    nodeIds: string[] | undefined
): UseNodeStatesResult {
    const [nodeStates, setNodeStates] = useState<(NodeState | null)[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<(Error | null)[]>([]);

    const fetchNodeStates = useCallback(async () => {
        if (!chainId || !nodeIds?.length) {
            setNodeStates([]);
            setErrors([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            // Filter out nodeIds that start with '0x'
            const validNodeIds = nodeIds.filter(nodeId => !nodeId.startsWith('0x'));
            
            // Initialize provider and contract
            const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
            const contract = new ethers.Contract(deployments[chainId].address, ABIs.nodeContract, provider);

            // Call the contract's getNodes function
            const result = await contract.getNodes(validNodeIds);
            
            // Transform the result into NodeState array
            const states = validNodeIds.map((_, index) => ({
                // Map contract response to NodeState structure
                // Adjust according to your contract's return structure
                ...result[index]
            }));

            setNodeStates(states);
            setErrors(states.map(() => null));
        } catch (error) {
            setErrors(nodeIds.map(() => error as Error));
            setNodeStates(nodeIds.map(() => null));
        } finally {
            setIsLoading(false);
        }
    }, [chainId, nodeIds]);

    useEffect(() => {
        fetchNodeStates();
    }, [fetchNodeStates]);

    return {
        nodeStates,
        isLoading,
        errors,
        refetch: fetchNodeStates
    };
}

export default useNodeStates;
