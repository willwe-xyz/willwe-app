import { ethers } from 'ethers';
import { ABIs } from './contracts';

export interface EndpointActionConfig {
  id: string;
  label: string;
  description: string;
  getCallData: (params: any) => {
    target: string;
    callData: string;
    value: string;
  };
  fields: {
    name: string;
    label: string;
    type: 'address' | 'number' | 'string';
    placeholder?: string;
    required?: boolean;
  }[];
}

export const getEndpointActions = (rootTokenAddress: string, rootTokenSymbol: string): EndpointActionConfig[] => [
  {
    id: 'tokenTransfer',
    label: `${rootTokenSymbol} Transfer`,
    description: `Transfer ${rootTokenSymbol} tokens to an address`,
    fields: [
      {
        name: 'to',
        label: 'Recipient Address',
        type: 'address',
        placeholder: '0x...',
        required: true
      },
      {
        name: 'amount',
        label: `Amount (${rootTokenSymbol})`,
        type: 'number',
        placeholder: '0.0',
        required: true
      }
    ],
    getCallData: ({ to, amount }) => ({
      target: rootTokenAddress,
      callData: new ethers.Interface(ABIs.IERC20).encodeFunctionData('transfer', [
        to,
        ethers.parseEther(amount.toString())
      ]),
      value: '0'
    })
  },
  {
    id: 'customTokenTransfer',
    label: 'Custom Token Transfer',
    description: 'Transfer any ERC20 token to an address',
    fields: [
      {
        name: 'tokenAddress',
        label: 'Token Address',
        type: 'address',
        placeholder: '0x...',
        required: true
      },
      {
        name: 'to',
        label: 'Recipient Address',
        type: 'address',
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
    getCallData: ({ tokenAddress, to, amount }) => ({
      target: tokenAddress,
      callData: new ethers.Interface(ABIs.IERC20).encodeFunctionData('transfer', [
        to,
        ethers.parseEther(amount.toString())
      ]),
      value: '0'
    })
  },
  {
    id: 'customCall',
    label: 'Custom Call',
    description: 'Execute a custom contract call',
    fields: [
      {
        name: 'target',
        label: 'Target Address',
        type: 'address',
        placeholder: '0x...',
        required: true
      },
      {
        name: 'callData',
        label: 'Call Data',
        type: 'string',
        placeholder: '0x...',
        required: true
      },
      {
        name: 'value',
        label: 'Value (ETH)',
        type: 'number',
        placeholder: '0',
        required: true
      }
    ],
    getCallData: ({ target, callData, value }) => ({
      target,
      callData,
      value: value.toString()
    })
  }
];