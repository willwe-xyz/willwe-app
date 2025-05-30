import { useState, useEffect, useCallback } from 'react';
import { NodeState } from '../types/chainData';

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
            
            // Fetch data for each node in parallel
            const promises = validNodeIds.map(async (nodeId) => {
                try {
                    const response = await fetch(
                        `/api/nodes/data?chainId=${chainId}&nodeId=${nodeId}`
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch node data');
                    }

                    const result = await response.json();
                    return result.data;
                } catch (error) {
                    console.error(`Error fetching node ${nodeId}:`, error);
                    return null;
                }
            });

            const results = await Promise.all(promises);
            setNodeStates(results);
            setErrors(results.map(result => result === null ? new Error('Failed to fetch node data') : null));
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
