import React from 'react';
import { HStack, Button } from '@chakra-ui/react';
import { ComposePanel } from './ComposePanel';
import { LogOut, Puzzle, LogIn } from 'lucide-react';

interface HeaderButtonsProps {
  userAddress: string | undefined;
  logout: () => void;
  login: () => void;
  cols: any;
  nodes: any[];
  onNodeSelect: (nodeId: string) => void;
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({ 
  userAddress, 
  logout, 
  login, 
  cols,
  nodes,
  onNodeSelect
}) => {
  return (
    <HStack spacing={2}>
      <ComposePanel>
        {(onOpen) => (
          <Button
            leftIcon={<Puzzle size={18} />}
            onClick={onOpen}
            size="sm"
            variant="outline"
            color="black"
            _hover={{ bg: 'purple.500', color: 'white' }}
          >
            Compose
          </Button>
        )}
      </ComposePanel>

      {userAddress ? (
        <Button
          leftIcon={<LogOut size={18} />}
          onClick={logout}
          size="sm"
          variant="outline"
          color="black"
          _hover={{ bg: 'purple.500', color: 'white' }}
        >
          {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
        </Button>
      ) : (
        <Button
          leftIcon={<LogIn size={18} />}
          onClick={login}
          size="sm"
          variant="outline"
          color="black"
          _hover={{ bg: 'purple.500', color: 'white' }}
        >
          Login
        </Button>
      )}
    </HStack>
  );
};

export default HeaderButtons;