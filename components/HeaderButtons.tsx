import React from 'react';
import { HStack, Button, Icon } from '@chakra-ui/react';
import { RiLogoutCircleRFill } from 'react-icons/ri';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { ComposePanel } from './ComposePanel'; // Adjust the import path as needed
import { LogOut, Puzzle } from 'lucide-react';

interface HeaderButtonsProps {
  userAddress: string;
  logout: () => void;
  cols: any;
}



export const HeaderButtons = ({ userAddress, logout, cols }) => {
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
      <Button
        leftIcon={<LogOut color='white' size={18}  />}
        onClick={logout}  // This will now correctly call the logout function
        size="sm"
        colorScheme="purple"
        variant="solid"
      >
        {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
      </Button>
    </HStack>
  );
};

export default HeaderButtons;