import { useState, useEffect, useCallback, useMemo } from 'react';
import { NodeState } from '../types/chainData';
import { analyticsId } from '@/next.config';
import { MoreHorizontal } from 'lucide-react';
import { partition } from 'd3';
import { soladyActions } from 'viem/experimental';
import { constants } from 'buffer';
import { ReadonlyURLSearchParams } from 'next/navigation';

interface SignalData {
  membrane: string;
  inflation: string;
  timestamp: number;
  value: string;
}

interface ProcessedSignals {
  membrane: Record<string, { value: string; supporters: string[]; totalStrength: string }>;
  inflation: Record<string, { value: string; supporters: string[]; totalStrength: string }>;
  redistribution: Record<string, { value: string; supporters: string[]; totalStrength: string }>;
  other: Record<string, { value: string; supporters: string[]; totalStrength: string }>;
}

interface NodeConfigSignalsResult {
  signals: ProcessedSignals;
  raw: NodeState;
}

interface NodeSignalsResult {
  recentSignals: SignalData[];
  totalSignalValue: bigint;
  signalsByType: Map<string, SignalData[]>;
  hasActiveSignals: boolean;
  getLastSignalTime: () => number;
}

interface NodeConfigSignals {
  membrane: Record<string, { value: string; supporters: string[]; totalStrength: string }>;
  inflation: Record<string, { value: string; supporters: string[]; totalStrength: string }>;
  redistribution: Record<string, { value: string; supporters: string[]; totalStrength: string }>;
  other: Record<string, { value: string; supporters: string[]; totalStrength: string }>;
}

interface Signal {
  value: string;
  supporters: string[];
  totalStrength: string;
}

interface RawSignal {
  signalValue: string;
  supporters?: string[];
  totalStrength?: string;
}

export function useNodeSignals(node: NodeState): NodeSignalsResult {
  return useMemo(() => {
    // Process signals from the node state
    const allSignals: SignalData[] = [];
    
    // Process membrane signals
    if (node.nodeSignals?.membraneSignals) {
      node.nodeSignals.membraneSignals.forEach(([membrane, support]) => {
        allSignals.push({
          membrane,
          inflation: '0',
          timestamp: Date.now(),
          value: support
        });
      });
    }

    // Process inflation signals
    if (node.nodeSignals?.inflationSignals) {
      node.nodeSignals.inflationSignals.forEach(([value, support]) => {
        allSignals.push({
          membrane: '0',
          inflation: value,
          timestamp: Date.now(),
          value: support
        });
      });
    }

    // Process redistribution signals
    if (node.nodeSignals?.redistributionSignals) {
      node.nodeSignals.redistributionSignals.forEach((signal) => {
        if (Array.isArray(signal) && signal.length > 0) {
          allSignals.push({
            membrane: signal[0],
            inflation: '0',
            timestamp: Date.now(),
            value: signal.length.toString()
          });
        }
      });
    }
    
    // Sort signals by timestamp (newest first)
    allSignals.sort((a, b) => b.timestamp - a.timestamp);

    // Calculate total signal value
    const totalSignalValue = allSignals.reduce(
      (sum, signal) => sum + BigInt(signal.value || "0"),
      BigInt(0)
    );

    // Group signals by type
    const signalsByType = new Map<string, SignalData[]>();
    allSignals.forEach(signal => {
      const current = signalsByType.get(signal.membrane) || [];
      signalsByType.set(signal.membrane, [...current, signal]);
    });

    // Get most recent signal timestamp
    const getLastSignalTime = () => {
      return allSignals.length > 0 ? allSignals[0].timestamp : 0;
    };

    return {
      recentSignals: allSignals.slice(0, 10), // Last 10 signals
      totalSignalValue,
      signalsByType,
      hasActiveSignals: allSignals.length > 0,
      getLastSignalTime,
    };
  }, [node.nodeSignals]);
}

export function useNodeConfigSignals(nodeId: string, chainId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<NodeConfigSignalsResult | null>(null);

  const fetchData = useCallback(async () => {
    if (!nodeId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/nodes/data?chainId=${chainId}&nodeId=${nodeId}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching node signals: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Process raw signals into categorized signals based on signalType
      const processedSignals: ProcessedSignals = {
        membrane: {},
        inflation: {},
        redistribution: {},
        other: {}
      };

      // Process all signals from the node data
      if (result.data?.nodeSignals) {
        const { nodeSignals } = result.data;

        // Process membrane signals
        if (Array.isArray(nodeSignals.membraneSignals)) {
          nodeSignals.membraneSignals.forEach(([value, support]: [string, string]) => {
            processedSignals.membrane[value] = {
              value,
              supporters: [support].filter(Boolean),
              totalStrength: support
            };
          });
        }

        // Process inflation signals
        if (Array.isArray(nodeSignals.inflationSignals)) {
          nodeSignals.inflationSignals.forEach(([value, support]: [string, string]) => {
            processedSignals.inflation[value] = {
              value,
              supporters: [support].filter(Boolean),
              totalStrength: support
            };
          });
        }

        // Process redistribution signals
        if (Array.isArray(nodeSignals.redistributionSignals)) {
          nodeSignals.redistributionSignals.forEach((signal: string[]) => {
            if (Array.isArray(signal) && signal.length > 0) {
              const value = signal[0];
              processedSignals.redistribution[value] = {
                value,
                supporters: signal.slice(1).filter(Boolean),
                totalStrength: signal.length.toString()
              };
            }
          });
        }
      }
      
      setData({
        signals: processedSignals,
        raw: result.data
      });
    } catch (err) {
      console.error('Error fetching node config signals:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [nodeId, chainId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}
