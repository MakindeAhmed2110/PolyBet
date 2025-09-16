"use client";

import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen smooth-gradient overflow-hidden pt-16">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Rating Section */}
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-700 font-medium">Rated 5/5 from over 700 reviews</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1
                className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight"
                style={{ fontFamily: "PolySans Median, sans-serif" }}
              >
                The Future of Prediction Markets — Unified, Optimized, Decentralized.
              </h1>
              <p
                className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
                style={{ fontFamily: "PolySans Neutral, sans-serif" }}
              >
                Experience the next generation of prediction markets with cutting-edge technology, seamless user
                experience, and decentralized infrastructure.
              </p>
            </div>

            {/* Live on Somnia Section */}
            <div className="flex items-center justify-center space-x-3 py-2">
              <span className="text-gray-700 font-medium" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                Live on
              </span>
              <Image src="/somnia.png" alt="$SOMI" width={80} height={24} className="h-6 w-auto" />
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-5">
              <Link
                href="/markets"
                className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
                style={{ fontFamily: "PolySans Neutral, sans-serif" }}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Start Trading
              </Link>
              <Link
                href="/liquidity-provider"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-gray-400 hover:bg-gray-50 transition-colors"
                style={{ fontFamily: "PolySans Neutral, sans-serif" }}
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium mb-8">Trusted by</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-gray-400 font-semibold text-lg">Outreach</div>
              <div className="text-gray-400 font-semibold text-lg">Framer</div>
              <div className="text-gray-400 font-semibold text-lg">attentive</div>
              <div className="text-gray-400 font-semibold text-lg">slack</div>
              <div className="text-gray-400 font-semibold text-lg">Pipedrive</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
