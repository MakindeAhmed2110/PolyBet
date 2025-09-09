"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Mock data for available bets to add liquidity to
const availableBets = [
  {
    id: "1",
    title: "Will Bitcoin reach $100,000 by end of 2024?",
    category: "Crypto",
    volume: "2.4M $SOMI",
    yesProbability: 65,
    noProbability: 35,
    endDate: "Dec 31, 2024",
    currentLiquidity: "1.2M $SOMI",
    liquidityNeeded: "1.0M $SOMI",
  },
  {
    id: "2",
    title: "Will the US Federal Reserve cut rates in Q1 2025?",
    category: "Economics",
    volume: "1.8M $SOMI",
    yesProbability: 72,
    noProbability: 28,
    endDate: "Mar 31, 2025",
    currentLiquidity: "0.9M $SOMI",
    liquidityNeeded: "0.5M $SOMI",
  },
  {
    id: "3",
    title: "Will Tesla stock reach $300 by June 2025?",
    category: "Stocks",
    volume: "3.2M $SOMI",
    yesProbability: 45,
    noProbability: 55,
    endDate: "Jun 30, 2025",
    currentLiquidity: "1.6M $SOMI",
    liquidityNeeded: "0.8M $SOMI",
  },
];

const LiquidityProvider: NextPage = () => {
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [liquidityAmount, setLiquidityAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { writeContractAsync: writePredictionMarketAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarket",
  });

  const handleAddLiquidity = async () => {
    if (!selectedBet || !liquidityAmount) return;

    setIsLoading(true);
    try {
      const tokenAmount = parseEther(liquidityAmount);

      await writePredictionMarketAsync({
        functionName: "addLiquidity",
        value: tokenAmount, // addLiquidity() is payable and takes no parameters
      });

      console.log("Liquidity added successfully!");
      // Reset form
      setLiquidityAmount("");
      setSelectedBet(null);
    } catch (error) {
      console.error("Error adding liquidity:", error);
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

                <div className="space-y-4">
                  {availableBets.map(bet => (
                    <div
                      key={bet.id}
                      onClick={() => setSelectedBet(bet.id)}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedBet === bet.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                              {bet.category}
                            </span>
                            <span className="text-gray-500 text-sm">{bet.endDate}</span>
                          </div>

                          <h3
                            className="text-lg font-semibold text-gray-900 mb-3"
                            style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                          >
                            {bet.title}
                          </h3>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Volume</p>
                              <p className="font-semibold text-gray-900">{bet.volume}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Current Liquidity</p>
                              <p className="font-semibold text-gray-900">{bet.currentLiquidity}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Yes Probability</p>
                              <p className="font-semibold text-green-600">{bet.yesProbability}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Liquidity Needed</p>
                              <p className="font-semibold text-orange-600">{bet.liquidityNeeded}</p>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              selectedBet === bet.id ? "border-blue-500 bg-blue-500" : "border-gray-300"
                            }`}
                          >
                            {selectedBet === bet.id && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

                {selectedBet ? (
                  <>
                    {/* Selected Market Info */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Selected Market</h3>
                      <p className="text-sm text-gray-600">
                        {availableBets.find(bet => bet.id === selectedBet)?.title}
                      </p>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Liquidity Amount ($SOMI)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={liquidityAmount}
                          onChange={e => setLiquidityAmount(e.target.value)}
                          placeholder="1000"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Image src="/somnia.png" alt="$SOMI" width={20} height={20} className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Liquidity Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Liquidity Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Your Contribution:</span>
                          <span className="font-medium">{liquidityAmount || "0"} $SOMI</span>
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
                    <p className="text-gray-500">Select a market to add liquidity</p>
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
                  Provide $SOMI tokens to create liquidity pools for both Yes and No outcomes
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
