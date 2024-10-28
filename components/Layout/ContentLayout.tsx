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
      <Sidebar {...sidebarProps} />
      <MainContent>{children}</MainContent>
    </Flex>
  );
};

const Sidebar: React.FC<ContentLayoutProps['sidebarProps']> = (props) => {
  return (
    <Box 
      width={{ base: '100%', md: '12%' }} 
      maxWidth={{ md: '110px' }}
      borderRight={{ md: '1px solid' }}
      borderColor={{ md: 'gray.200' }}
      overflowY="auto"
      bg="white"
    >
      <BalanceList {...props} />
    </Box>
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