"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";

// Get the PolyBet contract ABI from deployed contracts
const POLYBET_ABI = deployedContracts[50312].PolyBet.abi;

const MarketDetail: NextPage = () => {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const marketAddress = params.id as string;

  const [amount, setAmount] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState<"yes" | "no" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ethPrice, setEthPrice] = useState<string>("0");

  // Get the write contract hook and public client
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Read market data from the contract
  const {
    data: marketData,
    isLoading: marketLoading,
    error: marketError,
  } = useReadContract({
    address: deployedContracts[50312].PolyBet.address as `0x${string}`,
    abi: POLYBET_ABI,
    functionName: "getPrediction",
    args: [BigInt(marketAddress)], // marketAddress is now the market ID
  });

  // Debug: Log the error if it exists
  if (marketError) {
    console.error("Market data error:", marketError);
  }

  // Check market count to see if market exists
  const { data: marketCount } = useReadContract({
    address: deployedContracts[50312].PolyBet.address as `0x${string}`,
    abi: POLYBET_ABI,
    functionName: "marketCount",
  });

  // Debug: Log market count and current market ID
  if (marketCount !== undefined) {
    console.log("Total markets:", marketCount);
    console.log("Current market ID:", marketAddress);
    console.log("Market exists:", BigInt(marketAddress) < marketCount);
  }

  // State for real-time probabilities
  const [yesProbability, setYesProbability] = useState(50);
  const [noProbability, setNoProbability] = useState(50);

  // State for user token balances
  const [userYesBalance, setUserYesBalance] = useState("0");
  const [userNoBalance, setUserNoBalance] = useState("0");

  // Fetch user token balances
  const fetchUserBalances = useCallback(async () => {
    if (!address || !marketAddress || !publicClient) {
      setUserYesBalance("0");
      setUserNoBalance("0");
      return;
    }

    try {
      const userBalance = await publicClient.readContract({
        address: deployedContracts[50312].PolyBet.address as `0x${string}`,
        abi: POLYBET_ABI,
        functionName: "getUserBalance",
        args: [BigInt(marketAddress), address],
      });

      // getUserBalance returns a tuple with yesTokens and noTokens
      setUserYesBalance(formatEther(userBalance[0] as bigint));
      setUserNoBalance(formatEther(userBalance[1] as bigint));
    } catch (error) {
      console.error("Error fetching user balances:", error);
      console.error("Market ID:", marketAddress);
      console.error("User address:", address);
      setUserYesBalance("0");
      setUserNoBalance("0");
    }
  }, [address, marketAddress, publicClient]);

  // Calculate current probabilities based on tokens sold (not reserves)
  const calculateProbabilities = async () => {
    if (!marketData || !publicClient) {
      setYesProbability(50);
      setNoProbability(50);
      return;
    }

    try {
      // Get current token reserves
      const yesReserve = Number(marketData[4]); // yesTokenReserve (index 4)
      const noReserve = Number(marketData[5]); // noTokenReserve (index 5)
      //const initialTokenValue = Number(marketData[3]); // initialTokenValue (index 3)

      // Calculate total supply (this should be the same for both tokens)
      const totalSupply = yesReserve + noReserve;

      if (totalSupply === 0) {
        setYesProbability(50);
        setNoProbability(50);
        return;
      }

      // Calculate tokens sold (total supply - current reserves)
      const yesTokensSold = totalSupply - yesReserve;
      const noTokensSold = totalSupply - noReserve;
      const totalTokensSold = yesTokensSold + noTokensSold;

      if (totalTokensSold === 0) {
        // If no tokens have been sold yet, use initial probability
        const initialYesProb = Number(marketData[11]); // initialProbability (index 11)
        setYesProbability(initialYesProb);
        setNoProbability(100 - initialYesProb);
        return;
      }

      // Calculate current probabilities based on tokens sold
      const currentYesProbability = Math.round((yesTokensSold / totalTokensSold) * 100);
      const currentNoProbability = 100 - currentYesProbability;

      setYesProbability(currentYesProbability);
      setNoProbability(currentNoProbability);
    } catch (error) {
      console.error("Error calculating probabilities:", error);
      setYesProbability(50);
      setNoProbability(50);
    }
  };

  // Update probabilities when market data changes
  useEffect(() => {
    calculateProbabilities();
  }, [marketData, publicClient]);

  // Fetch user balances when address or market data changes
  useEffect(() => {
    fetchUserBalances();
  }, [fetchUserBalances]);

  // Poll for market data updates every 5 seconds to get real-time probabilities
  useEffect(() => {
    if (!marketAddress || !publicClient) return;

    const interval = setInterval(async () => {
      try {
        // Refetch market data to get updated reserves
        const updatedData = await publicClient.readContract({
          address: deployedContracts[50312].PolyBet.address as `0x${string}`,
          abi: POLYBET_ABI,
          functionName: "getPrediction",
          args: [BigInt(marketAddress)], // marketAddress is now the market ID
        });

        // Update the probabilities with fresh data
        const yesReserve = Number(updatedData[4]); // yesTokenReserve (index 4)
        const noReserve = Number(updatedData[5]); // noTokenReserve (index 5)
        const totalSupply = yesReserve + noReserve;

        if (totalSupply === 0) {
          setYesProbability(50);
          setNoProbability(50);
          return;
        }

        const yesTokensSold = totalSupply - yesReserve;
        const noTokensSold = totalSupply - noReserve;
        const totalTokensSold = yesTokensSold + noTokensSold;

        if (totalTokensSold === 0) {
          const initialYesProb = Number(updatedData[11]); // initialProbability (index 11)
          setYesProbability(initialYesProb);
          setNoProbability(100 - initialYesProb);
          return;
        }

        const currentYesProbability = Math.round((yesTokensSold / totalTokensSold) * 100);
        const currentNoProbability = 100 - currentYesProbability;

        setYesProbability(currentYesProbability);
        setNoProbability(currentNoProbability);
      } catch (error) {
        console.error("Error polling market data:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [marketAddress, publicClient]);

  // Calculate ETH price for the selected amount
  useEffect(() => {
    const calculatePrice = async () => {
      if (!amount || !selectedOutcome || !marketAddress || !publicClient) {
        setEthPrice("0");
        return;
      }

      try {
        const tokenAmount = parseEther(amount);
        const outcome = selectedOutcome === "yes" ? 0 : 1; // 0 = YES, 1 = NO

        // Call getBuyPriceInEth to get the exact ETH amount needed
        const price = await publicClient.readContract({
          address: deployedContracts[50312].PolyBet.address as `0x${string}`,
          abi: POLYBET_ABI,
          functionName: "getBuyPriceInEth",
          args: [BigInt(marketAddress), outcome, tokenAmount], // marketAddress is now the market ID
        });

        setEthPrice(formatEther(price as bigint));
      } catch (error) {
        console.error("Error calculating price:", error);
        setEthPrice("0");
      }
    };

    calculatePrice();
  }, [amount, selectedOutcome, marketAddress, publicClient]);

  const handleBuyTokens = async () => {
    if (!selectedOutcome || !amount || !address || !ethPrice || ethPrice === "0") return;

    // Validate input
    const tokenAmount = parseFloat(amount);
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
      alert("Please enter a valid token amount");
      return;
    }

    // Check if market is in correct state for trading
    if (status !== 0) {
      // 0 = Active
      alert("This market is not active for trading");
      return;
    }

    // Check if market has expired
    if (expirationTime && Number(expirationTime) * 1000 <= Date.now()) {
      alert("This market has expired");
      return;
    }

    setIsLoading(true);
    try {
      const outcome = selectedOutcome === "yes" ? 0 : 1; // 0 = YES, 1 = NO
      const tokenAmountWei = parseEther(amount);
      const ethAmountWei = parseEther(ethPrice);

      // Call the buyTokensWithETH function on the PolyBet contract
      await writeContractAsync({
        address: deployedContracts[50312].PolyBet.address as `0x${string}`,
        abi: POLYBET_ABI,
        functionName: "buyTokensWithETH",
        args: [BigInt(marketAddress), outcome, tokenAmountWei], // marketAddress is now the market ID
        value: ethAmountWei, // Use the calculated ETH price
        gas: BigInt(5000000), // Set gas limit for Somnia
      });

      console.log("Tokens purchased successfully!");
      alert("Tokens purchased successfully!");

      // Immediately refresh probabilities and balances to show the impact of the trade
      setTimeout(() => {
        calculateProbabilities();
        fetchUserBalances();
      }, 2000); // Wait 2 seconds for transaction to be mined

      // Reset form
      setAmount("");
      setSelectedOutcome(null);
    } catch (error: any) {
      console.error("Error purchasing tokens:", error);

      // Provide more specific error messages
      if (error.message?.includes("MustSendExactETHAmount")) {
        alert("Please wait for the price to be calculated and try again.");
      } else if (error.message?.includes("InsufficientTokenReserve")) {
        alert("Not enough tokens available in the market. Try a smaller amount.");
      } else if (error.message?.includes("MarketNotActive")) {
        alert("This market is not active for trading.");
      } else if (error.message?.includes("MarketExpired")) {
        alert("This market has expired.");
      } else if (error.message?.includes("OwnerCannotCall")) {
        alert("Market creators cannot trade on their own markets.");
      } else {
        alert("Failed to purchase tokens. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveMarket = async () => {
    if (!address || !marketAddress) return;

    setIsLoading(true);
    try {
      // Call the resolveMarketAndWithdraw function
      const result = await writeContractAsync({
        address: deployedContracts[50312].PolyBet.address as `0x${string}`,
        abi: POLYBET_ABI,
        functionName: "resolveMarketAndWithdraw",
        args: [BigInt(marketAddress)], // marketAddress is now the market ID
        gas: BigInt(5000000), // Set gas limit for Somnia
      });

      console.log("Market resolved successfully!", result);

      // Update database to reflect the resolution
      try {
        const response = await fetch(`/api/markets/${marketAddress}/resolve`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to update database");
        }

        console.log("Database updated successfully");
      } catch (dbError) {
        console.error("Error updating database:", dbError);
        // Don't fail the entire operation if database update fails
      }

      alert("Market resolved successfully! You have received your funds.");
    } catch (error) {
      console.error("Error resolving market:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("PredictionNotReported")) {
        alert("Market must be reported by oracle before resolution.");
      } else if (errorMessage.includes("OnlyOwner")) {
        alert("Only the market owner can resolve the market.");
      } else {
        alert("Failed to resolve market. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemTokens = async () => {
    if (!address || !marketAddress) return;

    const isWinningToken = winningOutcome === 0 ? "yes" : "no"; // 0 = YES, 1 = NO
    const winningBalance = isWinningToken === "yes" ? userYesBalance : userNoBalance;

    if (parseFloat(winningBalance) <= 0) {
      alert("You don't have any winning tokens to redeem.");
      return;
    }

    setIsLoading(true);
    try {
      // Call the redeemWinningTokens function
      const result = await writeContractAsync({
        address: deployedContracts[50312].PolyBet.address as `0x${string}`,
        abi: POLYBET_ABI,
        functionName: "redeemWinningTokens",
        args: [BigInt(marketAddress), parseEther(winningBalance)], // marketAddress is now the market ID
        gas: BigInt(5000000), // Set gas limit for Somnia
      });

      console.log("Tokens redeemed successfully!", result);
      alert(`Successfully redeemed ${winningBalance} ${isWinningToken.toUpperCase()} tokens for ETH!`);

      // Refresh user balances
      await fetchUserBalances();
    } catch (error) {
      console.error("Error redeeming tokens:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("InsufficientWinningTokens")) {
        alert("You don't have enough winning tokens to redeem.");
      } else if (errorMessage.includes("PredictionNotReported")) {
        alert("Market must be reported and resolved before token redemption.");
      } else {
        alert("Failed to redeem tokens. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (marketLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading market...</p>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Market not found</h1>
          <button
            onClick={() => router.push("/markets")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Markets
          </button>
        </div>
      </div>
    );
  }

  // Destructure the market data tuple
  const question = marketData?.[0] as string;
  const category = marketData?.[1] as string;
  const oracle = marketData?.[2] as string;
  const initialTokenValue = marketData?.[3] as bigint;
  const yesTokenReserve = marketData?.[4] as bigint;
  const noTokenReserve = marketData?.[5] as bigint;
  const isReported = marketData?.[6] as boolean;
  const winningOutcome = marketData?.[7] as number;
  const ethCollateral = marketData?.[8] as bigint;
  const lpTradingRevenue = marketData?.[9] as bigint;
  const creator = marketData?.[10] as string;
  const initialProbability = marketData?.[11] as bigint;
  const percentageLocked = marketData?.[12] as bigint;
  const expirationTime = marketData?.[13] as bigint;
  const status = marketData?.[14] as number;

  const expirationDate = expirationTime ? new Date(Number(expirationTime) * 1000).toLocaleDateString() : "N/A";
  const volume =
    ethCollateral && lpTradingRevenue
      ? parseFloat(formatEther(ethCollateral)) + parseFloat(formatEther(lpTradingRevenue))
      : 0;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button onClick={() => router.push("/markets")} className="p-2 hover:bg-gray-100 rounded-lg">
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
            {/* Left Column - Market Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {/* Category and End Date */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">{category}</span>
                  <span className="text-gray-500 text-sm">Ends {expirationDate}</span>
                </div>

                {/* Market Question */}
                <h1
                  className="text-2xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "PolySans Median, sans-serif" }}
                >
                  {question}
                </h1>

                {/* Probability Display */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Current Odds</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={calculateProbabilities}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh odds"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Live</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Yes</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">{yesProbability}%</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live probability"></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-in-out"
                      style={{ width: `${yesProbability}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">No</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-red-600">{noProbability}%</span>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Live probability"></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-red-500 h-3 rounded-full transition-all duration-500 ease-in-out"
                      style={{ width: `${noProbability}%` }}
                    ></div>
                  </div>
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Volume</p>
                    <p className="text-lg font-semibold text-gray-900">{volume.toFixed(4)} ETH</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {status === 0 ? "Active" : status === 1 ? "Reported" : status === 2 ? "Resolved" : "Expired"}
                    </p>
                  </div>
                </div>

                {/* Token Information */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Yes Token Stats */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-800">Yes Tokens</span>
                        <span className="text-xs text-green-600">Available to Buy</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Available:</span>
                          <span className="font-semibold text-green-900">
                            {marketData ? formatEther(marketData[4] as bigint) : "0"} tokens
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Your Balance:</span>
                          <span className="font-semibold text-green-900">Connected to see</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Token Address:</span>
                          <span className="font-mono text-xs text-green-600 truncate">N/A (Virtual Tokens)</span>
                        </div>
                      </div>
                    </div>

                    {/* No Token Stats */}
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-800">No Tokens</span>
                        <span className="text-xs text-red-600">Available to Buy</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-red-700">Available:</span>
                          <span className="font-semibold text-red-900">
                            {marketData ? formatEther(marketData[5] as bigint) : "0"} tokens
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-red-700">Your Balance:</span>
                          <span className="font-semibold text-red-900">Connected to see</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-red-700">Token Address:</span>
                          <span className="font-mono text-xs text-red-600 truncate">N/A (Virtual Tokens)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Details */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Initial Token Value:</span>
                      <span className="font-semibold text-gray-900">
                        {marketData ? formatEther(marketData[3] as bigint) : "0"} ETH
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Initial Yes Probability:</span>
                      <span className="font-semibold text-gray-900">{marketData ? Number(marketData[11]) : 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Percentage Locked:</span>
                      <span className="font-semibold text-gray-900">{marketData ? Number(marketData[12]) : 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ETH Collateral:</span>
                      <span className="font-semibold text-gray-900">
                        {marketData ? formatEther(marketData[8] as bigint) : "0"} ETH
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">LP Trading Revenue:</span>
                      <span className="font-semibold text-gray-900">
                        {marketData ? formatEther(marketData[9] as bigint) : "0"} ETH
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expiration:</span>
                      <span className="font-semibold text-gray-900">
                        {marketData ? new Date(Number(marketData[13]) * 1000).toLocaleString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Creator:</span>
                      <span className="font-mono text-xs text-gray-600 truncate">
                        {marketData
                          ? (marketData[10] as string).slice(0, 10) + "..." + (marketData[10] as string).slice(-8)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Oracle:</span>
                      <span className="font-mono text-xs text-gray-600 truncate">
                        {marketData
                          ? (marketData[2] as string).slice(0, 10) + "..." + (marketData[2] as string).slice(-8)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Token Balances */}
                {address && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Token Balances</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {/* Yes Token Balance */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">Your Yes Tokens</span>
                          <span className="text-xs text-green-600">Balance</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Balance:</span>
                          <span className="font-semibold text-green-900">{userYesBalance} tokens</span>
                        </div>
                      </div>

                      {/* No Token Balance */}
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-red-800">Your No Tokens</span>
                          <span className="text-xs text-red-600">Balance</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-red-700">Balance:</span>
                          <span className="font-semibold text-red-900">{userNoBalance} tokens</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                    <p className="text-gray-500">Connect your wallet to trade</p>
                  </div>
                ) : (
                  <>
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
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-bold">{yesProbability}%</span>
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
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
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600 font-bold">{noProbability}%</span>
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Token Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          placeholder="100"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 text-sm">Tokens</span>
                        </div>
                      </div>
                    </div>

                    {/* Price Display */}
                    {amount && selectedOutcome && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cost:</span>
                          <span className="font-semibold text-gray-900">
                            {ethPrice === "0" ? "Calculating..." : `${ethPrice} ETH`}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Buy Button */}
                    <button
                      onClick={handleBuyTokens}
                      disabled={!selectedOutcome || !amount || isLoading || ethPrice === "0"}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                        selectedOutcome && amount && !isLoading && ethPrice !== "0"
                          ? selectedOutcome === "yes"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isLoading
                        ? "Processing..."
                        : ethPrice === "0"
                          ? "Calculating Price..."
                          : `Buy ${selectedOutcome?.toUpperCase() || ""} Tokens`}
                    </button>

                    {/* Info */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 If you&apos;re right, you&apos;ll receive ETH when the market resolves.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Market Resolution Interface - Only for Market Owner */}
            {address && creator && address.toLowerCase() === creator.toLowerCase() && status === 1 && (
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Resolution</h2>

                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Oracle Reported Outcome</h3>
                    <p className="text-sm text-yellow-700">
                      The oracle has reported the winning outcome. You can now resolve the market and withdraw funds.
                    </p>
                  </div>

                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Resolution Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Winning Outcome:</span>
                        <span className="font-medium text-green-600">{winningOutcome === 0 ? "YES" : "NO"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ETH Collateral:</span>
                        <span className="font-medium">{formatEther(ethCollateral || 0n)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trading Revenue:</span>
                        <span className="font-medium">{formatEther(lpTradingRevenue || 0n)} ETH</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleResolveMarket}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      !isLoading
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? "Resolving..." : "Resolve Market & Withdraw"}
                  </button>

                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      💰 You&apos;ll receive your remaining collateral plus all trading fees.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Token Redemption Interface - For Resolved Markets */}
            {address && status === 2 && (userYesBalance !== "0" || userNoBalance !== "0") && (
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Redeem Winning Tokens</h2>

                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Market Resolved</h3>
                    <p className="text-sm text-green-700">
                      This market has been resolved. You can redeem your winning tokens for ETH.
                    </p>
                  </div>

                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Your Token Balances</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">YES Tokens:</span>
                        <span className="font-medium">{userYesBalance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">NO Tokens:</span>
                        <span className="font-medium">{userNoBalance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Winning Outcome:</span>
                        <span className="font-medium text-green-600">{winningOutcome === 0 ? "YES" : "NO"}</span>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const isWinningToken = winningOutcome === 0 ? "yes" : "no";
                    const winningBalance = isWinningToken === "yes" ? userYesBalance : userNoBalance;
                    const canRedeem = parseFloat(winningBalance) > 0;

                    if (!canRedeem) {
                      return (
                        <div className="text-center py-4">
                          <p className="text-gray-500">You don't have any winning tokens to redeem.</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">Redemption Value</h4>
                          <p className="text-sm text-blue-700">
                            You can redeem {winningBalance} {isWinningToken.toUpperCase()} tokens for approximately{" "}
                            {(
                              (parseFloat(winningBalance) * parseFloat(formatEther(ethCollateral || 0n))) /
                              (parseFloat(formatEther(ethCollateral || 0n)) +
                                parseFloat(formatEther(lpTradingRevenue || 0n)))
                            ).toFixed(4)}{" "}
                            ETH
                          </p>
                        </div>

                        <button
                          onClick={handleRedeemTokens}
                          disabled={isLoading}
                          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                            !isLoading
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {isLoading
                            ? "Redeeming..."
                            : `Redeem ${winningBalance} ${isWinningToken.toUpperCase()} Tokens`}
                        </button>
                      </>
                    );
                  })()}

                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      💰 Redeem your winning tokens to receive ETH based on the market outcome.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketDetail;
