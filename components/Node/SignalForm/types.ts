export interface SignalFormProps {
    nodeId: string;
    parentId: string;
    membraneId: string;
    membraneName: string;
    selectedTokenColor: string;
    onSubmit: (signals: number[]) => Promise<void>;
    onClose: () => void;
  }
  
  export interface SignalState {
    value: number;
    childId: string;
    lastSignal: string;
    balance: string;
    eligibilityPerSecond: string;
  }