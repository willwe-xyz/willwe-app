import React from 'react';
import { VStack, Box, Text, Center } from "@chakra-ui/react";
import { TokenBalance } from "./TokenBalance";
import { BalanceItem } from "@covalenthq/client-sdk";

interface BalanceListProps {
  balances: BalanceItem[];
  selectedToken: string;
  handleTokenSelect: (tokenAddress: string) => void;
  willBalanceItems: BalanceItem[];
  contrastingColor: string;
  reverseColor: string;
}

const BalanceList: React.FC<BalanceListProps> = ({ 
  balances, 
  selectedToken, 
  handleTokenSelect, 
  willBalanceItems,
  contrastingColor,
  reverseColor
}) => (
  <VStack 
    align="center" 
    spacing={1}
    overflowY="auto" 
    maxHeight="110vh"
    width="100%"
    css={{
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        width: '8px',
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: contrastingColor,
        borderRadius: '24px',
        transition: 'background-color 0.2s',
      },
      '&:hover::-webkit-scrollbar-thumb': {
        background: reverseColor,
      },
      'scrollbarWidth': 'thin',
      'scrollbarColor': `${contrastingColor} transparent`,
      '&:hover': {
        scrollbarColor: `${reverseColor} transparent`,
      },
      'transition': 'scrollbar-color 0.2s',
    }}
  >
    {balances.length > 0 ? balances.map((balance) => (
      <Center key={balance.contract_address} width="100%">
        <TokenBalance
          balanceItem={balance}
          isSelected={selectedToken === balance.contract_address}
          protocolDeposit={willBalanceItems.find(item => item.contract_address === balance.contract_address)}
          contrastingColor={contrastingColor}
          reverseColor={reverseColor}
          onClick={() => handleTokenSelect(balance.contract_address)}
        />
      </Center>
    )) : (
      <Text>No balance items to display</Text>
    )}
  </VStack>
);

export default BalanceList;