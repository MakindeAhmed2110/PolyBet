"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useCategories } from "~~/hooks/useCategories";
import { waitForTransactionAndGetMarketAddress } from "~~/lib/blockchain";

const CreateMarket: NextPage = () => {
  const router = useRouter();
  const { address } = useAccount();

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    categoryId: "",
    initialTokenValue: "0.01", // ETH per token
    initialYesProbability: 50,
    percentageToLock: 10,
    initialLiquidity: "0.1", // ETH
    expirationDays: 30,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get available categories from database
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Market creation hook
  const { writeContractAsync: writeFactoryAsync } = useScaffoldWriteContract({
    contractName: "PolyBet",
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = "Question is required";
    } else if (formData.question.length > 500) {
      newErrors.question = "Question must be less than 500 characters";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (parseFloat(formData.initialTokenValue) <= 0) {
      newErrors.initialTokenValue = "Token value must be greater than 0";
    }

    if (formData.initialYesProbability <= 0 || formData.initialYesProbability >= 100) {
      newErrors.initialYesProbability = "Probability must be between 1 and 99";
    }

    if (formData.percentageToLock <= 0 || formData.percentageToLock >= 100) {
      newErrors.percentageToLock = "Percentage to lock must be between 1 and 99";
    }

    if (parseFloat(formData.initialLiquidity) <= 0) {
      newErrors.initialLiquidity = "Initial liquidity must be greater than 0";
    }

    if (formData.expirationDays < 1) {
      newErrors.expirationDays = "Market must expire at least 1 day from now";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateMarket = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Calculate expiration timestamp (add extra buffer to account for block time differences)
      const expirationTime = Math.floor(Date.now() / 1000) + formData.expirationDays * 24 * 60 * 60 + 2 * 60 * 60; // Add 2 hours buffer

      // Find the category name from the selected category ID
      const selectedCategory = categories?.find(cat => cat.id === formData.categoryId);
      if (!selectedCategory) {
        alert("Please select a valid category");
        return;
      }

      // Create market on blockchain
      const txHash = await writeFactoryAsync({
        functionName: "createMarket",
        args: [
          formData.question,
          selectedCategory.name, // Use category name for smart contract
          parseEther(formData.initialTokenValue),
          formData.initialYesProbability,
          formData.percentageToLock,
          BigInt(expirationTime),
        ],
        value: parseEther(formData.initialLiquidity),
        gas: 10000000n,
      });

      // Wait for transaction and extract market address from event logs
      const marketAddress = await waitForTransactionAndGetMarketAddress(txHash || "");

      if (!marketAddress) {
        throw new Error("Failed to get market address from transaction");
      }

      // Save market to database
      const response = await fetch("/api/markets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: marketAddress,
          question: formData.question,
          categoryId: formData.categoryId,
          creatorAddress: address,
          oracleAddress: "0x76005d75bFd086Cd986f93Ca871b826daE277025", // Fixed oracle
          initialTokenValue: formData.initialTokenValue,
          initialYesProbability: formData.initialYesProbability,
          percentageToLock: formData.percentageToLock,
          expirationTime: new Date(expirationTime * 1000).toISOString(),
          initialLiquidity: formData.initialLiquidity,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save market to database");
        // Don't fail the entire operation if database save fails
      }

      // Success - redirect to markets page
      router.push("/user");
    } catch (error) {
      console.error("Error creating market:", error);
      alert("Failed to create market. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEstimatedCost = () => {
    const liquidity = parseFloat(formData.initialLiquidity) || 0;
    // const tokenValue = parseFloat(formData.initialTokenValue) || 0;
    // const lockedPercentage = formData.percentageToLock / 100;

    // Estimate gas cost (rough approximation)
    const estimatedGas = 0.01;

    return {
      liquidity,
      gas: estimatedGas,
      total: liquidity + estimatedGas,
    };
  };

  const cost = calculateEstimatedCost();

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/user" className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <Image src="/polybet.png" alt="PolyBet Logo" width={32} height={32} className="w-8 h-8" />
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "PolySans Median, sans-serif" }}>
                  Create Market
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2
                  className="text-2xl font-bold text-gray-900 mb-6"
                  style={{ fontFamily: "PolySans Median, sans-serif" }}
                >
                  Market Details
                </h2>

                <div className="space-y-6">
                  {/* Question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prediction Question *</label>
                    <textarea
                      value={formData.question}
                      onChange={e => handleInputChange("question", e.target.value)}
                      placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.question ? "border-red-300" : "border-gray-300"
                      }`}
                      rows={3}
                    />
                    {errors.question && <p className="mt-1 text-sm text-red-600">{errors.question}</p>}
                    <p className="mt-1 text-sm text-gray-500">{formData.question.length}/500 characters</p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={formData.categoryId}
                      onChange={e => handleInputChange("categoryId", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.categoryId ? "border-red-300" : "border-gray-300"
                      }`}
                      disabled={categoriesLoading}
                    >
                      <option value="">Select a category...</option>
                      {categories?.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
                    {categoriesLoading && <p className="mt-1 text-sm text-gray-500">Loading categories...</p>}
                  </div>

                  {/* Market Parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initial Token Value (ETH) *
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.initialTokenValue}
                        onChange={e => handleInputChange("initialTokenValue", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.initialTokenValue ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {errors.initialTokenValue && (
                        <p className="mt-1 text-sm text-red-600">{errors.initialTokenValue}</p>
                      )}

                      <p className="mt-1 text-sm text-gray-500">Value of each token in STT</p>

                      <p className="mt-1 text-sm text-gray-500">Value of each token in ETH</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initial Yes Probability (%) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={formData.initialYesProbability}
                        onChange={e => handleInputChange("initialYesProbability", parseInt(e.target.value))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.initialYesProbability ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {errors.initialYesProbability && (
                        <p className="mt-1 text-sm text-red-600">{errors.initialYesProbability}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">Initial probability for Yes outcome</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Percentage to Lock (%) *</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={formData.percentageToLock}
                        onChange={e => handleInputChange("percentageToLock", parseInt(e.target.value))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.percentageToLock ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {errors.percentageToLock && (
                        <p className="mt-1 text-sm text-red-600">{errors.percentageToLock}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">Percentage of tokens locked for you</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Market Duration (Days) *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.expirationDays}
                        onChange={e => handleInputChange("expirationDays", parseInt(e.target.value))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.expirationDays ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {errors.expirationDays && <p className="mt-1 text-sm text-red-600">{errors.expirationDays}</p>}
                      <p className="mt-1 text-sm text-gray-500">How long the market will be active</p>
                    </div>
                  </div>

                  {/* Initial Liquidity */}
                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">Initial Liquidity (STT) *</label>

                    <label className="block text-sm font-medium text-gray-700 mb-2">Initial Liquidity (ETH) *</label>

                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        value={formData.initialLiquidity}
                        onChange={e => handleInputChange("initialLiquidity", e.target.value)}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.initialLiquidity ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">

                        <span className="text-gray-500 text-sm">STT</span>

                        <span className="text-gray-500 text-sm">ETH</span>

                      </div>
                    </div>
                    {errors.initialLiquidity && <p className="mt-1 text-sm text-red-600">{errors.initialLiquidity}</p>}
                    <p className="mt-1 text-sm text-gray-500">Initial liquidity you&apos;ll provide to the market</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
                <h2
                  className="text-xl font-bold text-gray-900 mb-6"
                  style={{ fontFamily: "PolySans Median, sans-serif" }}
                >
                  Market Summary
                </h2>

                {/* Market Preview */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Question</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {formData.question || "Enter your prediction question..."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-medium">
                        {categories?.find(cat => cat.id === formData.categoryId)?.name || "Not selected"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{formData.expirationDays} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Yes Probability</p>
                      <p className="font-medium text-green-600">{formData.initialYesProbability}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">No Probability</p>
                      <p className="font-medium text-red-600">{100 - formData.initialYesProbability}%</p>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Initial Liquidity:</span>

                      <span className="font-medium">{cost.liquidity} STT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Gas:</span>
                      <span className="font-medium">{cost.gas} STT</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-semibold text-gray-900">{cost.total.toFixed(3)} STT</span>

                      <span className="font-medium">{cost.liquidity} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Gas:</span>
                      <span className="font-medium">{cost.gas} ETH</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-semibold text-gray-900">{cost.total.toFixed(3)} STT</span>

                    </div>
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateMarket}
                  disabled={isLoading || !address}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    !isLoading && address
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Creating Market..." : "Create Market"}
                </button>

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 You&apos;ll become the liquidity provider and earn trading fees from this market.
                  </p>
                </div>

                {!address && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">⚠️ Please connect your wallet to create a market.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateMarket;
