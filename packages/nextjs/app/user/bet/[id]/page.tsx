"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import type { NextPage } from "next";

// Mock data for individual bet - in a real app, this would come from your smart contract or API
const betData: { [key: string]: any } = {
  "1": {
    id: "1",
    title: "Will Bitcoin reach $100,000 by end of 2024?",
    category: "Crypto",
    volume: "2.4M $SOMI",
    yesProbability: 65,
    noProbability: 35,
    endDate: "Dec 31, 2024",
    description:
      "This market will resolve to Yes if Bitcoin reaches $100,000 or higher at any point before December 31, 2024, 11:59 PM UTC.",
    image: "/crypto-icon.png",
    totalShares: {
      yes: 1560000,
      no: 840000,
    },
  },
  "2": {
    id: "2",
    title: "Will the US Federal Reserve cut rates in Q1 2025?",
    category: "Economics",
    volume: "1.8M $SOMI",
    yesProbability: 72,
    noProbability: 28,
    endDate: "Mar 31, 2025",
    description:
      "This market will resolve to Yes if the Federal Reserve announces a rate cut during Q1 2025 (January 1 - March 31, 2025).",
    image: "/fed-icon.png",
    totalShares: {
      yes: 1296000,
      no: 504000,
    },
  },
  "3": {
    id: "3",
    title: "Will Tesla stock reach $300 by June 2025?",
    category: "Stocks",
    volume: "3.2M $SOMI",
    yesProbability: 45,
    noProbability: 55,
    endDate: "Jun 30, 2025",
    description:
      "This market will resolve to Yes if Tesla (TSLA) stock reaches $300 or higher at any point before June 30, 2025.",
    image: "/tesla-icon.png",
    totalShares: {
      yes: 1440000,
      no: 1760000,
    },
  },
};

const BetDetail: NextPage = () => {
  const params = useParams();
  const router = useRouter();
  const betId = params.id as string;
  const bet = betData[betId];

  const [amount, setAmount] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState<"yes" | "no" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyTokens = async () => {
    if (!selectedOutcome || !amount) return;

    setIsLoading(true);
    try {
      // Convert $SOMI tokens to wei (assuming 18 decimals like ETH)

      // Handle success
      console.log("Tokens purchased successfully with $SOMI!");
    } catch (error) {
      console.error("Error purchasing tokens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!bet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bet not found</h1>
          <button
            onClick={() => router.push("/user")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Markets
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button onClick={() => router.push("/user")} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <Image src="/polybet.png" alt="PolyBet Logo" width={32} height={32} className="w-8 h-8" />
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "PolySans Median, sans-serif" }}>
                  PolyBet
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Bet Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {/* Category and End Date */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                    {bet.category}
                  </span>
                  <span className="text-gray-500 text-sm">Ends {bet.endDate}</span>
                </div>

                {/* Bet Title */}
                <h1
                  className="text-2xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "PolySans Median, sans-serif" }}
                >
                  {bet.title}
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-6" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                  {bet.description}
                </p>

                {/* Probability Display */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Yes</span>
                    <span className="text-lg font-bold text-green-600">{bet.yesProbability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${bet.yesProbability}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">No</span>
                    <span className="text-lg font-bold text-red-600">{bet.noProbability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-red-500 h-3 rounded-full" style={{ width: `${bet.noProbability}%` }}></div>
                  </div>
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Volume</p>
                    <p className="text-lg font-semibold text-gray-900">{bet.volume}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Shares</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {bet.totalShares.yes.toLocaleString()} / {bet.totalShares.no.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Buy Tokens */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
                <h2
                  className="text-xl font-bold text-gray-900 mb-6"
                  style={{ fontFamily: "PolySans Median, sans-serif" }}
                >
                  Buy Tokens
                </h2>

                {/* Outcome Selection */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setSelectedOutcome("yes")}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedOutcome === "yes"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Yes</span>
                      <span className="text-green-600 font-bold">{bet.yesProbability}%</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedOutcome("no")}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedOutcome === "no" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">No</span>
                      <span className="text-red-600 font-bold">{bet.noProbability}%</span>
                    </div>
                  </button>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($SOMI)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Image src="/somnia.png" alt="$SOMI" width={20} height={20} className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Buy Button */}
                <button
                  onClick={handleBuyTokens}
                  disabled={!selectedOutcome || !amount || isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    selectedOutcome && amount && !isLoading
                      ? selectedOutcome === "yes"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Processing..." : `Buy ${selectedOutcome?.toUpperCase() || ""} Tokens`}
                </button>

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 If you&apos;re right, you&apos;ll receive 1 $SOMI token per share when the market resolves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BetDetail;
