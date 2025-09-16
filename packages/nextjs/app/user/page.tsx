"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useCategories } from "~~/hooks/useCategories";
import { useMarkets } from "~~/hooks/useMarkets";

const Market: NextPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch markets and categories from database
  const {
    data: marketsData,
    isLoading: marketsLoading,
    error: marketsError,
  } = useMarkets({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const markets = marketsData?.markets || [];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Categories */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-4 overflow-x-auto">
              <span
                className={`whitespace-nowrap cursor-pointer ${selectedCategory === "" ? "text-black font-semibold" : "text-gray-500 hover:text-gray-900"}`}
                onClick={() => setSelectedCategory("")}
              >
                All
              </span>
              {categoriesLoading ? (
                <span className="text-gray-500">Loading categories...</span>
              ) : (
                categories?.map(category => (
                  <span
                    key={category.id}
                    className={`whitespace-nowrap cursor-pointer ${selectedCategory === category.name ? "text-black font-semibold" : "text-gray-500 hover:text-gray-900"}`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.icon} {category.name}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="text-sm text-gray-500">{marketsLoading ? "Loading..." : `${markets.length} markets`}</div>
            </div>
          </div>

          {/* Error State */}
          {marketsError && (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading markets: {marketsError.message}</p>
            </div>
          )}

          {/* Loading State */}
          {marketsLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading markets...</p>
            </div>
          )}

          {/* Empty State */}
          {!marketsLoading && !marketsError && markets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No markets found. Create your first market!</p>
              <Link
                href="/create-market"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Market
              </Link>
            </div>
          )}

          {/* Markets Grid */}
          {!marketsLoading && !marketsError && markets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {markets.map(market => {
                const yesProbability = market.initialYesProbability;
                const noProbability = 100 - yesProbability;
                const expirationDate = new Date(market.expirationTime).toLocaleDateString();

                return (
                  <Link key={market.id} href={`/user/bet/${market.address}`}>
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
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${yesProbability}%` }}></div>
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
        </div>
      </div>
    </>
  );
};

export default Market;
