import { NodeState } from '../../../../types/chainData';

export interface SignalValue {
  value: string;
  support: string;
  supporters: {
    address: string;
    support: string;
  }[];
}

export interface SignalSectionProps {
  nodeId: string;
  chainId: string;
  nodeData: NodeState;
  userAddress: string;
  onSupportSignal: (signalType: 'membrane' | 'inflation', value: string) => Promise<void>;
}

export interface RedistributionSectionProps {
  nodeId: string;
  chainId: string;
  nodeData: NodeState;
  userAddress: string;
  onSupportRedistribution: (originator: string) => Promise<void>;
}

export interface SignalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: SignalValue;
  signalType: 'membrane' | 'inflation' | 'redistribution';
  totalSupply: string;
}
