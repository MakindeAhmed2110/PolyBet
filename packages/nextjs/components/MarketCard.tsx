"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePublicClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { Market } from "~~/hooks/useMarkets";

// Get the PolyBet contract ABI from deployed contracts
const POLYBET_ABI = deployedContracts[50312].PolyBet.abi;

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const [yesProbability, setYesProbability] = useState(market.initialYesProbability);
  const [noProbability, setNoProbability] = useState(100 - market.initialYesProbability);
  const [isLoading, setIsLoading] = useState(true);

  const publicClient = usePublicClient();

  // Calculate current probabilities based on tokens sold
  const calculateProbabilities = useCallback(async () => {
    if (!publicClient) {
      setIsLoading(false);
      return;
    }

    try {
      const marketData = await publicClient.readContract({
        address: deployedContracts[50312].PolyBet.address as `0x${string}`,
        abi: POLYBET_ABI,
        functionName: "getPrediction",
        args: [BigInt(market.address)], // market.address is now the market ID
      });

      const yesReserve = Number(marketData[4]); // yesTokenReserve (index 4)
      const noReserve = Number(marketData[5]); // noTokenReserve (index 5)
      const totalSupply = yesReserve + noReserve;

      if (totalSupply === 0) {
        setYesProbability(50);
        setNoProbability(50);
        setIsLoading(false);
        return;
      }

      const yesTokensSold = totalSupply - yesReserve;
      const noTokensSold = totalSupply - noReserve;
      const totalTokensSold = yesTokensSold + noTokensSold;

      if (totalTokensSold === 0) {
        // If no tokens have been sold yet, use initial probability
        const initialYesProb = Number(marketData[11]); // initialProbability (index 11)
        setYesProbability(initialYesProb);
        setNoProbability(100 - initialYesProb);
      } else {
        // Calculate current probabilities based on tokens sold
        const currentYesProbability = Math.round((yesTokensSold / totalTokensSold) * 100);
        const currentNoProbability = 100 - currentYesProbability;

        setYesProbability(currentYesProbability);
        setNoProbability(currentNoProbability);
      }
    } catch (error) {
      console.error("Error fetching market probabilities:", error);
      // Fallback to initial probabilities
      setYesProbability(market.initialYesProbability);
      setNoProbability(100 - market.initialYesProbability);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, market.address]);

  // Fetch probabilities on mount
  useEffect(() => {
    calculateProbabilities();
  }, [calculateProbabilities]);

  // Poll for updates every 10 seconds
  useEffect(() => {
    if (!publicClient) return;

    const interval = setInterval(() => {
      calculateProbabilities();
    }, 10000);

    return () => clearInterval(interval);
  }, [publicClient, calculateProbabilities]);

  const expirationDate = new Date(market.expirationTime).toLocaleDateString();

  return (
    <Link href={`/markets/${market.address}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {market.category.icon || "📊"} {market.category.name}
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
        {market.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{market.description}</p>}

        {/* Probability Bars */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Yes</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-green-600">{isLoading ? "..." : `${yesProbability}%`}</span>
              {!isLoading && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${yesProbability}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">No</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-red-600">{isLoading ? "..." : `${noProbability}%`}</span>
              {!isLoading && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${noProbability}%` }}
            ></div>
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
}
