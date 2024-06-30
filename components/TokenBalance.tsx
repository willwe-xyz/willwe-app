import React from "react";
import { BalanceItem } from "@covalenthq/client-sdk";
import { Box, Text, VStack, HStack, Tooltip } from "@chakra-ui/react";
import { formatEther } from "viem";
import { getDistinguishableColor, getReverseColor } from "../const/colors";

interface TokenBalanceProps {
    balanceItem: BalanceItem;
    protocolDeposit?: BalanceItem;
    isSelected: boolean;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({ 
    balanceItem, 
    protocolDeposit, 
    isSelected,
}) => {
    const contrastingColor = getDistinguishableColor(`#${balanceItem.contract_address.slice(2, 8)}`, '#e2e8f0');
    const reverseColor = getReverseColor(contrastingColor);

    // Format the nominal balance to exactly 4 decimal points
    const nominalBalance = parseFloat(formatEther(BigInt(balanceItem.balance))).toFixed(4);

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
        >
            <VStack align="start" spacing={0} height="100%">
                <Text fontSize="2xs" fontWeight="bold" isTruncated title={balanceItem.contract_display_name} width="100%">
                    {balanceItem.contract_ticker_symbol}
                </Text>
                <Text fontSize="2xs" isTruncated width="100%">{balanceItem.pretty_quote}</Text>
                <Text fontSize="2xs" isTruncated width="100%">
                    {nominalBalance}
                </Text>
                {protocolDeposit && (
    <>
        <Box height="1px" width="100%" backgroundColor={contrastingColor} my="1px" />
        <Box position="relative" width="100%" height="14px"> {/* Adjust height as needed */}
            <Tooltip label="Protocol wide current balance" aria-label="Protocol balance explanation">
                <Text
                    fontSize="2xs"
                    fontWeight="bold"
                    position="absolute"
                    right="0"
                    bottom="0"
                >
                    {parseFloat(formatEther(BigInt(protocolDeposit.balance))).toFixed(4)}
                </Text>
            </Tooltip>
        </Box>
    </>
)}
            </VStack>
        </Box>
    );
};