import React from 'react';
import {
  HStack,
  Button,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
} from '@chakra-ui/react';
import { 
  LogOut, 
  LogIn,
  Coins,
  Users,
  Plus 
} from 'lucide-react';
import CreateToken from './CreateToken';
import DefineEntity from './DefineEntity';

interface HeaderButtonsProps {
  userAddress: string;
  chainId: string;
  logout: () => void;
  login: () => void;
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
  isTransacting?: boolean;
  buttonHoverBg?: string;
}

export default function HeaderButtons({
  userAddress,
  chainId,
  logout,
  login,
  selectedNodeId,
  onNodeSelect,
  isTransacting,
  buttonHoverBg = 'purple.50'
}: HeaderButtonsProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Consistent button styles
  const buttonStyles = {
    size: "sm",
    variant: "outline",
    colorScheme: "purple",
    _hover: { bg: buttonHoverBg },
    isDisabled: isTransacting
  };

  return (
    <>
      <HStack spacing={4}>
        {/* Compose Button - Always Visible */}
        <Tooltip label="Create new token or entity">
          <Button
            leftIcon={<Plus size={18} />}
            onClick={onOpen}
            {...buttonStyles}
          >
            Compose
          </Button>
        </Tooltip>

        {/* Auth Button */}
        {userAddress ? (
          <Button
            leftIcon={<LogOut size={18} />}
            onClick={logout}
            {...buttonStyles}
          >
            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </Button>
        ) : (
          <Button
            leftIcon={<LogIn size={18} />}
            onClick={login}
            {...buttonStyles}
          >
            Connect
          </Button>
        )}
      </HStack>

      {/* Compose Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="4xl"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay 
          bg="blackAlpha.300"
          backdropFilter="blur(10px)"
        />
        <ModalContent 
          maxW="1000px"
          maxH="90vh"
          bg="white"
          rounded="lg"
          shadow="xl"
          overflow="hidden"
        >
          <ModalHeader 
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            Compose
            <ModalCloseButton />
          </ModalHeader>

          <ModalBody p={0}>
            <Tabs
              isFitted
              colorScheme="purple"
              isLazy
            >
              <TabList borderBottom="1px solid" borderColor="gray.100">
                <Tab
                  py={4}
                  _selected={{
                    color: 'purple.600',
                    borderBottom: '2px solid',
                    borderColor: 'purple.600'
                  }}
                >
                  <HStack spacing={2}>
                    <Coins size={16} />
                    <span>Create Token</span>
                  </HStack>
                </Tab>
                <Tab
                  py={4}
                  _selected={{
                    color: 'purple.600',
                    borderBottom: '2px solid',
                    borderColor: 'purple.600'
                  }}
                >
                  <HStack spacing={2}>
                    <Users size={16} />
                    <span>Define Entity</span>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={6}>
                  <CreateToken
                    chainId={chainId}
                    userAddress={userAddress}
                    onSuccess={onClose}
                  />
                </TabPanel>
                <TabPanel p={6}>
                  <DefineEntity
                    chainId={chainId}
                    onSubmit={onClose}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}