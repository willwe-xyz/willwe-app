import React, { useRef, useEffect } from 'react';
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
  Text,
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
import { formatAddress } from '../utils/formatting';
import { useAppKit } from '@/hooks/useAppKit';

interface HeaderButtonsProps {
  userAddress?: string;
  chainId: string;
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
  isTransacting?: boolean;
  buttonHoverBg?: string;
  selectedTokenColor: string;
}

export default function HeaderButtons({
  userAddress,
  chainId,
  selectedNodeId,
  onNodeSelect,
  isTransacting,
  buttonHoverBg = 'purple.50',
  selectedTokenColor,
}: HeaderButtonsProps) {
  const { isOpen: isComposeOpen, onOpen: onComposeOpen, onClose: onComposeClose } = useDisclosure();
  const { isOpen: isWillOpen, onOpen: onWillOpen, onClose: onWillClose } = useDisclosure();
  const { user } = useAppKit();

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

  const formattedAddress = user?.wallet?.address ? formatAddress(user.wallet.address) : '';
  const appkitButtonRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (appkitButtonRef.current) {
      appkitButtonRef.current.setAttribute(
        'label',
        user.isAuthenticated ? formattedAddress : 'Connect Wallet'
      );
    }
  }, [user.isAuthenticated, formattedAddress]);

  return (
    <>
      <HStack spacing={4}>
        {/* Will Button */}
        <Tooltip label="$WILL Token Hub">
          <Button
            leftIcon={<DollarSign size={18} />}
            onClick={onWillOpen}
            {...buttonStyles}
          >
            WILL
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

        {/* Session/Login Button (AppKit) */}
        <appkit-button
          ref={appkitButtonRef}
          style={{
            background: user.isAuthenticated
              ? 'white'
              : 'linear-gradient(135deg, #6366f1 0%, #a21caf 100%)',
            color: user.isAuthenticated ? selectedTokenColor : 'white',
            border: user.isAuthenticated ? `1.5px solid ${selectedTokenColor}` : 'none',
            borderRadius: '9999px',
            padding: '0.5rem 1.5rem',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: user.isAuthenticated
              ? '0 2px 8px 0 rgba(31, 38, 135, 0.10)'
              : '0 2px 8px 0 rgba(31, 38, 135, 0.15)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none',
            minWidth: '120px',
          }}
        ></appkit-button>
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
            userAddress={user?.wallet?.address}
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
                    <span>Define</span>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels flex="1" overflow="hidden">
                <TabPanel h="full" p={0}>
                  <CreateToken
                    chainId={chainId}
                    userAddress={user?.wallet?.address}
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