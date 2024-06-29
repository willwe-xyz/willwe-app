import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { Stack, Spinner, Icon } from '@chakra-ui/react';
import { SiCreatereactapp } from "react-icons/si";
import { PiCurrencyEurFill } from "react-icons/pi";
import { RiLogoutCircleRFill } from "react-icons/ri";

import { FetchedUserData, BalanceItem, ProtocolBalance, NodeState, SocialData, activeBalancesResponse } from '../lib/chainData';
import {getChainById} from '../const/envconst';
import { AllStacks } from "../components/AllStacks";
import { cols } from "../const/colors";
import { Avatar } from '@coinbase/onchainkit/identity';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { Address, Chain } from "viem";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet } from "viem/chains";

export default function DashboardPage() {
  const router = useRouter();

  const queryClient = new QueryClient();
  const { ready, authenticated, user, logout } = usePrivy();


  

  if (ready && authenticated)   {
    return (
      <main>
       <Head>
         <title>WillWe</title>
       </Head>
           <div className="container mx-auto px-2">
             <AllStacks privyData={user} ready={ready} authenticated={authenticated} logout={logout} />
           </div>
       </main>
     
   );
  } else {
    return  <Spinner  />;
  }
    
    




}