import React, {useEffect} from 'react';
import {usePrivy} from '@privy-io/react-auth';
import Navbar from './navbar';
import type {NavbarItem} from './navbar';
import {useRouter} from 'next/router';

type Props = {
  children?: React.ReactNode;
  accountId: string;
  appName: string;
  navbarItems: Array<NavbarItem>;
};

export default function Layout({children, accountId, appName, navbarItems}: Props) {
  const {ready, authenticated} = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  return (
    <>



    </>
  );
}
