"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useMarkets } from "~~/hooks/useMarkets";

const User: NextPage = () => {
  const { address } = useAccount();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch markets that the user has bet on
  // For now, we'll show all markets - in a real app, you'd filter by user's bets
  const {
    data: marketsData,
    isLoading: marketsLoading,
    error: marketsError,
  } = useMarkets({
    search: searchQuery || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const markets = marketsData?.markets || [];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "PolySans Median, sans-serif" }}>
                  My Bets
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/markets" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
                  Browse Markets
                </Link>
                <Link
                  href="/create-market"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Market
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Wallet Connection Check */}
          {!address ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                Connect your wallet to view your betting history and manage your positions.
              </p>
              <Link
                href="/markets"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Browse Markets
              </Link>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="mb-8">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search your bets..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {marketsLoading ? "Loading..." : `${markets.length} bets`}
                  </div>
                </div>
              </div>

              {/* Error State */}
              {marketsError && (
                <div className="text-center py-8">
                  <p className="text-red-600">Error loading your bets: {marketsError.message}</p>
                </div>
              )}

              {/* Loading State */}
              {marketsLoading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading your bets...</p>
                </div>
              )}

              {/* Empty State */}
              {!marketsLoading && !marketsError && markets.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No Bets Yet</h2>
                  <p className="text-gray-600 mb-6">
                    You haven&apos;t placed any bets yet. Start trading on prediction markets!
                  </p>
                  <Link
                    href="/markets"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Browse Markets
                  </Link>
                </div>
              )}

              {/* Bets Grid */}
              {!marketsLoading && !marketsError && markets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {markets.map(market => {
                    const yesProbability = market.initialYesProbability;
                    const noProbability = 100 - yesProbability;
                    const expirationDate = new Date(market.expirationTime).toLocaleDateString();

                    return (
                      <Link key={market.id} href={`/markets/${market.address}`}>
                        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                          {/* Category Badge */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              {market.category.icon} {market.category.name}
                            </span>
                            <span className="text-gray-500 text-sm">{expirationDate}</span>
                          </div>

                          {/* Market Question */}
                          <h3
                            className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2"
                            style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                          >
                            {market.question}
                          </h3>

                          {/* Market Description */}
                          {market.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{market.description}</p>
                          )}

                          {/* Probability Bars */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Yes</span>
                              <span className="text-sm font-bold text-green-600">{yesProbability}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${yesProbability}%` }}
                              ></div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">No</span>
                              <span className="text-sm font-bold text-red-600">{noProbability}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${noProbability}%` }}></div>
                            </div>
                          </div>

                          {/* Volume and Status */}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              <div>Vol: {parseFloat(market.totalVolume).toFixed(2)} ETH</div>
                              <div className="text-xs capitalize">{market.status.toLowerCase()}</div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded hover:bg-green-200">
                                Yes
                              </button>
                              <button className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200">
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default User;
