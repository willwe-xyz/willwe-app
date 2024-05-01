import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Wallet, getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { Stack, HStack, VStack, Container, Box } from '@chakra-ui/react'
import { UserContext} from "../lib/chainData"
import { PrivyClient } from "@privy-io/server-auth";
import { useWallets } from "@privy-io/react-auth";
 


export default function DashboardPage() {
  const router = useRouter();
  const {
    ready,
    authenticated,
    user,
    logout,
    linkEmail,
    linkWallet,
    unlinkEmail,
    linkPhone,
    unlinkPhone,
    unlinkWallet,
    linkGoogle,
    unlinkGoogle,
    linkTwitter,
    unlinkTwitter,
    linkDiscord,
    unlinkDiscord,
  } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const {wallets} = useWallets();
  const chainID = wallets[0]?.chainId.includes(":") ?  wallets[0]?.chainId.split(":")[1] : wallets[0]?.chainId;
  const userAddr = wallets[0]?.address;

  const contextData = fetch(`api/get/userdata/${chainID}/${userAddr}`);
  console.log(contextData);
  

  return (
    <>
      <Head>
        <title>BagBok</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">BagBok</h1>

              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>
      
          </>
        ) : null}

<HStack spacing='24px'>
  <Box w='40px' h='40px' bg='yellow.200'>
    1
  </Box>
  <Box w='40px' h='40px' bg='tomato'>
    2
  </Box>
  <Box w='40px' h='40px' bg='pink.100'>
    3
  </Box>
</HStack>    
      </main>
    </>
  );
}
