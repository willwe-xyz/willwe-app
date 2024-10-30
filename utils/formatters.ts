import { NodeState, TransformedNodeData } from "../types/chainData";

export const formatBalance = (value: string | bigint | undefined | null): string => {
  if (!value) return '0';
  
  try {
    // Convert to BigInt if string
    const bigIntValue = typeof value === 'string' ? BigInt(value) : value;
    
    // Convert to string and handle decimals (assuming 18 decimals)
    const stringValue = bigIntValue.toString();
    const decimalPosition = Math.max(0, stringValue.length - 18);
    
    if (decimalPosition === 0) {
      return `0.${stringValue.padStart(18, '0')}`;
    }
    
    const wholePart = stringValue.slice(0, decimalPosition);
    const decimalPart = stringValue.slice(decimalPosition).padEnd(18, '0');
    
    // Format with commas for whole part
    const formattedWholePart = Number(wholePart).toLocaleString();
    
    // Trim trailing zeros in decimal part
    const trimmedDecimalPart = decimalPart.replace(/0+$/, '');
    
    return trimmedDecimalPart 
      ? `${formattedWholePart}.${trimmedDecimalPart}` 
      : formattedWholePart;
  } catch (err) {
    console.warn('Error formatting balance:', err);
    return '0';
  }
};

// Helper function to format percentage
export const formatPercentage = (value: number): string => {
  try {
    return value.toFixed(2) + '%';
  } catch (err) {
    console.warn('Error formatting percentage:', err);
    return '0%';
  }
};

// Helper function to format short address
export const formatShortAddress = (address: string): string => {
  try {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  } catch (err) {
    console.warn('Error formatting address:', err);
    return '';
  }
};

// Helper function to determine if value is valid number
export const isValidNumber = (value: any): boolean => {
  if (typeof value === 'bigint') return true;
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'string') {
    try {
      BigInt(value);
      return true;
    } catch {
      return false;
    }
  }
  return false;
};



export const transformNodeData = (node: NodeState): TransformedNodeData => {
  return {
    basicInfo: node.basicInfo.map(String),
    membersOfNode: node.membersOfNode || [],
    childrenNodes: node.childrenNodes || [],
    rootPath: node.rootPath || [],
    signals: (node.signals || []).map(signal => ({
      MembraneInflation: signal.MembraneInflation || [],
      lastRedistSignal: signal.lastRedistSignal || []
    }))
  };
};