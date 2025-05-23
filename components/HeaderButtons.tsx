import React, { useEffect, useState } from 'react';
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
import { resolveENS } from '../utils/ensUtils';

interface HeaderButtonsProps {
  userAddress: string;
  chainId: string;
  logout: () => void;
  login: () => void;
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string) => void;
  isTransacting?: boolean;
  selectedTokenColor: string;
}

export default function HeaderButtons({
  userAddress,
  chainId,
  logout,
  login,
  isTransacting,
  selectedTokenColor,
}: HeaderButtonsProps) {
  const { isOpen: isComposeOpen, onOpen: onComposeOpen, onClose: onComposeClose } = useDisclosure();
  const { isOpen: isWillOpen, onOpen: onWillOpen, onClose: onWillClose } = useDisclosure();
  const [resolvedName, setResolvedName] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetchENS = async () => {
      if (userAddress) {
        const name = await resolveENS(userAddress);
        if (!ignore) setResolvedName(name);
      } else {
        setResolvedName(null);
      }
    };
    fetchENS();
    return () => { ignore = true; };
  }, [userAddress]);

  const modalContentStyles = {
    maxH: 'calc(100vh - 200px)',
    display: 'flex',
    flexDirection: 'column',
  };

  // Consistent button styles
  const buttonStyles = {
    size: "sm",
    variant: "outline",
    _hover: { 
      bg: `${selectedTokenColor}20`,
      borderColor: selectedTokenColor,
      color: selectedTokenColor,
      transform: 'translateY(-1px)',
      shadow: 'sm'
    },
    _active: {
      bg: `${selectedTokenColor}30`,
      transform: 'translateY(0)'
    },
    isDisabled: isTransacting,
    borderColor: selectedTokenColor,
    color: selectedTokenColor,
    transition: 'all 0.2s ease-in-out'
  };

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

        {/* Auth Button */}
        {userAddress ? (
          <Button
            leftIcon={<LogOut size={18} />}
            onClick={logout}
            {...buttonStyles}
          >
            {resolvedName || (userAddress.slice(0, 6) + '...' + userAddress.slice(-4))}
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
                    color: selectedTokenColor,
                    borderBottom: '2px solid',
                    borderColor: selectedTokenColor
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
                    color: selectedTokenColor,
                    borderBottom: '2px solid',
                    borderColor: selectedTokenColor
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