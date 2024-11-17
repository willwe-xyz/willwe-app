import { useState, useCallback, useMemo } from 'react';

interface SignalState {
  [key: string]: number;
}

export function useSignalState(childNodes: string[]) {
  const [childSignals, setChildSignals] = useState<SignalState>(() => 
    childNodes.reduce((acc, nodeId) => ({ ...acc, [nodeId]: 0 }), {})
  );

  const [inflationRate, setInflationRate] = useState('');

  const validateInflationRate = useCallback((value: string): boolean => {
    if (!value) return false;
    const rate = Number(value);
    return !isNaN(rate) && rate >= 0 && rate <= 1000000;
  }, []);

  const totalAllocation = useMemo(() => 
    Object.values(childSignals).reduce((sum, val) => sum + val, 0),
  [childSignals]);

  const validateChildSignals = useCallback(() => 
    Math.abs(totalAllocation - 100) < 0.01,
  [totalAllocation]);

  return {
    childSignals,
    setChildSignals,
    inflationRate,
    setInflationRate,
    validateInflationRate,
    validateChildSignals,
    totalAllocation
  };
}