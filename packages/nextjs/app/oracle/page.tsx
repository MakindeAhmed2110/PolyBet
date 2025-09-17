"use client";

import { useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { OracleAddress } from "~~/components/oracle/OracleAddress";
import { ReportPrediction } from "~~/components/oracle/ReportPrediction";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useMarkets } from "~~/hooks/useMarkets";

const Oracle: NextPage = () => {
  const { address } = useAccount();

  const { data: factory, isLoading: isFactoryLoading } = useDeployedContractInfo({
    contractName: "PolyBetFactory",
  });

  const { data: registry, isLoading: isRegistryLoading } = useDeployedContractInfo({
    contractName: "PolyBetRegistry",
  });

  const { data: markets, isLoading: isMarketsLoading } = useScaffoldReadContract({
    contractName: "PolyBetRegistry",
    functionName: "getAllMarkets",
  });

  // Get the oracle address from the factory
  const { data: factoryInfo } = useScaffoldReadContract({
    contractName: "PolyBetFactory",
    functionName: "getFactoryInfo",
  });

  const oracleAddress = factoryInfo?.[0] as string;
  const isOracle = address && oracleAddress && address.toLowerCase() === oracleAddress.toLowerCase();

  // Fetch all markets for oracle dashboard with real-time updates
  const {
    data: allMarketsData,
    isLoading: allMarketsLoading,
    error: allMarketsError,
    refetch: refetchMarkets,
    isFetching: isRefreshing,
  } = useMarkets({
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const allMarkets = allMarketsData?.markets || [];

  // Filter markets by status for oracle dashboard
  const activeMarkets = allMarkets.filter(market => market.status === "ACTIVE");
  const reportedMarkets = allMarkets.filter(market => market.status === "REPORTED");
  const resolvedMarkets = allMarkets.filter(market => market.status === "RESOLVED");

  // Track previous counts for animations
  const prevCounts = useRef({ active: 0, reported: 0, resolved: 0 });
  const [showUpdateAnimation, setShowUpdateAnimation] = useState(false);

  // Auto-refresh markets every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMarkets();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetchMarkets]);

  // Show notification when data is refreshed and detect changes
  useEffect(() => {
    if (isRefreshing && allMarketsData) {
      console.log("Markets data refreshed at:", new Date().toLocaleTimeString());
    }
  }, [isRefreshing, allMarketsData]);

  // Detect changes in market counts and show animation
  useEffect(() => {
    const currentCounts = {
      active: activeMarkets.length,
      reported: reportedMarkets.length,
      resolved: resolvedMarkets.length,
    };

    const hasChanged =
      currentCounts.active !== prevCounts.current.active ||
      currentCounts.reported !== prevCounts.current.reported ||
      currentCounts.resolved !== prevCounts.current.resolved;

    if (hasChanged && prevCounts.current.active > 0) {
      setShowUpdateAnimation(true);
      setTimeout(() => setShowUpdateAnimation(false), 2000);
    }

    prevCounts.current = currentCounts;
  }, [activeMarkets.length, reportedMarkets.length, resolvedMarkets.length]);

  // Manual refresh function
  const handleManualRefresh = () => {
    refetchMarkets();
  };

  // Get last updated time
  const lastUpdated = allMarketsData ? new Date().toLocaleTimeString() : null;

  if (isFactoryLoading || isRegistryLoading || isMarketsLoading || allMarketsLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="loading loading-spinner loading-lg"></div>
        <div className="text-lg">Loading oracle dashboard...</div>
      </div>
    );
  }

  if (!factory || !registry || !markets || markets.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="alert alert-warning max-w-md center flex justify-center">
          <span>🔮 No prediction markets available!</span>
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
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "PolySans Median, sans-serif" }}>
                  🔮 Oracle Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {isRefreshing && (
                    <div className="flex items-center space-x-1 text-xs text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  )}
                  <button
                    onClick={handleManualRefresh}
                    className="btn btn-sm btn-outline"
                    disabled={allMarketsLoading || isRefreshing}
                  >
                    {allMarketsLoading || isRefreshing ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        {allMarketsLoading ? "Loading..." : "Refreshing..."}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Refresh
                      </>
                    )}
                  </button>
                </div>
                {isOracle ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">Oracle Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600 font-medium">Not Oracle</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Oracle Status Card */}
          <div className="mb-8">
            <OracleAddress />
          </div>

          {/* Oracle Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Markets</p>
                  <p className="text-2xl font-semibold text-gray-900">{allMarkets.length}</p>
                </div>
              </div>
            </div>

            <div
              className={`bg-white rounded-lg shadow p-6 transition-all duration-500 ${
                showUpdateAnimation ? "ring-2 ring-yellow-400 bg-yellow-50" : ""
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">⏳</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Awaiting Report</p>
                  <p className="text-2xl font-semibold text-gray-900">{activeMarkets.length}</p>
                </div>
              </div>
            </div>

            <div
              className={`bg-white rounded-lg shadow p-6 transition-all duration-500 ${
                showUpdateAnimation ? "ring-2 ring-green-400 bg-green-50" : ""
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Reported</p>
                  <p className="text-2xl font-semibold text-gray-900">{reportedMarkets.length}</p>
                </div>
              </div>
            </div>

            <div
              className={`bg-white rounded-lg shadow p-6 transition-all duration-500 ${
                showUpdateAnimation ? "ring-2 ring-purple-400 bg-purple-50" : ""
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">🏁</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Resolved</p>
                  <p className="text-2xl font-semibold text-gray-900">{resolvedMarkets.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Oracle Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Report Prediction */}
            <div>
              <ReportPrediction onMarketReported={refetchMarkets} />
            </div>

            {/* Markets Overview */}
            <div>
              <div className="card bg-base-100 w-full shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="card-title">Markets Overview</h2>
                    {lastUpdated && <div className="text-xs text-gray-500">Last updated: {lastUpdated}</div>}
                  </div>

                  {/* Active Markets */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">⏳ Awaiting Oracle Report</h3>
                    {activeMarkets.length === 0 ? (
                      <p className="text-gray-500 text-sm">No markets awaiting oracle report.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeMarkets.slice(0, 3).map(market => (
                          <div key={market.id} className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">{market.question}</p>
                            <p className="text-xs text-gray-500">
                              Expires: {new Date(market.expirationTime).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                        {activeMarkets.length > 3 && (
                          <p className="text-xs text-gray-500">+{activeMarkets.length - 3} more markets</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reported Markets */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Recently Reported</h3>
                    {reportedMarkets.length === 0 ? (
                      <p className="text-gray-500 text-sm">No markets reported yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {reportedMarkets.slice(0, 3).map(market => (
                          <div key={market.id} className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">{market.question}</p>
                            <p className="text-xs text-gray-500">
                              Outcome: {market.winningOutcome} | Reported:{" "}
                              {new Date(market.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                        {reportedMarkets.length > 3 && (
                          <p className="text-xs text-gray-500">+{reportedMarkets.length - 3} more markets</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Oracle Performance */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Oracle Performance</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-600 font-medium">Report Accuracy</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {resolvedMarkets.length > 0 ? "100%" : "N/A"}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-green-600 font-medium">Response Time</p>
                        <p className="text-2xl font-bold text-green-900">
                          {reportedMarkets.length > 0 ? "< 24h" : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Oracle;
