"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { useMarkets } from "~~/hooks/useMarkets";

// ABI for the addLiquidity function
const POLYBET_ABI = [
  {
    inputs: [],
    name: "addLiquidity",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

const LiquidityProvider: NextPage = () => {
  const { address } = useAccount();
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [liquidityAmount, setLiquidityAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch markets from database
  const {
    data: marketsData,
    isLoading: marketsLoading,
    error: marketsError,
  } = useMarkets({
    status: "active", // Only show active markets
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const markets = marketsData?.markets || [];

  // Get the write contract hook
  const { writeContractAsync } = useWriteContract();

  const handleAddLiquidity = async () => {
    if (!selectedBet || !liquidityAmount || !address) return;

    // Validate input
    const amount = parseFloat(liquidityAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid liquidity amount");
      return;
    }

    setIsLoading(true);
    try {
      // Call the addLiquidity function on the selected market contract
      await writeContractAsync({
        address: selectedBet as `0x${string}`,
        abi: POLYBET_ABI,
        functionName: "addLiquidity",
        value: parseEther(liquidityAmount),
      });

      console.log("Liquidity added successfully!");
      alert("Liquidity added successfully!");

      // Reset form
      setLiquidityAmount("");
      setSelectedBet(null);
    } catch (error) {
      console.error("Error adding liquidity:", error);
      alert("Failed to add liquidity. Please check if you are the owner of this market and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/user" className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <Image src="/polybet.png" alt="PolyBet Logo" width={32} height={32} className="w-8 h-8" />
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "PolySans Median, sans-serif" }}>
                  PolyBet
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">How it works</button>
                <button className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">Log In</button>
                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "PolySans Median, sans-serif" }}>
              Liquidity Provider
            </h1>
            <p
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              style={{ fontFamily: "PolySans Neutral, sans-serif" }}
            >
              Provide liquidity to prediction markets and earn fees from trading activity. Help create liquid markets
              for better price discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Available Markets */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2
                  className="text-2xl font-bold text-gray-900 mb-6"
                  style={{ fontFamily: "PolySans Median, sans-serif" }}
                >
                  Available Markets
                </h2>

                {/* Loading State */}
                {marketsLoading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading markets...</p>
                  </div>
                )}

                {/* Error State */}
                {marketsError && (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error loading markets: {marketsError.message}</p>
                  </div>
                )}

                {/* Empty State */}
                {!marketsLoading && !marketsError && markets.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No active markets available for liquidity provision.</p>
                    <Link
                      href="/create-market"
                      className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create Market
                    </Link>
                  </div>
                )}

                {/* Wallet Not Connected */}
                {!address && !marketsLoading && !marketsError && markets.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Please connect your wallet to add liquidity to markets.</p>
                  </div>
                )}

                {/* Markets List */}
                {!marketsLoading && !marketsError && markets.length > 0 && (
                  <div className="space-y-4">
                    {markets.map(market => {
                      const yesProbability = market.initialYesProbability;
                      //const noProbability = 100 - yesProbability;
                      const expirationDate = new Date(market.expirationTime).toLocaleDateString();
                      const currentLiquidity = parseFloat(market.initialLiquidity).toFixed(2);
                      const totalVolume = parseFloat(market.totalVolume).toFixed(2);
                      const isOwner = address && market.creatorAddress?.toLowerCase() === address.toLowerCase();
                      const canAddLiquidity = isOwner;

                      return (
                        <div
                          key={market.id}
                          onClick={() => canAddLiquidity && setSelectedBet(market.address)}
                          className={`p-6 border-2 rounded-lg transition-all ${
                            canAddLiquidity
                              ? `cursor-pointer ${
                                  selectedBet === market.address
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`
                              : "border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                                  {market.category.icon} {market.category.name}
                                </span>
                                <span className="text-gray-500 text-sm">{expirationDate}</span>
                                {isOwner && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                    Your Market
                                  </span>
                                )}
                                {!canAddLiquidity && address && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                    Not Your Market
                                  </span>
                                )}
                              </div>

                              <h3
                                className="text-lg font-semibold text-gray-900 mb-3"
                                style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                              >
                                {market.question}
                              </h3>

                              {market.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{market.description}</p>
                              )}

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Volume</p>
                                  <p className="font-semibold text-gray-900">{totalVolume} ETH</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Current Liquidity</p>
                                  <p className="font-semibold text-gray-900">{currentLiquidity} ETH</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Yes Probability</p>
                                  <p className="font-semibold text-green-600">{yesProbability}%</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Status</p>
                                  <p className="font-semibold text-blue-600 capitalize">
                                    {market.status.toLowerCase()}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="ml-4">
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  selectedBet === market.address ? "border-blue-500 bg-blue-500" : "border-gray-300"
                                }`}
                              >
                                {selectedBet === market.address && (
                                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Add Liquidity Form */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-8">
                <h2
                  className="text-2xl font-bold text-gray-900 mb-6"
                  style={{ fontFamily: "PolySans Median, sans-serif" }}
                >
                  Add Liquidity
                </h2>

                {!address ? (
                  <div className="text-center py-8">
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
                    <p className="text-gray-500">Connect your wallet to add liquidity</p>
                  </div>
                ) : selectedBet ? (
                  <>
                    {/* Selected Market Info */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Selected Market</h3>
                      <p className="text-sm text-gray-600">
                        {markets.find(market => market.address === selectedBet)?.question}
                      </p>
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Your Market
                        </span>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Liquidity Amount (ETH)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={liquidityAmount}
                          onChange={e => setLiquidityAmount(e.target.value)}
                          placeholder="1000"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 text-sm">ETH</span>
                        </div>
                      </div>
                    </div>

                    {/* Liquidity Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Liquidity Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Your Contribution:</span>
                          <span className="font-medium">{liquidityAmount || "0"} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trading Fee:</span>
                          <span className="font-medium">2.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated APY:</span>
                          <span className="font-medium text-green-600">12-18%</span>
                        </div>
                      </div>
                    </div>

                    {/* Add Liquidity Button */}
                    <button
                      onClick={handleAddLiquidity}
                      disabled={!liquidityAmount || isLoading}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                        liquidityAmount && !isLoading
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isLoading ? "Adding Liquidity..." : "Add Liquidity"}
                    </button>

                    {/* Info */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 You&apos;ll earn trading fees proportional to your liquidity share. Liquidity can be
                        withdrawn after the market resolves.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-2">Select one of your markets to add liquidity</p>
                    <p className="text-sm text-gray-400">Only market creators can add liquidity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-16 bg-gray-50 rounded-xl p-8">
            <h2
              className="text-2xl font-bold text-gray-900 mb-6 text-center"
              style={{ fontFamily: "PolySans Median, sans-serif" }}
            >
              How Liquidity Providing Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Add Liquidity</h3>
                <p className="text-gray-600 text-sm">
                  Provide ETH to create liquidity pools for both Yes and No outcomes
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Earn Fees</h3>
                <p className="text-gray-600 text-sm">
                  Receive trading fees from users buying and selling tokens in your markets
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Withdraw</h3>
                <p className="text-gray-600 text-sm">
                  Withdraw your liquidity plus earned fees after the market resolves
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LiquidityProvider;
