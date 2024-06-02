
import React from "react";
import { BalanceItem } from "@covalenthq/client-sdk";
import {formatEther, parseEther, parseUnits} from "ethers";
import { Stack, Box } from "@chakra-ui/react";
import { cols } from "../const/colors"
import { ProtocolBalance } from "../lib/chainData";



interface TokenBalanceProps {
    balanceItem: BalanceItem;
    chainID: string;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({ balanceItem, chainID }) => {
    const b0 :string = balanceItem.pretty_quote;
    const b1 : string = b0.substring(0, b0.length - 1);
    let balance : string[] = b1.split(".");
    // let ofProtocolBalance = fetch(`/api/get/BALANCE/${chainID}/${balanceItem.contract_address}/0x0000000000000000000000000000000000000000`);


    
    return (

        <Box
            backgroundColor={cols.lightGrey}
            color={cols.darkGreen}
            fontWeight='semibold'
            letterSpacing='wide'
            fontSize='xs'
            paddingBlock={1}
            paddingInline={2}
            borderRadius={10}
            borderColor={cols.lightBlue}
            marginInlineEnd={0.1}
            ml=''>
        
           <p> <span className="text-sm">{balanceItem.contract_display_name}({balanceItem.contract_ticker_symbol})</span><br/>
            <span className="text-sm">{balance[0]}</span><span className="text-xs">.{balance[1]}</span></p>
            <p className="text-xs">{balanceItem.pretty_quote}</p>
    
      </Box>

    );
};
