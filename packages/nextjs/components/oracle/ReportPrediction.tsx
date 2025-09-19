"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useMarkets } from "~~/hooks/useMarkets";

// Get the PolyBet contract ABI from deployed contracts
const POLYBET_ABI = deployedContracts[50312].PolyBet.abi;

interface ReportPredictionProps {
  onMarketReported?: () => void;
}

export function ReportPrediction({ onMarketReported }: ReportPredictionProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get the oracle address from the factory
  const { data: factoryInfo } = useScaffoldReadContract({
    contractName: "PolyBetFactory",
    functionName: "getFactoryInfo",
  });

  const oracleAddress = factoryInfo?.[0] as string;

  // Check if current user is the oracle
  const isOracle = address && oracleAddress && address.toLowerCase() === oracleAddress.toLowerCase();

  // Fetch active markets that need oracle reporting
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

  const handleReport = useCallback(async () => {
    if (!selectedMarket || !selectedOutcome || !address) return;

    setIsLoading(true);
    try {
      // Call the report function on the PolyBet contract
      await writeContractAsync({
        address: deployedContracts[50312].PolyBet.address as `0x${string}`,
        abi: POLYBET_ABI,
        functionName: "report",
        args: [BigInt(selectedMarket), selectedOutcome === "YES" ? 0 : 1], // market ID and outcome (0 = YES, 1 = NO)
        gas: BigInt(5000000), // Set gas limit for Somnia
      });

      console.log("Market reported successfully!");

      // Update database to reflect the report
      try {
        const response = await fetch(`/api/markets/${selectedMarket}/report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            winningOutcome: selectedOutcome,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update database");
        }

        console.log("Database updated successfully");
      } catch (dbError) {
        console.error("Error updating database:", dbError);
        // Don't fail the entire operation if database update fails
      }

      alert(`Market reported: ${selectedOutcome}`);

      // Reset form
      setSelectedMarket(null);
      setSelectedOutcome(null);

      // Trigger parent component refresh
      if (onMarketReported) {
        onMarketReported();
      }
    } catch (error) {
      console.error("Error reporting market:", error);
      alert("Failed to report market. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMarket, selectedOutcome, address, writeContractAsync]);

  if (!isOracle) {
    return (
      <div className="card bg-base-100 w-full shadow-xl mt-5">
        <div className="card-body">
          <h2 className="card-title">Oracle Reporting</h2>
          <div className="alert alert-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span>Only the oracle can report market outcomes.</span>
          </div>
          <div className="text-sm text-gray-500">
            Oracle Address: {oracleAddress ? `${oracleAddress.slice(0, 6)}...${oracleAddress.slice(-4)}` : "Loading..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 w-full shadow-xl mt-5">
      <div className="card-body">
        <h2 className="card-title">Report Market Outcome</h2>

        {/* Market Selection */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Select Market to Report</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedMarket || ""}
            onChange={e => setSelectedMarket(e.target.value || null)}
          >
            <option value="">Choose a market...</option>
            {markets.map(market => (
              <option key={market.id} value={market.address}>
                {market.question}
              </option>
            ))}
          </select>
        </div>

        {/* Outcome Selection */}
        {selectedMarket && (
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Select Outcome</span>
            </label>
            <div className="flex gap-4">
              <button
                className={`btn flex-1 ${selectedOutcome === "YES" ? "btn-success" : "btn-outline"}`}
                onClick={() => setSelectedOutcome("YES")}
              >
                YES
              </button>
              <button
                className={`btn flex-1 ${selectedOutcome === "NO" ? "btn-error" : "btn-outline"}`}
                onClick={() => setSelectedOutcome("NO")}
              >
                NO
              </button>
            </div>
          </div>
        )}

        {/* Market Details */}
        {selectedMarket && (
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Market Details</h3>
            {(() => {
              const market = markets.find(m => m.address === selectedMarket);
              if (!market) return null;

              return (
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Question:</strong> {market.question}
                  </p>
                  <p>
                    <strong>Category:</strong> {market.category.name}
                  </p>
                  <p>
                    <strong>Expires:</strong> {new Date(market.expirationTime).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Initial Liquidity:</strong> {market.initialLiquidity} ETH
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Report Button */}
        <div className="card-actions justify-end">
          <button
            className={`btn btn-primary ${isLoading ? "loading" : ""}`}
            onClick={handleReport}
            disabled={!selectedMarket || !selectedOutcome || isLoading}
          >
            {isLoading ? "Reporting..." : "Report Outcome"}
          </button>
        </div>

        {/* Loading State */}
        {marketsLoading && (
          <div className="text-center py-4">
            <span className="loading loading-spinner loading-md"></span>
            <p className="text-sm text-gray-500 mt-2">Loading markets...</p>
          </div>
        )}

        {/* Error State */}
        {marketsError && (
          <div className="alert alert-error">
            <span>Error loading markets: {marketsError.message}</span>
          </div>
        )}

        {/* Empty State */}
        {!marketsLoading && !marketsError && markets.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">No active markets available for reporting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
