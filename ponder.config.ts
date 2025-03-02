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
      enabled: false
    },
    base: {
      chainId: 8453,
      transport: fallback([
        http(process.env.BASE_RPC_URL || 'https://rpc.ankr.com/base'),
        http('https://base.publicnode.com'),
        http('https://base.blockpi.network/v1/rpc/public'),
      ]),
      enabled: false
    },
    optimism: {
      chainId: 10,
      transport: fallback([
        http(process.env.OPTIMISM_RPC_URL || 'https://rpc.ankr.com/optimism'),
        http('https://optimism.publicnode.com'),
        http('https://optimism.blockpi.network/v1/rpc/public'),
      ]),
      enabled: false
    },
    baseGoerli: {
      chainId: 84531,
      transport: fallback([
        http(process.env.BASE_GOERLI_RPC_URL || 'https://base-goerli.publicnode.com'),
        http('https://goerli.base.org'),
      ]),
      enabled: false
    },
    optimismSepolia: {
      chainId: 11155420,
      transport: fallback([
        webSocket('wss://opt-sepolia.g.alchemy.com/v2/ITfK-0wBj2TjOhTObpgbYZrMVt621zzT'),
        http(process.env.OPTIMISM_SEPOLIA_RPC_URL || 'https://rpc.ankr.com/optimism_sepolia'),
        http('https://sepolia.optimism.io'),
        http('https://optimism-sepolia.blockpi.network/v1/rpc/public'),
      ]),
      enabled: true
    },
    baseSepoliaTestnet: {
      chainId: 84532,
      transport: fallback([
        http(process.env.BASE_SEPOLIA_RPC_URL || 'https://base-sepolia.publicnode.com'),
        http('https://sepolia.base.org'),
        http('https://base-sepolia.blockpi.network/v1/rpc/public'),
      ]),
      enabled: false
    },
  },
  contracts: {
    WillWe: {
      abi: ABIs.WillWe,
      network: {
        optimismSepolia: {
          address: deployments.WillWe['11155420'],
          startBlock: 24524286,
        },
      },
    },
    Membranes: {
      abi: ABIs.Membrane,
      network: {
        optimismSepolia: {
          address: deployments.Membrane['11155420'],
          startBlock: 24524286,
        },
      },
    },
    Execution: {
      abi: ABIs.Execution,
      network: {
        optimismSepolia: {
          address: deployments.Execution['11155420'],
          startBlock: 24524286,
        },
      },
    },
  },
  database: {
    type: "sqlite",
    filename: "./ponder.db",
  },
});