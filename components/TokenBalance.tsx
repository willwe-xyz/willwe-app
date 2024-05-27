
import React from "react";
import { BalanceItem } from "@covalenthq/client-sdk";
import {formatEther, parseEther, parseUnits} from "ethers";
import { Stack, Box } from "@chakra-ui/react";

interface TokenBalanceProps {
    balanceItem: BalanceItem;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({ balanceItem }) => {
    const b0 :string = balanceItem.pretty_quote;
    const b1 : string = b0.substring(0, b0.length - 1);
    let balance : string[] = b1.split(".");

    
    return (

        <Box
            backgroundColor='red'
            color='gray.500'
            fontWeight='semibold'
            letterSpacing='wide'
            fontSize='xs'
            textTransform='uppercase'
            ml='2'>
        
           <p> <span className="text-sm">{balanceItem.contract_display_name}({balanceItem.contract_ticker_symbol})</span><br/>
            <span className="text-sm">{balance[0]}</span><span className="text-xs">.{balance[1]}</span></p>
    
      </Box>

    );
};
