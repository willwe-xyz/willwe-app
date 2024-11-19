import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, useToast, HStack, Icon } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { getRPCUrl } from '../../config/contracts';
import { CopyIcon } from '@chakra-ui/icons';

interface TokenNameDisplayProps {
  tokenAddress: string;
  chainId: string;
}

export const TokenNameDisplay: React.FC<TokenNameDisplayProps> = ({
  tokenAddress,
  chainId
}) => {
  const [tokenName, setTokenName] = useState<string>('Loading...');
  const toast = useToast();

  useEffect(() => {
    const fetchTokenName = async () => {
      if (!tokenAddress) {
        setTokenName('Invalid Address');
        return;
      }

      try {
        const rpcUrl = getRPCUrl(chainId);
        const activeProvider = new ethers.JsonRpcProvider(rpcUrl);
        

        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function name() view returns (string)'],
          activeProvider
        );
        const name = await tokenContract.name();
        setTokenName(name);
      } catch (error) {
        console.error('Error fetching token name:', error);
        setTokenName('Error');
        toast({
          title: "Failed to fetch token name",
          description: "Please check your network connection",
          status: "error",
          duration: 3000,
        });
      }
    };

    fetchTokenName();
  }, [tokenAddress, chainId, toast]);

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenAddress);
    toast({
      title: "Address copied",
      status: "success",
      duration: 2000,
    });
  };

  return (
    <Tooltip label="Click to copy token address">
      <Badge 
        colorScheme="purple" 
        p={2}
        cursor="pointer"
        onClick={handleCopy}
        _hover={{ opacity: 0.8 }}
      >
        <HStack spacing={2}>
          <span>{tokenName}</span>
          <Icon 
            as={CopyIcon} 
            w={3} 
            h={3}
            _hover={{ color: 'purple.300' }}
          />
        </HStack>
      </Badge>
    </Tooltip>
  );
};