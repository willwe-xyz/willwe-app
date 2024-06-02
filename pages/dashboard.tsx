import { useRouter } from "next/router";
import React, { use, useEffect, useState } from "react";
import { Wallet, getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { Stack, HStack, VStack, Container, Box, Spinner } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/react'

 
import {getAllData , ProtocolBalance, NodeState} from '../lib/chainData'
import {BalanceItem} from "@covalenthq/client-sdk";
import { parseEther } from "viem";
import { ethers } from "ethers";
import {TokenBalance} from "../components/TokenBalance";
// import { cols} from "../const/colors"
// import { RiLogoutBoxRFill } from "react-icons/ri";
import { RiLogoutCircleRFill } from "react-icons/ri";
import { color } from "framer-motion";


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
  let WB : BalanceItem[] = [];


  const [chainBalances, setChainBalances] = useState(BI);
  const [protocolBalances , setProtocolBalances] = useState(PB)
  const [userNodes , setUserNodes] = useState(NS);
  const [WillBals, setWillBals] = useState(WB);
  const [isLoading, setLoading] = useState(true)
  const [chainID, setChainID] = useState(0)
  const [userAddr, setUserAddr] = useState("")
   
  

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }

    if (ready && authenticated && user) {
      let chainID = user?.wallet?.chainId?.includes(":") ?  user?.wallet?.chainId?.split(":")[1] : user?.wallet?.chainId?.chainId;
      let userAddr = user?.wallet?.address || ""
      
      setUserAddr(userAddr);
      setChainID(chainID);



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
        

        fetch(`api/get/WILLBALANCES/${chainID}/0x0000000000000000000000000000000000000000`).then((r) => 
        r.json()).then((d) => setWillBals(d));
        

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
              <h1 className="text-2xl font-semibold"></h1>
              <button
                onClick={logout}
                className="text-sm text-right bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
              <Icon as={RiLogoutCircleRFill} boxSize={6} color={'red'} />
              </button>
            </div>
          </>
        ) : null}

        {isLoading ? (
          <Stack direction="row" spacing={4}>
            <Spinner size="lg" />
          </Stack>
        ) : (
          <HStack spacing="24px" overflow="hidden">
            {chainBalances.map((balance, index) => (
                <div className="tokenBalWrap" key={index} onClick={async () => {console.log("balance", balance)}}>
                  balanceItem, protocolBal, chainId
                <TokenBalance  balanceItem={balance}  chainID={chainID}   />
                </div> 
            ))}
          </HStack>
        )}
      </main>
    </>
  );
}
