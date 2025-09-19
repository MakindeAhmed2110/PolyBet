import React from "react";
import Image from "next/image";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Image src="/polybet.png" alt="PolyBet Logo" width={32} height={32} className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "PolySans Median, sans-serif" }}>
                Predikt
              </span>
            </div>
            <p className="text-gray-600 mb-6 max-w-md" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
              The future of prediction markets — unified, optimized, decentralized. Built on Somnia blockchain for
              lightning-fast transactions.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/polybet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-100 hover:bg-purple-100 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 hover:text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="https://t.me/polybet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-100 hover:bg-purple-100 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 hover:text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-sm font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "PolySans Median, sans-serif" }}
            >
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/markets"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                >
                  Markets
                </Link>
              </li>
              <li>
                <Link
                  href="/liquidity-provider"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                >
                  Liquidity Provider
                </Link>
              </li>
              <li>
                <Link
                  href="/oracle"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                >
                  Oracle
                </Link>
              </li>
              <li>
                <Link
                  href="/about_polybet"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3
              className="text-sm font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "PolySans Median, sans-serif" }}
            >
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/create-market"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                >
                  Create Market
                </Link>
              </li>
              <li>
                <Link
                  href="/user"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                >
                  User Dashboard
                </Link>
              </li>
              {isLocalNetwork && (
                <>
                  <li>
                    <Faucet />
                  </li>
                  <li>
                    <Link
                      href="/blockexplorer"
                      className="text-gray-600 hover:text-purple-600 transition-colors"
                      style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                    >
                      Block Explorer
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-500 text-sm" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                © 2025 Predikt. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                Built by the Predikt team
              </p>
            </div>

            {/* Price and Theme Toggle */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {nativeCurrencyPrice > 0 && (
                <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                    ${nativeCurrencyPrice.toFixed(2)}
                  </span>
                </div>
              )}
              <SwitchTheme />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
