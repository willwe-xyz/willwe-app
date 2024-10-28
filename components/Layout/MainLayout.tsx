import React from 'react';
import { Flex } from '@chakra-ui/react';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  headerProps: {
    userAddress?: string;
    chainId: string;
    logout: () => void;
    login: () => void;
    selectedNodeId?: string;
    onNodeSelect: (nodeId: string) => void;
    isTransacting?: boolean;
    contrastingColor: string;
    reverseColor: string;
    cycleColors: () => void;
  };
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, headerProps }) => {
  return (
    <Flex direction="column" height="100vh">
      <Header {...headerProps} />
      {children}
    </Flex>
  );
};

export default MainLayout;