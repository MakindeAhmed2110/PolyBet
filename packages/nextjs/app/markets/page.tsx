"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { MarketCard } from "~~/components/MarketCard";
import { useCategories } from "~~/hooks/useCategories";
import { useMarkets } from "~~/hooks/useMarkets";

const Markets: NextPage = () => {
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
              {markets.map(market => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Markets;
