import { useCallback, useMemo } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from 'next/router';

const DEFAULT_CHAIN_ID = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || '84532'; // Base Sepolia

export const useChainId = () => {
  const { user } = usePrivy();
  const router = useRouter();

  const getChainId = useCallback(() => {
    let chainId: string | undefined;

    // Try URL query first
    if (router.query.chainId) {
      chainId = router.query.chainId.toString();
    }
    // Then try path parameter
    else if (router.pathname.includes('/nodes/[chainId]')) {
      const pathParts = router.asPath.split('/');
      const pathChainId = pathParts[2];
      if (pathChainId && pathChainId !== '[chainId]') {
        chainId = pathChainId;
      }
    }
    // Then try Privy user
    else if (user?.wallet?.chainId) {
      chainId = user.wallet.chainId;
    }

    // Clean and return
    return chainId ? cleanChainId(chainId) : DEFAULT_CHAIN_ID;
  }, [router.query, router.pathname, router.asPath, user?.wallet?.chainId]);

  const cleanChainId = useCallback((dirtyChainId: string): string => {
    return dirtyChainId.replace('eip155:', '');
  }, []);

  const chainId = useMemo(() => getChainId(), [getChainId]);

  return {
    chainId,
    cleanChainId,
    isValidChainId: (chainId: string) => {
      const validChainIds = [
        '84532',     // Base Sepolia
        '11155420',  // Optimism Sepolia
        '167009',    // Taiko Hekla
        '167000',    // Taiko
      ];
      const cleaned = cleanChainId(chainId);
      return validChainIds.includes(cleaned);
    }
  };
};

export default useChainId;