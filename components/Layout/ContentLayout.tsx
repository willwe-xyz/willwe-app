import React from 'react';
import { Flex, Box } from '@chakra-ui/react';
import BalanceList from '../BalanceList';
import { BalanceItem } from '@covalenthq/client-sdk';

interface ContentLayoutProps {
  children: React.ReactNode;
  sidebarProps: {
    selectedToken: string;
    handleTokenSelect: (tokenAddress: string) => void;
    contrastingColor: string;
    reverseColor: string;
    hoverColor: string;
    userAddress: string;
    chainId: string;
    balances: BalanceItem[];
    protocolBalances: BalanceItem[];
    isLoading: boolean;
  };
}

const ContentLayout: React.FC<ContentLayoutProps> = ({ children, sidebarProps }) => {
  return (
    <Flex flex={1} direction={{ base: 'column', md: 'row' }}>
      <MainContent>{children}</MainContent>
    </Flex>
  );
};


const MainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box 
      flex={1} 
      p={4} 
      overflowY="auto"
      bg="gray.50"
    >
      {children}
    </Box>
  );
};

export default ContentLayout;