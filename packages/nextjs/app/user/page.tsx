"use client";

import Link from "next/link";
import type { NextPage } from "next";

// Mock data for available bets - in a real app, this would come from your smart contract or API
const availableBets = [
  {
    id: "1",
    title: "Will Bitcoin reach $100,000 by end of 2024?",
    category: "Crypto",
    volume: "2.4M $SOMI",
    yesProbability: 65,
    noProbability: 35,
    endDate: "Dec 31, 2024",
    image: "/crypto-icon.png",
  },
  {
    id: "2",
    title: "Will the US Federal Reserve cut rates in Q1 2025?",
    category: "Economics",
    volume: "1.8M $SOMI",
    yesProbability: 72,
    noProbability: 28,
    endDate: "Mar 31, 2025",
    image: "/fed-icon.png",
  },
  {
    id: "3",
    title: "Will Tesla stock reach $300 by June 2025?",
    category: "Stocks",
    volume: "3.2M $SOMI",
    yesProbability: 45,
    noProbability: 55,
    endDate: "Jun 30, 2025",
    image: "/tesla-icon.png",
  },
  {
    id: "4",
    title: "Will there be a major AI breakthrough announced in 2025?",
    category: "Tech",
    volume: "1.5M $SOMI",
    yesProbability: 80,
    noProbability: 20,
    endDate: "Dec 31, 2025",
    image: "/ai-icon.png",
  },
  {
    id: "5",
    title: "Will the 2024 US Presidential Election be decided by less than 5% margin?",
    category: "Politics",
    volume: "5.1M $SOMI",
    yesProbability: 58,
    noProbability: 42,
    endDate: "Nov 5, 2024",
    image: "/election-icon.png",
  },
  {
    id: "6",
    title: "Will Ethereum 2.0 staking rewards exceed 5% annually?",
    category: "Crypto",
    volume: "1.2M $SOMI",
    yesProbability: 38,
    noProbability: 62,
    endDate: "Dec 31, 2024",
    image: "/eth-icon.png",
  },
];

const Market: NextPage = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Categories */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-4 overflow-x-auto">
              <span className="text-black font-semibold whitespace-nowrap">Trending</span>
              <span className="text-gray-500 hover:text-gray-900 cursor-pointer whitespace-nowrap">New</span>
              <span className="text-gray-500 hover:text-gray-900 cursor-pointer whitespace-nowrap">All</span>
              <span className="text-gray-500 hover:text-gray-900 cursor-pointer whitespace-nowrap">Politics</span>
              <span className="text-gray-500 hover:text-gray-900 cursor-pointer whitespace-nowrap">Sports</span>
              <span className="text-gray-500 hover:text-gray-900 cursor-pointer whitespace-nowrap">Crypto</span>
              <span className="text-gray-500 hover:text-gray-900 cursor-pointer whitespace-nowrap">Economics</span>
              <span className="text-gray-500 hover:text-gray-900 cursor-pointer whitespace-nowrap">Tech</span>
              <span className="text-gray-500 hover:text-gray-900 cursor-pointer whitespace-nowrap">Culture</span>
              <span className="text-gray-500 hover:text-gray-900 cursor-pointer whitespace-nowrap">World</span>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Bet Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableBets.map(bet => (
              <Link key={bet.id} href={`/user/bet/${bet.id}`}>
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {bet.category}
                    </span>
                    <span className="text-gray-500 text-sm">{bet.endDate}</span>
                  </div>

                  {/* Bet Title */}
                  <h3
                    className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2"
                    style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                  >
                    {bet.title}
                  </h3>

                  {/* Probability Bars */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Yes</span>
                      <span className="text-sm font-bold text-green-600">{bet.yesProbability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${bet.yesProbability}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">No</span>
                      <span className="text-sm font-bold text-red-600">{bet.noProbability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${bet.noProbability}%` }}></div>
                    </div>
                  </div>

                  {/* Volume and Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{bet.volume} Vol.</span>
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
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Market;
