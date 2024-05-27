import Portal from "../components/graphics/portal";
import { usePrivy } from "@privy-io/react-auth";
import { GetServerSideProps } from "next";
import {client} from "../const/envconst";
import { Text } from '@chakra-ui/react'
import { Heading, Stack, Grid, GridItem } from '@chakra-ui/react'


import Head from "next/head";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookieAuthToken = req.cookies["privy-token"];

  // If no cookie is found, skip any further checks
  if (!cookieAuthToken) return { props: {} };


  try {
    const claims = await client.verifyAuthToken(cookieAuthToken);
    // Use this result to pass props to a page for server rendering or to drive redirects!
    // ref https://nextjs.org/docs/pages/api-reference/functions/get-server-side-props
    console.log({ claims });

    return {
      props: {},
      redirect: { destination: "/dashboard", permanent: false },
    };
  } catch (error) {
    return { props: {} };
  }
};

export default function LoginPage() {
  const { login } = usePrivy();

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
            <b>Provably neutral</b>
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
