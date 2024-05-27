import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Wallet, getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { Stack, HStack, VStack, Container, Box, Spinner } from '@chakra-ui/react'

 
import {getAllData , ProtocolBalance, NodeState} from '../lib/chainData'
import {BalanceItem} from "@covalenthq/client-sdk";
import { parseEther } from "viem";
import {TokenBalance} from "../components/TokenBalance";



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


  let BI : BalanceItem[] = [];
  let PB  : ProtocolBalance[] = [];
  let NS : NodeState[] = [];

  const [chainBalances, setChainBalances] = useState(BI);
  const [protocolBalances , setProtocolBalances] = useState(PB)
  const [userNodes , setUserNodes] = useState(NS)

  const [isLoading, setLoading] = useState(true)
   
  

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }

    if (ready && authenticated && user) {
      let chainID = user?.wallet?.chainId?.includes(":") ?  user?.wallet?.chainId?.split(":")[1] : user?.wallet?.chainId?.chainId;
      const userAddr = user?.wallet?.address || ""
      
      if (user.farcaster && chainID == "1") chainID = "84532";
      console.log("CHAIN ID", chainID);


      fetch(`api/get/userdata/${chainID}/${userAddr}`, { cache: 'no-store' }).then((r) => 
    
        r.json()).then((d) => setChainBalances(d));
        
        getAllData(chainID, userAddr).then((data) => {
          setProtocolBalances(data.PB);
          setUserNodes(data.NodeStates);
          // console.log("dataa", data);
          console.log("usernodes", userNodes);
          console.log("protocolb", protocolBalances);
          setLoading(false);
        })

}
     
    
  }, [ready, authenticated, router]);





  return (
    <>
      <Head>
        <title>WillWe</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">WillWe</h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>
          </>
        ) : null}

        {isLoading ? (
          <Stack direction="row" spacing={4}>
            <Spinner size="xs" />
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
            <Spinner size="lg" />
            <Spinner size="md" />
            <Spinner size="sm" />
            <Spinner size="xs" />
          </Stack>
        ) : (
          <HStack spacing="24px" overflow="hidden">
            {chainBalances.map((balance, index) => (
                <TokenBalance key={index} balanceItem={balance} />
            ))}
          </HStack>
        )}
      </main>
    </>
  );
}
