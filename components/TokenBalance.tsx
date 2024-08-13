import React from "react";
import { BalanceItem } from "@covalenthq/client-sdk";
import { Box, Text, VStack, Tooltip } from "@chakra-ui/react";
import { formatEther } from "viem";

interface TokenBalanceProps {
    balanceItem: BalanceItem;
    protocolDeposit?: BalanceItem;
    isSelected: boolean;
    contrastingColor: string;
    reverseColor: string;
    onClick: () => void;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({ 
    balanceItem, 
    protocolDeposit, 
    isSelected,
    contrastingColor,
    reverseColor,
    onClick
}) => {
    // Format the nominal balance to exactly 4 decimal points
    const nominalBalance = parseFloat(formatEther(BigInt(balanceItem.balance))).toFixed(4);

    // Format the protocol balance if it exists
    const protocolBalance = protocolDeposit 
        ? parseFloat(formatEther(BigInt(protocolDeposit.balance))).toFixed(4)
        : "0.0000";

    return (
        <Box
            borderWidth={protocolDeposit ? 2 : 1}
            borderColor={contrastingColor}
            color={isSelected ? 'black' : contrastingColor}
            backgroundColor={isSelected ? reverseColor : ''}
            p={1}
            borderRadius="md"
            width="80px"
            height="80px"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
                color: 'black',
                fontWeight: isSelected ? 'bold' : 'normal',
                filter: isSelected ? '' : 'brightness(95%)',
            }}
            onClick={onClick}
        >
            <VStack align="start" spacing={0} height="100%">
                <Text fontSize="2xs" fontWeight="bold" isTruncated title={balanceItem.contract_display_name} width="100%">
                    {balanceItem.contract_ticker_symbol}
                </Text>
                <Text fontSize="2xs" isTruncated width="100%">{balanceItem.pretty_quote}</Text>
                <Tooltip 
                    label={`Protocol balance: ${protocolBalance} ${balanceItem.contract_ticker_symbol}`}
                    aria-label="Protocol balance"
                    placement="top"
                >
                    <Text fontSize="2xs" isTruncated width="100%">
                        {nominalBalance}
                    </Text>
                </Tooltip>
                {protocolDeposit && (
                    <>
                        <Box height="1px" width="100%" backgroundColor={contrastingColor} my="1px" />
                        <Box position="relative" width="100%" height="14px">
                            <Text
                                fontSize="2xs"
                                fontWeight="bold"
                                position="absolute"
                                right="0"
                                bottom="0"
                            >
                                {protocolBalance}
                            </Text>
                        </Box>
                    </>
                )}
            </VStack>
        </Box>
    );
};