import Portal from "../components/graphics/portal";
import { usePrivy } from "@privy-io/react-auth";
import { GetServerSideProps } from "next";
import { Text } from '@chakra-ui/react'
import { Heading, Stack, Grid, GridItem } from '@chakra-ui/react'
import Head from "next/head";
import DashboardPage from "./dashboard"


export default function LoginPage() {
  const { login, ready, authenticated} = usePrivy();

  if (!ready) return <div>Loading...</div>;

  

  if (authenticated) return <DashboardPage/>

  return (
    <>
      <Head>
        <title>WillWe · Home</title>
      </Head>

      <main className="flex min-h-screen min-w-full">
        <div className="flex bg-privy-light-blue flex-1 p-6 justify-center items-center">
          <div>
            <Stack className="flex justify-center">
            <Heading mb={4} >
              WillWe
            </Heading>
            <Text ml={1} align={"left"} fontSize={'20px'} >
            a living structure <br />that facilitates fully trustless and <br /> explainable collective efforts <br /> by means of grokable devices. <br/> 
            </Text><br />

            <Grid
  templateAreas={`"header header"
                  "nav main"
                  "nav footer"`}
  gridTemplateRows={'6px 1fr 6px'}
  gridTemplateColumns={'50px 1fr'}
  h='1px'
  gap='0'
  color='blackAlpha.700'
  fontWeight='bold'
>
  <GridItem pl='1' bg='orange.300' area={'header'}>
  </GridItem>
  <GridItem pl='1' bg='pink.300' area={'nav'}>
  </GridItem>
  <GridItem pl='1' bg='green.300'>
  </GridItem>
  <GridItem pl='1' bg='blue.300' >
  </GridItem>
</Grid>
             <br/>  
            <Text>
            <b>Evidently neutral</b>
            </Text>
            <br />
            </Stack>
            <div className="mt-6 flex justify-center text-center">
              <button
                className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg"
                onClick={login}
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
