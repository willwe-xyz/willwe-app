import React from 'react';
import { VStack, Box, Text } from "@chakra-ui/react";
import { TokenBalance } from "./TokenBalance";
import { BalanceItem } from "@covalenthq/client-sdk";

interface BalanceListProps {
  balances: BalanceItem[];
  selectedToken: string;
  handleTokenSelect: (tokenAddress: string) => void;
  willBalanceItems: BalanceItem[];
  contrastingColor: string;
  reverseColor: string;
  hoverColor: string;
}

const BalanceList: React.FC<BalanceListProps> = ({ 
  balances, 
  selectedToken, 
  handleTokenSelect, 
  willBalanceItems,
  contrastingColor,
  reverseColor,
  hoverColor
}) => (
  <VStack 
    align="stretch" 
    spacing={0} 
    width="100%"
    height="100%"
    overflowY="auto"
    overflowX="hidden"
    css={{
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        width: '6px',
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: reverseColor,
        borderRadius: '3px',
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
        padding={0}
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
      <Text>No balance items to display</Text>
    )}
  </VStack>
);

export default BalanceList;