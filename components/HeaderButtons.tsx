import React from 'react';
import { HStack, Button, Icon } from '@chakra-ui/react';
import { ComposePanel } from './ComposePanel';
import { LogOut, Puzzle, LogIn } from 'lucide-react';

interface HeaderButtonsProps {
  userAddress: string | undefined;
  logout: () => void;
  login: () => void;
  cols: any;
  nodes: any[]; // Add this prop for the GridNavigation
  onNodeSelect: (nodeId: string) => void; // Add this prop for the GridNavigation
}

export const HeaderButtons: React.FC<HeaderButtonsProps> = ({ 
  userAddress, 
  logout, 
  login, 
  cols,
  nodes,
  onNodeSelect
}) => {
  return (
    <HStack justifyContent="flex-end" width="100%" spacing={2}>
      <ComposePanel>
        {(onOpen) => (
          <Button
            leftIcon={<Puzzle color='white' size={18} />}
            onClick={onOpen}
            size="sm"
            colorScheme="blue"
            variant="solid"
          >
            Compose
          </Button>
        )}
      </ComposePanel>


      {userAddress ? (
        <Button
          leftIcon={<LogOut color='white' size={18} />}
          onClick={logout}
          size="sm"
          colorScheme="purple"
          variant="solid"
        >
          {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
        </Button>
      ) : (
        <Button
          leftIcon={<LogIn color='white' size={18} />}
          onClick={login}
          size="sm"
          colorScheme="green"
          variant="solid"
        >
          Login
        </Button>
      )}
    </HStack>
  );
};

export default HeaderButtons;