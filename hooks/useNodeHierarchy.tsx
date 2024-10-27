import { useMemo } from 'react';
import { NodeState } from '../types/chainData';

interface NodeHierarchyResult {
  rootNodes: NodeState[];
  descendantNodes: Map<string, NodeState[]>;
  pathToNode: (nodeId: string) => NodeState[];
  getNodeDepth: (nodeId: string) => number;
  totalValue: bigint;
  getNodePercentage: (nodeId: string) => number;
}

export function useNodeHierarchy(nodes: NodeState[]): NodeHierarchyResult {
  return useMemo(() => {
    // Create a map for quick node lookup
    const nodeMap = new Map<string, NodeState>();
    nodes.forEach(node => nodeMap.set(node.basicInfo[0], node));

    // Find root nodes (nodes with rootPath.length === 1)
    const rootNodes = nodes.filter(node => node.rootPath.length === 1);

    // Create descendant map
    const descendantNodes = new Map<string, NodeState[]>();
    nodes.forEach(node => {
      const parentId = node.rootPath[node.rootPath.length - 2];
      if (parentId) {
        const currentChildren = descendantNodes.get(parentId) || [];
        descendantNodes.set(parentId, [...currentChildren, node]);
      }
    });

    // Calculate total value
    const totalValue = nodes.reduce(
      (sum, node) => sum + BigInt(node.basicInfo[4]), 
      BigInt(0)
    );

    // Helper function to get path to node
    const pathToNode = (nodeId: string): NodeState[] => {
      const node = nodeMap.get(nodeId);
      if (!node) return [];

      return node.rootPath.map(id => nodeMap.get(id)!)
        .filter(Boolean);
    };

    // Helper function to get node depth
    const getNodeDepth = (nodeId: string): number => {
      const node = nodeMap.get(nodeId);
      return node ? node.rootPath.length - 1 : 0;
    };

    // Helper function to get node value percentage
    const getNodePercentage = (nodeId: string): number => {
      const node = nodeMap.get(nodeId);
      if (!node || totalValue === BigInt(0)) return 0;
      
      return Number((BigInt(node.basicInfo[4]) * BigInt(100)) / totalValue);
    };

    return {
      rootNodes,
      descendantNodes,
      pathToNode,
      getNodeDepth,
      totalValue,
      getNodePercentage,
    };
  }, [nodes]);
}