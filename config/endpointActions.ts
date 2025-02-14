import { ethers } from 'ethers';
import { ABIs } from './contracts';

interface ActionField {
  name: string;
  label: string;
  type: 'text' | 'number';
  placeholder: string;
  required?: boolean;
}

export interface EndpointActionConfig {
  id: string;
  label: string;
  description: string;
  fields: ActionField[];
  getCallData: (params: Record<string, any>, rootTokenAddress: string) => {
    target: string;
    callData: string;
    value: string;
  };
}

export const getEndpointActions = (rootTokenAddress: string, tokenSymbol: string): EndpointActionConfig[] => [
  {
    id: 'tokenTransfer',
    label: `Transfer ${tokenSymbol}`,
    description: `Transfer ${tokenSymbol} tokens to another address`,
    fields: [
      {
        name: 'to',
        label: 'Recipient Address',
        type: 'text',
        placeholder: '0x...',
        required: true
      },
      {
        name: 'amount',
        label: 'Amount',
        type: 'number',
        placeholder: '0.0',
        required: true
      }
    ],
    getCallData: (params) => {
      // If we don't have both required params, or if rootTokenAddress is invalid, return empty calldata
      if (!params.to || !params.amount || !rootTokenAddress?.startsWith('0x')) {
        return {
          target: rootTokenAddress,
          callData: '0x',
          value: '0'
        };
      }

      try {
        const contract = new ethers.Contract(rootTokenAddress, ABIs.IERC20);
        // Handle empty amount as 0
        const amount = params.amount?.trim() ? ethers.parseEther(params.amount) : BigInt(0);
        
        return {
          target: rootTokenAddress,
          callData: contract.interface.encodeFunctionData('transfer', [params.to, amount]),
          value: '0'
        };
      } catch (error) {
        console.error('Error generating token transfer calldata:', error);
        return {
          target: rootTokenAddress,
          callData: '0x',
          value: '0'
        };
      }
    }
  },
  {
    id: 'customCall',
    label: 'Custom Call',
    description: 'Execute a custom contract call',
    fields: [
      {
        name: 'target',
        label: 'Target Contract',
        type: 'text',
        placeholder: '0x...',
        required: true
      },
      {
        name: 'calldata',
        label: 'Call Data',
        type: 'text',
        placeholder: '0x...',
        required: true
      },
      {
        name: 'value',
        label: 'ETH Value',
        type: 'number',
        placeholder: '0.0'
      }
    ],
    getCallData: (params) => {
      const value = params.value || '0';
      return {
        target: params.target || ethers.ZeroAddress,
        callData: params.calldata && params.calldata.length >= 10 ? params.calldata : '0x',
        value: value
      };
    }
  }
];