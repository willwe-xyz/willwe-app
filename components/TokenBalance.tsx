import React from "react";
import { BalanceItem } from "@covalenthq/client-sdk";
import { Box, Text, VStack, Tooltip } from "@chakra-ui/react";
import { formatEther } from "ethers";

interface TokenBalanceProps {
    balanceItem: BalanceItem;
    protocolDeposit?: BalanceItem;
    isSelected: boolean;
    contrastingColor: string;
    reverseColor: string;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({
    balanceItem,
    protocolDeposit,
    isSelected,
    contrastingColor,
    reverseColor
}) => {
    const nominalBalance = parseFloat(formatEther(balanceItem.balance)).toFixed(4);
    const protocolBalance = protocolDeposit
        ? parseFloat(formatEther(protocolDeposit.balance)).toFixed(4)
        : "0.0000";

    const digits = nominalBalance.split(".")[0];
    const floats = nominalBalance.split(".")[1];

    return (
        <Box
            borderWidth={protocolDeposit ? 2 : 1}
            borderColor={contrastingColor}
            color={isSelected ? reverseColor : contrastingColor}
            backgroundColor={isSelected ? contrastingColor : 'transparent'}
            p={1}
            borderRadius="md"
            width="100%"
            height="80px"
            transition="all 0.2s"
        >
            <VStack align="start" spacing={0} height="100%">
                <Text fontSize="xs" fontWeight="bold" isTruncated title={balanceItem.contract_name} width="100%">
                    {balanceItem.contract_ticker_symbol}
                </Text>
                <Text fontSize="xs" isTruncated width="100%">{balanceItem.quote}</Text>
                <Tooltip
                    label={`Protocol balance: ${protocolBalance} ${balanceItem.contract_ticker_symbol}`}
                    aria-label="Protocol balance"
                    placement="top"
                >
                    <Text fontSize="xs" isTruncated width="100%">
                        {digits}.<Text as="span" fontSize="60%">{floats}</Text>
                    </Text>

                </Tooltip>
                {protocolDeposit && (
                    <>
                        <Box height="1px" width="100%" backgroundColor={isSelected ? reverseColor : contrastingColor} my="1px" />
                        <Box position="relative" width="100%" height="14px">
                            <Text
                                fontSize="xs"
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