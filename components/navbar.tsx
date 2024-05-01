import Image from 'next/image';
import {useRouter} from 'next/router';
import {Fragment} from 'react';
import {Disclosure, Menu, Transition} from '@headlessui/react';
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {Logo} from './logo';

function classNames(...classes: Array<string | boolean>): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * make sure you are passing router.pathname and not
 * router.asPath since we want to have stripped any
 * fragments, query params, or trailing slashes
 */
const extractTabFromPath = (path: string) => {
  return path.split('/').pop() as string;
};

export type NavbarItem = {
  id: string;
  name: string;
  resource: string;
};

type NavbarProps = {
  accountId: string;
  appName: string;
  items: Array<NavbarItem>;
};

export default function Navbar({items, accountId, appName}: NavbarProps) {
  const router = useRouter();
  const resourceId = router.query.id;
  const selected = extractTabFromPath(router.pathname);

  const selectedItemClass =
    'hover:cursor-pointer rounded-full bg-gray-900 px-3 py-2 text-lg font-medium text-white';
  const unselectedItemClass =
    'hover:cursor-pointer rounded-full px-3 py-2 text-lg font-medium text-gray-300 hover:bg-gray-700 hover:text-white';

  // Navigate to a resource sub-page:
  // /apps/:appId/settings
  // /accounts/:accountId/users
  const navigateTo = (item: NavbarItem) => {
    router.push(`/${item.resource}/${resourceId}/${item.id}`);
  };

  return (

    
  );
}
