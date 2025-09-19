"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { BanknotesIcon, ChartBarIcon, PlusIcon, UserIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Markets",
    href: "/markets",
    icon: <ChartBarIcon className="h-4 w-4" />,
  },
  {
    label: "My Bets",
    href: "/user",
    icon: <UserIcon className="h-4 w-4" />,
  },
  {
    label: "Create Market",
    href: "/create-market",
    icon: <PlusIcon className="h-4 w-4" />,
  },
  {
    label: "Liquidity Provider",
    href: "/liquidity-provider",
    icon: <BanknotesIcon className="h-4 w-4" />,
  },
  {
    label: "Oracle",
    href: "/oracle",
    icon: <ChartBarIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-blue-100 text-blue-700" : "text-gray-700"
              } hover:bg-blue-50 hover:text-blue-600 focus:!bg-blue-50 active:!text-blue-700 py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col transition-colors`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 flex items-center justify-between min-h-0 shrink-0 z-20 px-0 sm:px-2 bg-transparent">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-lg bg-white/95 backdrop-blur-sm rounded-box w-52 border border-gray-200"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <Image src="/polybet.png" alt="PolyBet Logo" width={32} height={32} className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-bold leading-tight text-gray-900">Predikt</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4">
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
