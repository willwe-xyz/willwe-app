import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import {  Spinner } from '@chakra-ui/react';
import { AllStacks } from "../components/AllStacks";


export default function DashboardPage() {

  const { ready, authenticated, user, logout, login } = usePrivy();


  

  if (ready)   {
    return (
      <main>
       <Head>
         <title>WillWe</title>
       </Head>
           <div className="container mx-auto px-2">
             <AllStacks privyData={user} ready={ready} authenticated={authenticated} logout={logout} login={login} />
           </div>
       </main>
     
   );
  } else {
    return  <Spinner  />;
  }
    
    




}