import { createConfig } from 'ponder';
import { http, webSocket, fallback } from 'viem';
import { deployments, ABIs, getChainById } from './config/deployments';



export default createConfig({
  networks: {
    sepolia: {
      chainId: 11155111,
      transport: fallback([
        http(process.env.SEPOLIA_RPC_URL || 'https://rpc.ankr.com/eth_sepolia'),
        http('https://eth-sepolia.public.blastapi.io'),
        http('https://ethereum-sepolia.blockpi.network/v1/rpc/public'),
      ]),
      pollingInterval: 1000
    },
    base: {
      chainId: 8453,
      transport: fallback([
        http(process.env.BASE_RPC_URL || 'https://rpc.ankr.com/base'),
        http('https://base.publicnode.com'),
        http('https://base.blockpi.network/v1/rpc/public'),
      ]),
      pollingInterval: 1000
    },
    optimism: {
      chainId: 10,
      transport: fallback([
        http(process.env.OPTIMISM_RPC_URL || 'https://rpc.ankr.com/optimism'),
        http('https://optimism.publicnode.com'),
        http('https://optimism.blockpi.network/v1/rpc/public'),
      ]),
      pollingInterval: 1000
    },
    baseGoerli: {
      chainId: 84531,
      transport: fallback([
        http(process.env.BASE_GOERLI_RPC_URL || 'https://base-goerli.publicnode.com'),
        http('https://goerli.base.org'),
      ]),
      pollingInterval: 1000
    },
    optimismSepolia: {
      chainId: 11155420,
      transport: fallback([
        webSocket('wss://opt-sepolia.g.alchemy.com/v2/ITfK-0wBj2TjOhTObpgbYZrMVt621zzT'),
        http(process.env.OPTIMISM_SEPOLIA_RPC_URL || 'https://rpc.ankr.com/optimism_sepolia'),
        http('https://sepolia.optimism.io'),
        http('https://optimism-sepolia.blockpi.network/v1/rpc/public'),
      ]),
      pollingInterval: 1000
    },
    baseSepoliaTestnet: {
      chainId: 84532,
      transport: fallback([
        http(process.env.BASE_SEPOLIA_RPC_URL || 'https://base-sepolia.publicnode.com'),
        http('https://sepolia.base.org'),
        http('https://base-sepolia.blockpi.network/v1/rpc/public'),
      ]),
      pollingInterval: 1000
    },
  },
  contracts: {
    WillWe: {
      abi: ABIs.WillWe as any,
      network: {
        optimismSepolia: {
          address: deployments.WillWe['11155420'] as `0x${string}`,
          startBlock: 24524286,
        },
      },
    },
    Membranes: {
      abi: ABIs.Membrane as any,
      network: {
        optimismSepolia: {
          address: deployments.Membrane['11155420'] as `0x${string}`,
          startBlock: 24524286,
        },
      },
    },
    Execution: {
      abi: ABIs.Execution as any,
      network: {
        optimismSepolia: {
          address: deployments.Execution['11155420'] as `0x${string}`,
          startBlock: 24524286,
        },
      },
    },
  },
  database: {
    kind: "pglite",
    directory: "./.ponder/pglite",
  },
});