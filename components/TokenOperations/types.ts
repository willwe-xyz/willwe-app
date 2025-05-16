import { InterfaceAbi } from "ethers";
import { Chain } from "viem";

export interface OperationParams {
  amount?: string;
  membraneId?: string;
  targetNodeId?: string;
}

export interface MembraneMetadata {
  name: string;
  characteristics: Array<{
    title: string;
    link: string;
  }>;
  membershipConditions: Array<{
    tokenAddress: string;
    requiredBalance: string;
  }>;
}

export interface MembraneRequirement {
  tokenAddress: string;
  symbol: string;
  requiredBalance: string;
  formattedBalance: string;
}

export interface Membrane {
  id: string;
  name: string;
}

export interface TokenOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: OperationParams) => Promise<void>;
  operation: string;
  isLoading: boolean;
  data?: {
    currentNode: { id: string; name: string };
    children?: Array<{ id: string; name: string }>;
  };
  nodeId: string;
  chainId?: string;
}
