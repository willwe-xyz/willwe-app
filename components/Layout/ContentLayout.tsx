
import React from 'react';
import { Box } from '@chakra-ui/react';

interface ContentLayoutProps {
  children: React.ReactNode;
}

const ContentLayout: React.FC<ContentLayoutProps> = ({ children }) => {
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