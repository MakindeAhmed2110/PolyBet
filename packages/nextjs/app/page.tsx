"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  const cryptoRef = useRef<HTMLDivElement>(null);
  const politicalRef = useRef<HTMLDivElement>(null);
  const sportsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id));
          } else {
            setVisibleSections(prev => {
              const newSet = new Set(prev);
              newSet.delete(entry.target.id);
              return newSet;
            });
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    if (cryptoRef.current) {
      cryptoRef.current.id = "crypto-section";
      observer.observe(cryptoRef.current);
    }
    if (politicalRef.current) {
      politicalRef.current.id = "political-section";
      observer.observe(politicalRef.current);
    }
    if (sportsRef.current) {
      sportsRef.current.id = "sports-section";
      observer.observe(sportsRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqData = [
    {
      question: "How do I start trading on Predikt?",
      answer:
        "Getting started is easy! Simply connect your wallet, browse available markets, and start making predictions. You can trade on crypto prices, political outcomes, sports events, and much more. No KYC required for most markets.",
      icon: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z",
      iconColor: "purple",
    },
    {
      question: "What blockchain does Predikt use?",
      answer:
        "PolyBet is built on the Somnia blockchain, which provides lightning-fast transactions and low fees. This ensures you can trade quickly and efficiently without waiting for slow confirmations or paying high gas fees.",
      icon: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z",
      iconColor: "green",
    },
    {
      question: "How do I earn rewards as a liquidity provider?",
      answer:
        "By providing liquidity to prediction markets, you earn a share of the trading fees generated. The more liquidity you provide and the longer you keep it in the market, the more rewards you earn. It's a great way to earn passive income while supporting the platform.",
      icon: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z",
      iconColor: "blue",
    },
    {
      question: "How are markets resolved automatically?",
      answer:
        "Predikt uses trusted oracles to automatically resolve markets when events occur. This ensures fair and timely payouts without any manual intervention or disputes. The oracle system is transparent and verifiable on-chain.",
      icon: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z",
      iconColor: "orange",
    },
    {
      question: "Can I create my own prediction markets?",
      answer:
        "Yes! Predikt is community-driven, and anyone can create prediction markets on topics they're passionate about. Whether it's sports, politics, crypto, or any other event, you can set up markets and invite others to participate.",
      icon: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z",
      iconColor: "purple",
    },
    {
      question: "Is my data and funds secure?",
      answer:
        "Absolutely! Predikt is fully decentralized and built on smart contracts. Your funds are secured by blockchain technology, and no central authority can freeze or manipulate your assets. You maintain full control of your wallet and data.",
      icon: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z",
      iconColor: "red",
    },
  ];

  const getIconColorClasses = (color: string) => {
    switch (color) {
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "green":
        return "bg-green-100 text-green-600";
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "orange":
        return "bg-orange-100 text-orange-600";
      case "red":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

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
                href="/user"
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

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: "PolySans Median, sans-serif" }}
            >
              Why Choose Predikt?
            </h2>
            <p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              style={{ fontFamily: "PolySans Neutral, sans-serif" }}
            >
              Built for the future of decentralized prediction markets with cutting-edge features and seamless user
              experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3
                className="text-xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "PolySans Median, sans-serif" }}
              >
                Lightning Fast
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                Built on Somnia blockchain for instant transactions and real-time market updates. No more waiting for
                slow confirmations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "PolySans Median, sans-serif" }}
              >
                Fully Decentralized
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                Your funds and data are secured by smart contracts. No central authority can freeze your assets or
                manipulate markets.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "PolySans Median, sans-serif" }}
              >
                Advanced Analytics
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                Real-time market data, probability calculations, and comprehensive trading insights to help you make
                informed decisions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "PolySans Median, sans-serif" }}
              >
                Community Driven
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                Create and participate in markets on any topic. From sports to politics, weather to crypto - the
                community decides what matters.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "PolySans Median, sans-serif" }}
              >
                Liquidity Rewards
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                Earn rewards by providing liquidity to markets. The more liquid a market, the better the trading
                experience for everyone.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "PolySans Median, sans-serif" }}
              >
                Oracle Integration
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                Automated market resolution through trusted oracles ensures fair and timely payouts without manual
                intervention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-gray-50">
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

      {/* Crypto Section */}
      <section ref={cryptoRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Crypto Image */}
            <div
              className={`order-2 lg:order-1 slide-in-left ${visibleSections.has("crypto-section") ? "visible" : ""}`}
            >
              <div className="relative">
                <Image
                  src="/cryptoreal.png"
                  alt="Crypto Trading"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-lg w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>
            </div>

            {/* Right Side - Description */}
            <div
              className={`order-1 lg:order-2 space-y-6 slide-in-right ${visibleSections.has("crypto-section") ? "visible" : ""}`}
            >
              <h2
                className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                style={{ fontFamily: "PolySans Median, sans-serif" }}
              >
                Bet on Crypto Markets,
                <br />
                <span className="text-purple-600">Win with Confidence</span>
              </h2>
              <p
                className="text-xl text-gray-600 leading-relaxed"
                style={{ fontFamily: "PolySans Neutral, sans-serif" }}
              >
                Experience the thrill of prediction markets where your insights about cryptocurrency trends can turn
                into real rewards. Join thousands of traders who trust PolyBet for fair, transparent, and lightning-fast
                crypto market predictions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/markets"
                  className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                >
                  Start Predicting Now
                </Link>
                <Link
                  href="/about_polybet"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Political Section */}
      <section ref={politicalRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Description */}
            <div
              className={`order-1 lg:order-1 space-y-6 slide-in-left ${visibleSections.has("political-section") ? "visible" : ""}`}
            >
              <h2
                className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                style={{ fontFamily: "PolySans Median, sans-serif" }}
              >
                Bet on Political Outcomes,
                <br />
                <span className="text-purple-600">Shape the Future</span>
              </h2>
              <p
                className="text-xl text-gray-600 leading-relaxed"
                style={{ fontFamily: "PolySans Neutral, sans-serif" }}
              >
                Make your voice heard in the most important decisions of our time. From elections to policy changes,
                your predictions about political events can influence outcomes while earning you rewards. Join a
                community that believes in the power of informed political discourse.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/markets"
                  className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                >
                  Start Predicting
                </Link>
                <Link
                  href="/about_polybet"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Side - Political Image */}
            <div
              className={`order-2 lg:order-2 slide-in-right ${visibleSections.has("political-section") ? "visible" : ""}`}
            >
              <div className="relative">
                <Image
                  src="/political.jpg"
                  alt="Political Trading"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-lg w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sport Section */}
      <section ref={sportsRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Sport Image */}
            <div
              className={`order-2 lg:order-1 slide-in-left ${visibleSections.has("sports-section") ? "visible" : ""}`}
            >
              <div className="relative">
                <Image
                  src="/sport.jpg"
                  alt="Sports Trading"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-lg w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>
            </div>

            {/* Right Side - Description */}
            <div
              className={`order-1 lg:order-2 space-y-6 slide-in-right ${visibleSections.has("sports-section") ? "visible" : ""}`}
            >
              <h2
                className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                style={{ fontFamily: "PolySans Median, sans-serif" }}
              >
                Bet on Football, Volleyball, Basketball e.t.c,
                <br />
                <span className="text-purple-600">Feel the Victory</span>
              </h2>
              <p
                className="text-xl text-gray-600 leading-relaxed"
                style={{ fontFamily: "PolySans Neutral, sans-serif" }}
              >
                Experience the excitement of sports like never before. From the World Cup to local leagues, your passion
                for sports can turn into profitable predictions. Join fellow sports enthusiasts who use their knowledge
                and intuition to predict outcomes across football, basketball, volleyball, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/markets"
                  className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                >
                  Start Betting
                </Link>
                <Link
                  href="/about_polybet"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: "PolySans Median, sans-serif" }}
            >
              Frequently asked questions
            </h2>
            <p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              style={{ fontFamily: "PolySans Neutral, sans-serif" }}
            >
              These are the most commonly asked questions about PolyBet. Can't find what you're looking for?
              <Link href="/contact" className="text-purple-600 hover:text-purple-700 underline">
                Chat to our friendly team!
              </Link>
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColorClasses(faq.iconColor)}`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d={faq.icon} clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-semibold text-gray-900"
                      style={{ fontFamily: "PolySans Median, sans-serif" }}
                    >
                      {faq.question}
                    </h3>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      openFAQ === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFAQ === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "PolySans Neutral, sans-serif" }}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h2
              className="text-4xl lg:text-6xl font-bold text-purple-400 mb-4"
              style={{ fontFamily: "PolySans Median, sans-serif" }}
            >
              PREDICTION MARKET MAKERS.
            </h2>
            <h3
              className="text-2xl lg:text-3xl font-semibold text-purple-400 mb-12"
              style={{ fontFamily: "PolySans Median, sans-serif" }}
            >
              STAY IN THE LOOP.
            </h3>

            <div className="max-w-md mx-auto">
              <div className="flex items-center bg-white rounded-full p-2 shadow-lg">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-6 py-4 text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none rounded-full"
                  style={{ fontFamily: "PolySans Neutral, sans-serif" }}
                />
                <button className="w-12 h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
