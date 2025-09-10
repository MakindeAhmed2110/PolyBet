"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutPolyBet() {
  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <Image src="/polybet.png" alt="PolyBet Logo" width={32} height={32} className="w-8 h-8" />
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "PolySans Median, sans-serif" }}>
                  PolyBet
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/user" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
                  Markets
                </Link>
                <Link href="/liquidity-provider" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
                  Liquidity
                </Link>
                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium">
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: "PolySans Median, sans-serif" }}>
              About PolyBet
            </h1>
            <p
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: "PolySans Neutral, sans-serif" }}
            >
              The future of prediction markets — unified, optimized, and decentralized. PolyBet is a next-generation
              prediction market platform built on the Somnia network, enabling users to bet on real-world events with
              $SOMI tokens.
            </p>
          </div>

          {/* What is PolyBet */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: "PolySans Median, sans-serif" }}>
              What is PolyBet?
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6 leading-relaxed" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                PolyBet is a decentralized prediction market platform that allows users to create, trade, and resolve
                prediction markets on any real-world event. Built on the Somnia blockchain, PolyBet leverages smart
                contracts to ensure transparent, trustless, and automated market operations.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                Unlike traditional betting platforms, PolyBet uses a token-based system where users buy &quot;Yes&quot;
                or &quot;No&quot; tokens representing their position on future events. These tokens can be traded
                freely, creating liquid markets with real-time price discovery based on collective market sentiment.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "PolySans Median, sans-serif" }}>
              How PolyBet Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-xl">1</span>
                </div>
                <h3
                  className="text-xl font-semibold text-gray-900 mb-3"
                  style={{ fontFamily: "PolySans Median, sans-serif" }}
                >
                  Create Markets
                </h3>
                <p className="text-gray-600" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                  Anyone can create prediction markets on events like elections, sports, crypto prices, or economic
                  indicators
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-xl">2</span>
                </div>
                <h3
                  className="text-xl font-semibold text-gray-900 mb-3"
                  style={{ fontFamily: "PolySans Median, sans-serif" }}
                >
                  Trade Tokens
                </h3>
                <p className="text-gray-600" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                  Users buy Yes or No tokens using $SOMI, with prices reflecting market sentiment and probability
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-xl">3</span>
                </div>
                <h3
                  className="text-xl font-semibold text-gray-900 mb-3"
                  style={{ fontFamily: "PolySans Median, sans-serif" }}
                >
                  Resolve & Win
                </h3>
                <p className="text-gray-600" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                  When events occur, markets resolve automatically and winning tokens are redeemed for $SOMI
                </p>
              </div>
            </div>
          </section>

          {/* How to Place Bets */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "PolySans Median, sans-serif" }}>
              How to Place Bets
            </h2>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3
                    className="text-xl font-semibold text-gray-900 mb-2"
                    style={{ fontFamily: "PolySans Median, sans-serif" }}
                  >
                    Browse Available Markets
                  </h3>
                  <p className="text-gray-600 mb-4" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                    Visit the{" "}
                    <Link href="/user" className="text-blue-600 hover:text-blue-800 font-medium">
                      Markets page
                    </Link>{" "}
                    to see all available prediction markets. Each market shows the question, current probabilities,
                    trading volume, and end date.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Example:</strong> &quot;Will Bitcoin reach $100,000 by end of 2024?&quot; Current odds:
                      Yes 65%, No 35%
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3
                    className="text-xl font-semibold text-gray-900 mb-2"
                    style={{ fontFamily: "PolySans Median, sans-serif" }}
                  >
                    Select Your Position
                  </h3>
                  <p className="text-gray-600 mb-4" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                    Click on any market to view details and choose whether you want to bet &quot;Yes&quot; or
                    &quot;No&quot; on the outcome. The interface shows current probabilities and potential payouts.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Tip:</strong> Higher probability outcomes offer lower payouts but higher chances of
                      winning. Lower probability outcomes offer higher payouts but lower chances of winning.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3
                    className="text-xl font-semibold text-gray-900 mb-2"
                    style={{ fontFamily: "PolySans Median, sans-serif" }}
                  >
                    Enter Your Bet Amount
                  </h3>
                  <p className="text-gray-600 mb-4" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                    Specify how much $SOMI you want to bet. The system will show you how many tokens you&apos;ll receive
                    and what your potential payout would be if you&apos;re correct.
                  </p>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> If you&apos;re right, you&apos;ll receive 1 $SOMI token per share when
                      the market resolves. If you&apos;re wrong, your tokens become worthless.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <h3
                    className="text-xl font-semibold text-gray-900 mb-2"
                    style={{ fontFamily: "PolySans Median, sans-serif" }}
                  >
                    Confirm and Execute
                  </h3>
                  <p className="text-gray-600 mb-4" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                    Review your bet details and confirm the transaction. Your $SOMI tokens will be used to purchase Yes
                    or No tokens, which you can hold until the market resolves or trade on the secondary market.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Providing Liquidity */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "PolySans Median, sans-serif" }}>
              Providing Liquidity & Creating Markets
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3
                  className="text-2xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "PolySans Median, sans-serif" }}
                >
                  Becoming a Liquidity Provider
                </h3>
                <p className="text-gray-600 mb-4" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                  Liquidity providers are the backbone of PolyBet markets. They provide the capital that allows users to
                  trade prediction tokens, earning fees in return.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                      <strong>Earn Trading Fees:</strong> Receive 2.5% of all trading volume in your markets
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                      <strong>Lower Risk:</strong> You don&apos;t bet on outcomes, just provide liquidity
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                      <strong>Estimated Returns:</strong> 12-18% APY based on market activity
                    </p>
                  </div>
                </div>
                <Link
                  href="/liquidity-provider"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Start Providing Liquidity
                </Link>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3
                  className="text-2xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "PolySans Median, sans-serif" }}
                >
                  Creating New Markets
                </h3>
                <p className="text-gray-600 mb-4" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                  Anyone can create prediction markets on PolyBet. Market creators set the question, resolution
                  criteria, and end date.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                      <strong>Define the Question:</strong> Create clear, binary questions about future events
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                      <strong>Set Resolution Criteria:</strong> Specify how the market will be resolved
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                      <strong>Provide Initial Liquidity:</strong> Seed the market with $SOMI tokens
                    </p>
                  </div>
                </div>
                <button className="inline-block mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                  Create Market
                </button>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center bg-gray-50 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "PolySans Median, sans-serif" }}>
              Ready to Start?
            </h2>
            <p className="text-xl text-gray-600 mb-6" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
              Join the future of prediction markets and start trading on real-world events today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/user" className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-semibold">
                Browse Markets
              </Link>
              <Link
                href="/liquidity-provider"
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 font-semibold"
              >
                Provide Liquidity
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
