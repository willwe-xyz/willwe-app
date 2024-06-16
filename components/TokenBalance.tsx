
import React from "react";
import { BalanceItem } from "@covalenthq/client-sdk";
import {ethers,  parseEther, parseUnits} from "ethers";
import { Stack, Box } from "@chakra-ui/react";
import { cols } from "../const/colors"
import { ProtocolBalance } from "../lib/chainData";
import { formatEther } from "viem";

interface TokenBalanceProps {
    balanceItem: BalanceItem;
    chainID: string;
    protocolDeposit?: BalanceItem;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({ balanceItem, chainID, protocolDeposit }) => {
    const b0 :string = balanceItem.pretty_quote;
    const b1 : string = b0.substring(0, b0.length - 1);
    let balance : string[] = b1.split(".");
    // let ofProtocolBalance = fetch(`/api/get/BALANCE/${chainID}/${balanceItem.contract_address}/0x0000000000000000000000000000000000000000`);

    
    return (
        
        <Box
            borderWidth={protocolDeposit ? 2 : 1}
            borderColor={protocolDeposit ? cols.darkBlue : cols.lightBlue}
            fontSize='xs'
            color={`#${balanceItem.contract_address.slice(2,8)}`}
            paddingBlock={1}
            paddingInline={2}
            borderRadius={0}
            marginInlineEnd={0.2}
            height={100}
            marginBottom={1}
        >
        
           <p title={balanceItem.contract_display_name} > <span className="text"> {balanceItem.contract_ticker_symbol}</span><br/>
            <span className="text-sm">{balance[0]}</span><span className="text-xs">.{balance[1]}</span></p>
            <p className="text-xs">{balanceItem.pretty_quote}</p>
            
          <div className="protocolBalance">
          <hr className="h-1" color={`#${balanceItem.contract_address.slice(2,8)}`} />

          <p className="text-xs text-[#9DA4B1]"> 
        
             {protocolDeposit ? 
            <span>  {formatEther(protocolDeposit.balance) || ''} </span> 
            : ''  }
          
          </p>
          </div>
    
      </Box>

    );
};
