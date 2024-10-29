import { Box, Text } from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { useNetwork } from 'wagmi';
import { useBalances } from '../../hooks/useCovalentBalances';
import { BalanceList } from '../BalanceList';

interface TokenBalancesProps {
  selectedToken: string | null;
  onTokenSelect: (tokenAddress: string) => void;
  contrastingColor: string;
  reverseColor: string;
  hoverColor: string;
}

const TokenBalances = ({
  selectedToken,
  onTokenSelect,
  contrastingColor,
  reverseColor,
  hoverColor
}: TokenBalancesProps) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  
  const { 
    balances, 
    protocolBalances, 
    isLoading, 
    error 
  } = useBalances(address, chain?.id?.toString());

  // Handle token selection
  const handleTokenSelect = (tokenAddress: string) => {
    console.log('Token selected:', tokenAddress);
    onTokenSelect(tokenAddress); // Make sure this is being called
  };

  if (error) {
    return (
      <Box width="100%" height="100%" p={4}>
        <Text color={contrastingColor}>
          Error loading balances: {error.message}
        </Text>
      </Box>
    );
  }

  if (!address || !chain?.id) {
    return (
      <Box width="100%" height="100%" p={4}>
        <Text color={contrastingColor}>
          Please connect your wallet
        </Text>
      </Box>
    );
  }

  return (
    <Box 
      width="100%" 
      height="100%"
      visibility="visible" // Ensure visibility
      opacity={1} // Ensure opacity
    >
      <BalanceList
        selectedToken={selectedToken}
        handleTokenSelect={handleTokenSelect}
        contrastingColor={contrastingColor}
        reverseColor={reverseColor}
        hoverColor={hoverColor}
        balances={balances || []}
        protocolBalances={protocolBalances || []}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default TokenBalances;