import { useMemo } from 'react';
import { NodeState, UserSignal } from '../types/chainData';

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

export function useNodeSignals(node: NodeState): NodeSignalsResult {
  return useMemo(() => {
    const processSignal = (signal: UserSignal): SignalData[] => {
      // @ts-ignore
      return signal.MembraneInflation.map(([membrane, inflation], index) => ({
        membrane,
        inflation,
        timestamp: Number(signal.lastRedistSignal[index]) || Date.now(),
        value: inflation
      }));
    };

    // Process all signals
    const allSignals = node.signals.flatMap(processSignal)
      .sort((a, b) => b.timestamp - a.timestamp);

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
