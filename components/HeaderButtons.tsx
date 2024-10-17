import React from 'react';
import { HStack, Button, Text } from '@chakra-ui/react';
import { ComposePanel } from './ComposePanel';
import { LogOut, Puzzle, LogIn } from 'lucide-react';

interface HeaderButtonsProps {
  userAddress: string;
  chainId: string;
  logout: () => void;
  login: () => void;
  nodes: any[];
  onNodeSelect: (nodeId: string) => void;
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({ 
  userAddress,
  chainId,
  logout, 
  login, 
  nodes
}) => {
  return (
    <HStack spacing={2}>
      <ComposePanel chainId={chainId}>
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

      {nodes.length > 0 && (
        <Text>Nodes: {nodes.length}</Text>
      )}

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