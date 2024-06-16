import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { Stack, Spinner, Icon } from '@chakra-ui/react';
import { SiCreatereactapp } from "react-icons/si";
import { PiCurrencyEurFill } from "react-icons/pi";
import { RiLogoutCircleRFill } from "react-icons/ri";

import { FetchedUserData, BalanceItem, ProtocolBalance, NodeState, SocialData, ActiveBalances } from '../lib/chainData';
import { AllStacks } from "../components/AllStacks";
import { cols } from "../const/colors";

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();

  const [chainBalances, setChainBalances] = useState<BalanceItem[]>([]);
  const [protocolBalances, setProtocolBalances] = useState<ActiveBalances[]>([]);
  const [userNodes, setUserNodes] = useState<NodeState[]>([]);
  const [WillBals, setWillBals] = useState<BalanceItem[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [chainID, setChainID] = useState(0);
  const [userAddr, setUserAddr] = useState("");
  const [farcasterData, setFarcasterData] = useState<SocialData>({} as SocialData);

  useEffect(() => {
    const fetchData = async () => {
      if (ready && authenticated && user) {
        let chainID = user?.wallet?.chainId?.includes(":") ? user?.wallet?.chainId?.split(":")[1] : user?.wallet?.chainId;
        let userAddr = user?.wallet?.address || "";

        if (user.farcaster && chainID === "1") chainID = "84532";

        try {
          const resWillBals = await fetch(`/api/get/WILLBALANCES/${chainID}/0x0000000000000000000000000000000000000000`);
          const willBals = await resWillBals.json();

          setUserAddr(userAddr);
          setChainID(chainID);

          const resUserData = await fetch(`/api/get/userdata/${chainID}/${userAddr}`, { cache: 'no-store' });
          const data: FetchedUserData = await resUserData.json();

          console.log("fetched data 1", data);
          console.log("fetched data 2", data.userContext.activeBalancesResponse );
          console.log("fetched data 3", data.balanceItems);
          console.log("fetched data 4", data.userContext.nodes);

          setChainBalances(data.balanceItems);
          setProtocolBalances(data.userContext.activeBalancesResponse);
          setUserNodes(data.userContext.nodes);
          setWillBals(willBals);

          console.log(userNodes);
          console.log(userNodes);

          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch data", error);
          setLoading(false);
        }
      }
    };

    if (ready && authenticated) {
      fetchData();
    } else if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, user, router]);

  return (
    <>
      <Head>
        <title>WillWe</title>
      </Head>
      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated && (
          <div className="flex flex-row px-2 py-1 justify-end m-1">
            <button
              onClick={() => { console.log("clicked Definitions button") }}
              className="text-sm text-right bg-violet-200 py-2 px-4 rounded-md text-violet-700 m-2 ease-in-out duration-300 hover:text-gray-700"
            >
              <span className="font-semibold inline-flex space-x-6 items-center"><b><SiCreatereactapp /></b> Definitions</span>
            </button>
            <button
              onClick={() => { console.log("clicked Will token button") }}
              className="text-sm text-right bg-violet-200 py-2 px-4 rounded-md text-violet-700 m-2 ease-in-out duration-300 hover:text-gray-700"
            >
              <span className="font-semibold inline-flex space-x-6 items-center"><PiCurrencyEurFill /> WILL</span>
            </button>
            <button
              onClick={logout}
              className="text-sm text-right bg-violet-200 py-2 px-4 rounded-md text-violet-700 m-2 ease-in-out duration-300 hover:text-gray-700"
            >
              <p className="user-address text-sm text-gray-500 ease-in-out duration-300 hover:text-gray-700">
                {userAddr.slice(0, 6)}...{userAddr.slice(-4)} <Icon as={RiLogoutCircleRFill} boxSize={6} color={cols.lightBlue} />
              </p>
            </button>
          </div>
        )}
        {isLoading ? (
          <Stack direction="row" spacing={4}>
            <Spinner size="lg" />
          </Stack>
        ) : (
          <div className="container mx-auto px-2">
            <AllStacks chainBalances={chainBalances} WillBals={WillBals} userNodes={userNodes} chainID={chainID.toString()} />
          </div>
        )}
      </main>
    </>
  );
}
