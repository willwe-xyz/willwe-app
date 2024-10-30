import React from 'react';
import {
  HStack,
  Button,
  Box,
  Portal,
  useDisclosure,
  useColorModeValue,
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
  TabPanel,
  Tooltip,
} from '@chakra-ui/react';
import { 
  LogOut, 
  Puzzle, 
  LogIn,
  Coins,
  Users,
  Plus 
} from 'lucide-react';
import CreateToken from './CreateToken';
import DefineEntity from './DefineEntity';
import NotificationToast from './NotificationToast';
import { useTransaction } from '../contexts/TransactionContext';

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

const HeaderButtons: React.FC<HeaderButtonsProps> = ({
  userAddress,
  chainId,
  logout,
  login,
  selectedNodeId,
  onNodeSelect,
  isTransacting,
  buttonHoverBg = 'purple.50'
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { error: txError } = useTransaction();
  
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

        {/* Dashboard Button - Optional based on context */}
        {selectedNodeId && (
          <Tooltip label="Return to dashboard">
            <Button
              leftIcon={<Puzzle size={18} />}
              onClick={() => onNodeSelect('')}
              {...buttonStyles}
            >
              Dashboard
            </Button>
          </Tooltip>
        )}

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

      {/* Transaction Notifications */}
      <Portal>
        <Box
          position="fixed"
          top={4}
          right={4}
          zIndex={9999}
        >
          {txError && (
            <NotificationToast
              status="error"
              title="Transaction Failed"
              description={txError.message}
              onClose={() => {/* clear error */}}
            />
          )}
          {isTransacting && (
            <NotificationToast
              status="pending"
              title="Transaction Pending"
              description="Your transaction is being processed"
              onClose={() => {}}
            />
          )}
        </Box>
      </Portal>
    </>
  );
};

export default HeaderButtons;