declare module '@reown/appkit-adapter-wagmi' {
  import type { Chain } from 'viem';
  import type { Storage, Config } from 'wagmi';
  import type { ChainAdapter } from '@reown/appkit';
  import { type AdapterBlueprint } from '@reown/appkit';
  import { type ChainNamespace } from '@reown/appkit-common';

  export interface WagmiAdapterConfig {
    networks: Chain[];
    projectId: string;
    storage?: any;
    ssr?: boolean;
    customRpcUrls?: Record<string, string>;
    pendingTransactionsFilter?: {
      enable?: boolean;
      pollingInterval?: number;
    };
  }

  export class WagmiAdapter extends AdapterBlueprint {
    readonly wagmiConfig: Config;
    namespace: ChainNamespace | undefined;
    adapterType: string | undefined;
    projectId?: string;
    private balancePromises: Record<string, Promise<{ balance: string; symbol: string }>>;
    private pendingTransactionsFilter: {
      enable: boolean;
      pollingInterval: number;
    };
    private wagmiChains: Chain[];
    private unwatchPendingTransactions?: () => void;

    constructor(config: WagmiAdapterConfig);
    construct(options: any): void;
    getAccounts(params: any): Promise<{ accounts: any[] }>;
    getWagmiConnector(id: string): any;
    createConfig(configParams: any): void;
    setupWatchPendingTransactions(): void;
    setupWatchers(): void;
    addThirdPartyConnectors(options: any): Promise<void>;
    addWagmiConnectors(options: any, appKit: any): void;
    signMessage(params: any): Promise<{ signature: string }>;
    sendTransaction(params: any): Promise<{ hash: string }>;
    writeContract(params: any): Promise<{ hash: string }>;
    estimateGas(params: any): Promise<{ gas: bigint }>;
    parseUnits(params: { value: string; decimals: number }): bigint;
    formatUnits(params: { value: bigint; decimals: number }): string;
    addWagmiConnector(connector: any, options: any): Promise<void>;
    syncConnectors(options: any, appKit: any): Promise<void>;
    syncConnection(params: any): Promise<any>;
    connectWalletConnect(chainId?: number | string): Promise<{ clientId: string }>;
    connect(params: any): Promise<any>;
    reconnect(params: any): Promise<void>;
    getBalance(params: any): Promise<{ balance: string; symbol: string }>;
    getWalletConnectProvider(): any;
    disconnect(): Promise<void>;
    switchNetwork(params: any): Promise<void>;
    getCapabilities(params: any): Promise<any>;
    grantPermissions(params: any): Promise<any>;
    revokePermissions(params: any): Promise<`0x${string}`>;
    walletGetAssets(params: any): Promise<any>;
    setUniversalProvider(universalProvider: any): void;
  }
} 