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

interface NodeConfigSignalsResult {
  nodeId: string;
  chainId: string;
  signals: NodeConfigSignals;
  raw: {
    membraneSignals: any[];
    inflationSignals: any[];
    redistributionPreferences: any[];
    otherSignals: any[];
  };
}

interface Signal {
  value: string;
  supporters: string[];
  totalStrength: string;
}

interface ProcessedSignals {
  membrane: Record<string, Signal>;
  inflation: Record<string, Signal>;
  redistribution: Record<string, Signal>;
  other: Record<string, Signal>;
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
    
    // If node has signals array, process them
    if (node.signals && Array.isArray(node.signals)) {
      // Process each signal in the array
      node.signals.forEach((signal: any) => {
        if (signal && signal.MembraneInflation && Array.isArray(signal.MembraneInflation)) {
          signal.MembraneInflation.forEach((mi: any[], index: number) => {
            if (Array.isArray(mi) && mi.length >= 2) {
              allSignals.push({
                membrane: mi[0]?.toString() || '',
                inflation: mi[1]?.toString() || '',
                timestamp: Number(signal.lastRedistSignal?.[index]) || Date.now(),
                value: mi[1]?.toString() || '0'
              });
            }
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
  }, [node.signals]);
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
      const cleanChainId = chainId.replace('eip155:', '');
      const ponderServerUrl = process.env.NEXT_PUBLIC_PONDER_SERVER_URL || 'http://localhost:8080';
      const response = await fetch(`${ponderServerUrl}/getNodeConfigSignals?nodeId=${nodeId}&chainId=${cleanChainId}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching node signals: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Node config signals API response:', result);
      
      // Process raw signals into categorized signals
      const processedSignals: ProcessedSignals = {
        membrane: {},
        inflation: {},
        redistribution: {},
        other: {}
      };

      // Process membrane signals
      result.raw.membraneSignals.forEach((signal: RawSignal) => {
        if (signal.signalValue) {
          processedSignals.membrane[signal.signalValue] = {
            value: signal.signalValue,
            supporters: signal.supporters || [],
            totalStrength: signal.totalStrength || '0'
          };
        }
      });

      // Process inflation signals
      result.raw.inflationSignals.forEach((signal: RawSignal) => {
        if (signal.signalValue) {
          processedSignals.inflation[signal.signalValue] = {
            value: signal.signalValue,
            supporters: signal.supporters || [],
            totalStrength: signal.totalStrength || '0'
          };
        }
      });

      // Process redistribution signals
      result.raw.redistributionPreferences.forEach((signal: RawSignal) => {
        if (signal.signalValue) {
          processedSignals.redistribution[signal.signalValue] = {
            value: signal.signalValue,
            supporters: signal.supporters || [],
            totalStrength: signal.totalStrength || '0'
          };
        }
      });

      // Process other signals and try to categorize them
      result.raw.otherSignals.forEach((signal: RawSignal) => {
        if (!signal.signalValue) return;

        // Try to determine signal type based on value
        const value = signal.signalValue;
        
        // Check if it's a redistribution preference (array format)
        if (value.startsWith('[') && value.endsWith(']')) {
          processedSignals.redistribution[value] = {
            value,
            supporters: signal.supporters || [],
            totalStrength: signal.totalStrength || '0'
          };
        }
        // Check if it's an inflation rate (numeric value in gwei/sec range)
        else if (!isNaN(Number(value)) && Number(value) > 0 && Number(value) < 1000000000000) {
          processedSignals.inflation[value] = {
            value,
            supporters: signal.supporters || [],
            totalStrength: signal.totalStrength || '0'
          };
        }
        // Check if it's a membrane ID (long numeric string)
        else if (!isNaN(Number(value)) && value.length > 20) {
          processedSignals.membrane[value] = {
            value,
            supporters: signal.supporters || [],
            totalStrength: signal.totalStrength || '0'
          };
        }
        // If we can't categorize it, put it in other
        else {
          processedSignals.other[value] = {
            value,
            supporters: signal.supporters || [],
            totalStrength: signal.totalStrength || '0'
          };
        }
      });

      // Validate supporters count
      Object.values(processedSignals).forEach(category => {
        Object.values(category).forEach((signal: unknown) => {
          const typedSignal = signal as Signal;
          if (typedSignal.supporters && typedSignal.supporters.length > 1) {
            console.warn('Unexpected number of supporters:', {
              signalValue: typedSignal.value,
              supporters: typedSignal.supporters,
              supportersCount: typedSignal.supporters.length
            });
          }
        });
      });

      // Update the result with processed signals
      result.signals = processedSignals;
      
      console.log('Processed signals:', processedSignals);
      setData(result);
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
