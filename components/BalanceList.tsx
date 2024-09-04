import React from 'react';
import { VStack, Box, Text, Spinner } from "@chakra-ui/react";
import { TokenBalance } from "./TokenBalance";
import { useCovalentBalances } from '../hooks/useCovalentBalances';
import { useWillBalances } from '../hooks/useWillBalances';
interface BalanceListProps {
  selectedToken: string;
  handleTokenSelect: (tokenAddress: string) => void;
  contrastingColor: string;
  reverseColor: string;
  hoverColor: string;
  userAddress: string;
  chainId: string;
}

const BalanceList: React.FC<BalanceListProps> = ({ 
  selectedToken, 
  handleTokenSelect, 
  contrastingColor,
  reverseColor,
  hoverColor,
  userAddress,
  chainId
}) => {

  const { balances, isLoading, error } = useCovalentBalances(userAddress, chainId);
  const { willBalanceItems, isLoading: willLoading, error: willError } = useWillBalances(chainId);

    if (isLoading || willLoading) {
      return <Spinner size="sm" />;
    }
    
    if (error || willError) {
      return <Text color="red.500">Error loading balances</Text>;
    } 

    return (
<>
  <VStack 
  align="stretch" 
  spacing={0} 
  width="100%"
  height="100%"
  overflowY="auto"
  overflowX="hidden"
  css={{
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      width: '4px',
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: reverseColor,
      borderRadius: '2px',
    },
    '&:hover::-webkit-scrollbar-thumb': {
      background: contrastingColor,
    },
    'scrollbarWidth': 'thin',
    'scrollbarColor': `${reverseColor} transparent`,
  }}
>
  {balances.length > 0 ? balances.map((balance) => (
    <Box 
      key={balance.contract_address}
      onClick={() => handleTokenSelect(balance.contract_address)}
      cursor="pointer"
      opacity={selectedToken && selectedToken !== balance.contract_address ? 0.5 : 1}
      transition="opacity 0.2s, background-color 0.2s"
      _hover={{
        opacity: 1,
        backgroundColor: hoverColor,
      }}
      width="100%"
      padding={1}
    >
      <TokenBalance
        balanceItem={balance}
        isSelected={selectedToken === balance.contract_address}
        protocolDeposit={willBalanceItems.find(item => item.contract_address === balance.contract_address)}
        contrastingColor={contrastingColor}
        reverseColor={reverseColor}
      />
    </Box>
  )) : (
    <Text color={contrastingColor}>No balance items to display</Text>
  )}
</VStack>
</>

  )


}


export default BalanceList;



