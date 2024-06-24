import React from "react";
import { BalanceItem } from "@covalenthq/client-sdk";
import { Box } from "@chakra-ui/react";
import { formatEther } from "viem";
import { getDistinguishableColor, getReverseColor } from "../const/colors";
import { ProtocolBalance } from "../lib/chainData";

interface TokenBalanceProps {
    balanceItem: BalanceItem;
    chainID: string;
    protocolDeposit?: BalanceItem;
    isSelected: boolean;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({ balanceItem, chainID, protocolDeposit, isSelected }) => {
    const b0: string = balanceItem.pretty_quote;
    const b1: string = b0.substring(0, b0.length - 1);
    const balance: string[] = b1.split(".");
    const contrastingColor: string = getDistinguishableColor(`#${balanceItem.contract_address.slice(2, 8)}`, '#e2e8f0');
    const reverseColor: string = getReverseColor(contrastingColor);

    return (
        <Box
            borderWidth={protocolDeposit ? 2 : 1}
            borderColor={contrastingColor}
            fontSize='xs'
            color={isSelected ? 'black' : contrastingColor} // Text color is contrastingColor unless selected
            backgroundColor={isSelected ? reverseColor : ''}
            paddingBlock={1}
            paddingInline={2}
            borderRadius={0}
            borderBlockEndColor={contrastingColor}
            marginInlineEnd={0.2}
            height={20}
            marginBottom={1}
            _hover={{
                color: 'black',
                fontWeight: isSelected ? 'bold' : 'normal', 
                filter: isSelected ? '' : 'brightness(99%)', 
                cursor: 'pointer',
            }}
        >
            <p title={balanceItem.contract_display_name}>
                <span className="text">{balanceItem.contract_ticker_symbol}</span><br />
                <span className="text-sm">{balance[0]}</span><span className="text-xs">.{balance[1]}</span>
            </p>
            <p className="text-xs">{balanceItem.pretty_quote}</p>

            <div className="protocolBalance">
                <hr className="h-1" color={`#${balanceItem.contract_address.slice(2, 8)}`} />
                <p className="text-xs text-[#9DA4B1]">
                    {protocolDeposit ?
                        <span>{formatEther(protocolDeposit.balance) || ''}</span>
                        : ''}
                </p>
            </div>
        </Box>
    );
};
