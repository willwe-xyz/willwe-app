// File: /components/Layout/MainLayout.tsx
import React, { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
  headerProps?: {
    userAddress?: string;
    chainId: string;
    logout: () => void;
    login: () => void;
    selectedNodeId?: string;
    onNodeSelect: (nodeId: string) => void;
    isTransacting: boolean;
    contrastingColor: string;
    reverseColor: string;
    cycleColors: () => void;
  };
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, headerProps }) => {
  return (
    <Box height="100vh" display="flex" flexDirection="column" overflow="hidden">
      {headerProps && <Header {...headerProps} />}
      {children}
    </Box>
  );
};

export default MainLayout;