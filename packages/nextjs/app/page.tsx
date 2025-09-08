"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("crypto");
  const [initialLiquidity, setInitialLiquidity] = useState("0.05");
  const [probability, setProbability] = useState("50");
  const [percentageLocked, setPercentageLocked] = useState("10");
  const [expirationDays, setExpirationDays] = useState("7");

  // Get factory contract
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PolyBetFactory",
  });

  // Listen for market creation events
  const { data: marketEvents } = useScaffoldEventHistory({
    contractName: "PolyBetFactory",
    eventName: "MarketCreated",
    fromBlock: 0n,
  });

  const [createdMarkets, setCreatedMarkets] = useState<any[]>([]);

  useEffect(() => {
    if (marketEvents) {
      const formattedMarkets = marketEvents.map((event: any) => ({
        address: event.args.marketAddress,
        creator: event.args.creator,
        question: event.args.question,
        category: event.args.category,
        timestamp: new Date(Number(event.args.creationTimestamp) * 1000).toLocaleString(),
      }));
      setCreatedMarkets(formattedMarkets);
    }
  }, [marketEvents]);

  const handleCreateMarket = async () => {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    try {
      const expirationTime = Math.floor(Date.now() / 1000) + parseInt(expirationDays) * 24 * 60 * 60;

      await writeContractAsync({
        functionName: "createMarket",
        args: [
          question,
          category,
          parseEther("0.01"), // token value
          Number(probability), // probability
          Number(percentageLocked), // percentage locked
          BigInt(expirationTime), // expiration time
        ],
        value: parseEther(initialLiquidity),
      });

      alert("Market created successfully!");
      setQuestion("");
    } catch (error) {
      console.error("Error creating market:", error);
      alert("Error creating market. Check console for details.");
    }
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 max-w-4xl w-full">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold text-primary">PolyBet</span>
            <span className="block text-lg mt-2">Decentralized Prediction Markets</span>
          </h1>

          <div className="flex justify-center items-center space-x-2 flex-col mb-8">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          {/* Market Creation Form */}
          <div className="card bg-base-100 w-full shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title">Create New Prediction Market</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Question</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Will Bitcoin reach $100k by end of 2024?"
                    className="input input-bordered"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="crypto">Crypto</option>
                    <option value="sports">Sports</option>
                    <option value="politics">Politics</option>
                    <option value="tech">Tech</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Initial Liquidity (ETH)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.05"
                    className="input input-bordered"
                    value={initialLiquidity}
                    onChange={e => setInitialLiquidity(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Initial Probability (%)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    placeholder="50"
                    className="input input-bordered"
                    value={probability}
                    onChange={e => setProbability(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Liquidity Lock (%)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    placeholder="10"
                    className="input input-bordered"
                    value={percentageLocked}
                    onChange={e => setPercentageLocked(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Expiration (Days)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    placeholder="7"
                    className="input input-bordered"
                    value={expirationDays}
                    onChange={e => setExpirationDays(e.target.value)}
                  />
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" onClick={handleCreateMarket} disabled={!connectedAddress}>
                  Create Market
                </button>
              </div>
            </div>
          </div>

          {/* Created Markets Display */}
          <div className="card bg-base-100 w-full shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Recent Markets</h2>

              {createdMarkets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-lg">No markets created yet</p>
                  <p className="text-sm text-gray-500 mt-2">Create your first prediction market above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {createdMarkets.map((market, index) => (
                    <div key={index} className="border border-base-300 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{market.question}</h3>
                        <span
                          className={`badge ${
                            market.category === "crypto"
                              ? "badge-primary"
                              : market.category === "sports"
                                ? "badge-secondary"
                                : market.category === "politics"
                                  ? "badge-accent"
                                  : "badge-neutral"
                          }`}
                        >
                          {market.category}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>
                            Creator: <Address address={market.creator} format="short" />
                          </span>
                          <span>Created: {market.timestamp}</span>
                        </div>
                        <div className="text-xs">
                          <Address address={market.address} format="short" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
