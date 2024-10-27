import { BalanceItem } from '@covalenthq/client-sdk';

export interface ChainConfig {
  id: number;
  name: string;
  network: string;
  rpcUrls: string[];
  explorer: string;
}

export interface TransactionConfig {
  waitForConfirmations?: number;
  gasLimit?: number;
}

export interface TokenMetadata {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  balance: string;
  protocolBalance?: string;
}

export interface TokenBalance extends BalanceItem {
  protocolBalance?: string;
  formattedBalance?: string;
  formattedProtocolBalance?: string;
}

export interface NodePath {
  id: string;
  parent: string | null;
  children: string[];
  depth: number;
}

export type NodeHierarchy = {
  [nodeId: string]: NodePath;
};

export interface TransactionError extends Error {
  code?: string;
  reason?: string;
  transaction?: any;
}

export type TransactionStatus = 
  | 'idle'
  | 'submitting'
  | 'pending'
  | 'confirming'
  | 'success'
  | 'error';

export interface TransactionState {
  status: TransactionStatus;
  hash?: string;
  error?: TransactionError;
}