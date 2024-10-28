// File: ./hooks/useNodeHierarchy.ts
import { useMemo } from 'react';
import { NodeState } from '../types/chainData';

interface NodeHierarchyResult {
  rootNodes: NodeState[];
  descendantNodes: Map<string, NodeState[]>;
  totalValue: bigint;
  nodeValues: Record<string, number>;
}

export function useNodeHierarchy(nodes: NodeState[]): NodeHierarchyResult {
  return useMemo(() => {
    // Safely handle empty or undefined nodes array
    if (!nodes || nodes.length === 0) {
      return {
        rootNodes: [],
        descendantNodes: new Map(),
        totalValue: BigInt(0),
        nodeValues: {},
      };
    }

    // Create a map for quick node lookup
    const nodeMap = new Map<string, NodeState>();
    nodes.forEach(node => {
      if (node?.basicInfo?.[0]) {
        nodeMap.set(node.basicInfo[0], node);
      }
    });

    // Find root nodes (nodes with rootPath.length === 1)
    const rootNodes = nodes.filter(node => 
      node?.rootPath?.length === 1 && node?.basicInfo?.[0]
    );

    // Create descendant map
    const descendantNodes = new Map<string, NodeState[]>();
    nodes.forEach(node => {
      if (!node?.rootPath || !node?.basicInfo?.[0]) return;
      
      const parentId = node.rootPath[node.rootPath.length - 2];
      if (parentId) {
        const currentChildren = descendantNodes.get(parentId) || [];
        descendantNodes.set(parentId, [...currentChildren, node]);
      }
    });

    // Calculate total value safely
    const totalValue = nodes.reduce((sum, node) => {
      if (!node?.basicInfo?.[4]) return sum;
      try {
        return sum + BigInt(node.basicInfo[4]);
      } catch {
        return sum;
      }
    }, BigInt(0));

    // Calculate node values as percentages with safety checks
    const nodeValues: Record<string, number> = {};
    nodes.forEach(node => {
      if (!node?.basicInfo?.[0] || !node?.basicInfo?.[4]) return;
      
      try {
        const nodeValue = BigInt(node.basicInfo[4]);
        nodeValues[node.basicInfo[0]] = totalValue > 0 
          ? Number((nodeValue * BigInt(10000)) / totalValue) / 100
          : 0;
      } catch {
        nodeValues[node.basicInfo[0]] = 0;
      }
    });

    return {
      rootNodes,
      descendantNodes,
      totalValue,
      nodeValues,
    };
  }, [nodes]);
}