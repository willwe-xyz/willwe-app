import React, { useState } from 'react';
import { HStack, Button, useDisclosure } from '@chakra-ui/react';
import { LogOut, Puzzle, LogIn } from 'lucide-react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import CreateToken from './CreateToken';
import DefineEntity from './DefineEntity';

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
  login
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <HStack spacing={2}>
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

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="4xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Compose</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs 
              isFitted 
              variant="enclosed"
              index={activeTab}
              onChange={setActiveTab}
              colorScheme="purple"
            >
              <TabList mb="1em">
                <Tab>
                  <HStack>
                    <Puzzle size={16} />
                    <span>Create Token</span>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <LogOut size={16} />
                    <span>Define Entity</span>
                  </HStack>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <CreateToken 
                    chainId={chainId} 
                    userAddress={userAddress}
                  />
                </TabPanel>
                <TabPanel>
                  <DefineEntity 
                    chainId={chainId}
                    onSubmit={() => {
                      onClose();
                      setActiveTab(0);
                    }}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HeaderButtons;