import { http, createConfig } from 'wagmi';
import { 
  localhost, 
  base, 
  optimismSepolia, 
  optimism, 
  baseSepolia, 
  taikoHekla, 
  taiko 
} from 'viem/chains';

// Create wagmi config
export const config = createConfig({
  chains: [
    localhost,
    baseSepolia,
    base,
    taikoHekla,
    taiko,
    optimismSepolia,
    optimism
  ],
  transports: {
    [localhost.id]: http(),
    [baseSepolia.id]: http(),
    [base.id]: http(),
    [taikoHekla.id]: http(),
    [taiko.id]: http(),
    [optimismSepolia.id]: http(),
    [optimism.id]: http(),
  },
});
