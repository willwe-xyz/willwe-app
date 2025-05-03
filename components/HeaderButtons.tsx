import React from 'react';
import {
  HStack,
  Button,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
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
  Plus,
  DollarSign 
} from 'lucide-react';
import CreateToken from './CreateToken';
import { DefineEntity } from './DefineEntity';
import WillTokenPanel from './WillTokenPanel';

interface HeaderButtonsProps {
  userAddress: string;
  chainId: string;
  logout: () => void;
  login: () => void;
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
  isTransacting?: boolean;
  buttonHoverBg?: string;
  selectedTokenColor: string;
}

export default function HeaderButtons({
  userAddress,
  chainId,
  logout,
  login,
  isTransacting,
  buttonHoverBg = 'purple.50',
  selectedTokenColor,
}: HeaderButtonsProps) {
  const { isOpen: isComposeOpen, onOpen: onComposeOpen, onClose: onComposeClose } = useDisclosure();
  const { isOpen: isWillOpen, onOpen: onWillOpen, onClose: onWillClose } = useDisclosure();

  const modalContentStyles = {
    maxH: 'calc(100vh - 200px)',
    display: 'flex',
    flexDirection: 'column',
  };

  // Consistent button styles
  const buttonStyles = {
    size: "sm",
    variant: "outline",
    colorScheme: "purple",
    _hover: { 
      bg: buttonHoverBg,
      borderColor: selectedTokenColor,
      color: selectedTokenColor
    },
    isDisabled: isTransacting,
    borderColor: selectedTokenColor,
    color: selectedTokenColor
  };

  return (
    <>
      <HStack spacing={4}>
        
        {/* Will Button */}
        <Tooltip label="Will Token Operations">
          <Button
            leftIcon={<DollarSign size={18} />}
            onClick={onWillOpen}
            {...buttonStyles}
          >
            $will
          </Button>
        </Tooltip>

        {/* Compose Button */}
        <Tooltip label="Create new token or entity">
          <Button
            leftIcon={<Plus size={18} />}
            onClick={onComposeOpen}
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

      {/* Will Modal */}
      <Modal 
        isOpen={isWillOpen} 
        onClose={onWillClose}
        size="4xl"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay 
          bg="blackAlpha.300"
          backdropFilter="blur(10px)"
        />
        <ModalContent 
          sx={modalContentStyles}
          maxW="1000px"
          bg="white"
          rounded="lg"
          shadow="xl"
          overflow="hidden"
        >
          <ModalHeader 
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            Will Token
            <ModalCloseButton />
          </ModalHeader>
          <WillTokenPanel 
            chainId={chainId}
            userAddress={userAddress}
            onClose={onWillClose}
          />
        </ModalContent>
      </Modal>

      {/* Compose Modal */}
      <Modal 
        isOpen={isComposeOpen} 
        onClose={onComposeClose}
        size="4xl"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay 
          bg="blackAlpha.300"
          backdropFilter="blur(10px)"
        />
        <ModalContent 
          sx={modalContentStyles}
          maxW="1000px"
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

          <Box flex="1" overflow="hidden">
            <Tabs
              isFitted
              colorScheme="purple"
              isLazy
              display="flex"
              flexDirection="column"
              h="full"
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

              <TabPanels flex="1" overflow="hidden">
                <TabPanel h="full" p={0}>
                  <CreateToken
                    chainId={chainId}
                    userAddress={userAddress}
                    onSuccess={onComposeClose}
                  />
                </TabPanel>
                <TabPanel h="full" p={0}>
                  <DefineEntity
                    chainId={chainId}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
}