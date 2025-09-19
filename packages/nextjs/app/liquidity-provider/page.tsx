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
<<<<<<< HEAD
=======
      alert("Failed to add liquidity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!selectedBet || !removeAmount || !address) return;

    // Validate input
    const amount = parseFloat(removeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount to remove");
      return;
    }

    // Check if user has enough liquidity
    const userContribution = userLiquidityContributions[selectedBet] || 0;
    if (amount > userContribution) {
      alert(`You can only remove up to ${userContribution} STT`);
      return;
    }

    setIsLoading(true);
    try {
      // Call the removeLiquidity function on the PolyBet contract
      await writeContractAsync({
        address: deployedContracts[50312].PolyBet.address as `0x${string}`,
        abi: POLYBET_ABI,
        functionName: "removeLiquidity",
        args: [BigInt(selectedBet), parseEther(removeAmount)], // market ID and amount
        gas: BigInt(5000000), // Set gas limit for Somnia
      });

      console.log("Liquidity removed successfully!");
      alert("Liquidity removed successfully!");

      // Reset form and refresh liquidity data
      setRemoveAmount("");
      setSelectedBet(null);

      // Refresh liquidity data after a short delay
      setTimeout(() => {
        fetchMarketTotalLiquidity();
        fetchUserLiquidityContributions();
      }, 2000);
    } catch (error) {
      console.error("Error removing liquidity:", error);
      alert("Failed to remove liquidity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Claim LP revenue for a specific market
  const handleClaimLPRevenue = async (marketAddress: string) => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      await writeContractAsync({
        address: deployedContracts[50312].PolyBet.address as `0x${string}`,
        abi: POLYBET_ABI,
        functionName: "claimLPRevenue",
        args: [BigInt(marketAddress)], // market ID
        gas: BigInt(5000000), // Set gas limit for Somnia
      });

      console.log("LP revenue claimed successfully!");
      alert("LP revenue claimed successfully!");

      // Refresh liquidity data after a short delay
      setTimeout(() => {
        fetchUserLiquidityContributions();
      }, 2000);
    } catch (error) {
      console.error("Error claiming LP revenue:", error);
      alert("Failed to claim LP revenue. Please try again.");
>>>>>>> 2e9faa2 (last)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white">

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

<<<<<<< HEAD
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Volume</p>
                              <p className="font-semibold text-gray-900">{bet.volume}</p>
=======
                {/* Markets List */}
                {!marketsLoading && !marketsError && markets.length > 0 && (
                  <div className="space-y-4">
                    {markets.map(market => {
                      const yesProbability = market.initialYesProbability;
                      //const noProbability = 100 - yesProbability;
                      const expirationDate = new Date(market.expirationTime).toLocaleDateString();
                      const currentLiquidity = marketTotalLiquidity[market.address]
                        ? marketTotalLiquidity[market.address].toFixed(2)
                        : parseFloat(market.initialLiquidity).toFixed(2);
                      const totalVolume = parseFloat(market.totalVolume).toFixed(2);
                      const isOwner = address && market.creatorAddress?.toLowerCase() === address.toLowerCase();
                      const userContribution = userLiquidityContributions[market.address] || 0;
                      const hasUserContribution = userContribution > 0;
                      const accumulatedRevenue = userAccumulatedRevenue[market.address] || 0;
                      const hasAccumulatedRevenue = accumulatedRevenue > 0;

                      return (
                        <div
                          key={market.id}
                          onClick={() => setSelectedBet(market.address)}
                          className={`p-6 border-2 rounded-lg transition-all cursor-pointer ${
                            selectedBet === market.address
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
                                {hasUserContribution && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                    Your Liquidity: {userContribution.toFixed(4)} STT
                                  </span>
                                )}
                                {hasAccumulatedRevenue && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                    Revenue: {accumulatedRevenue.toFixed(4)} STT
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
                                  <p className="font-semibold text-gray-900">{totalVolume} STT</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Current Liquidity</p>
                                  <p className="font-semibold text-gray-900">{currentLiquidity} STT</p>
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
>>>>>>> 2e9faa2 (last)
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
<<<<<<< HEAD
=======
                      <div className="mt-2 flex flex-wrap gap-2">
                        {markets.find(market => market.address === selectedBet)?.creatorAddress?.toLowerCase() ===
                          address?.toLowerCase() && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Your Market
                          </span>
                        )}
                        {userLiquidityContributions[selectedBet] > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            Your Liquidity: {userLiquidityContributions[selectedBet].toFixed(4)} STT
                          </span>
                        )}
                      </div>
>>>>>>> 2e9faa2 (last)
                    </div>

                    {/* Amount Input */}
                    <div className="mb-6">
<<<<<<< HEAD
                      <label className="block text-sm font-medium text-gray-700 mb-2">Liquidity Amount ($SOMI)</label>
=======
                      <label className="block text-sm font-medium text-gray-700 mb-2">Liquidity Amount (STT)</label>
>>>>>>> 2e9faa2 (last)
                      <div className="relative">
                        <input
                          type="number"
                          value={liquidityAmount}
                          onChange={e => setLiquidityAmount(e.target.value)}
                          placeholder="1000"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
<<<<<<< HEAD
                          <Image src="/somnia.png" alt="$SOMI" width={20} height={20} className="w-5 h-5" />
=======
                          <span className="text-gray-500 text-sm">STT</span>
>>>>>>> 2e9faa2 (last)
                        </div>
                      </div>
                    </div>

                    {/* Liquidity Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Liquidity Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Your Contribution:</span>
<<<<<<< HEAD
                          <span className="font-medium">{liquidityAmount || "0"} $SOMI</span>
=======
                          <span className="font-medium">{liquidityAmount || "0"} STT</span>
>>>>>>> 2e9faa2 (last)
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

<<<<<<< HEAD
=======
                    {/* Remove Liquidity Section */}
                    {userLiquidityContributions[selectedBet] > 0 && (
                      <>
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Remove Liquidity</h3>

                          {/* Remove Amount Input */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Amount to Remove (STT)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={removeAmount}
                                onChange={e => setRemoveAmount(e.target.value)}
                                placeholder="0.0"
                                max={userLiquidityContributions[selectedBet]}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-gray-500 text-sm">STT</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Max: {userLiquidityContributions[selectedBet].toFixed(4)} STT
                            </p>
                          </div>

                          {/* Remove Liquidity Button */}
                          <button
                            onClick={handleRemoveLiquidity}
                            disabled={!removeAmount || isLoading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                              removeAmount && !isLoading
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {isLoading ? "Removing..." : "Remove Liquidity"}
                          </button>
                        </div>
                      </>
                    )}

>>>>>>> 2e9faa2 (last)
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
<<<<<<< HEAD
                  Provide $SOMI tokens to create liquidity pools for both Yes and No outcomes
=======
                  Provide STT to create liquidity pools for both Yes and No outcomes
>>>>>>> 2e9faa2 (last)
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
