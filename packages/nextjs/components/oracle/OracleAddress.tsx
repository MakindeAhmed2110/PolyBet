"use client";

import { Address } from "../scaffold-eth";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function OracleAddress() {
  const { address } = useAccount();

  const { data: factoryInfo } = useScaffoldReadContract({
    contractName: "PolyBetFactory",
    functionName: "getFactoryInfo",
  });

  const oracle = factoryInfo?.[0] ?? "0x0000000000000000000000000000000000000000";
  const registry = factoryInfo?.[1] ?? "0x0000000000000000000000000000000000000000";
  const polyBet = factoryInfo?.[2] ?? "0x0000000000000000000000000000000000000000";
  const marketCount = factoryInfo?.[3] ?? 0;
  const categories = factoryInfo?.[4] ?? [];

  const isOracle = address && oracle && address.toLowerCase() === oracle.toLowerCase();

  return (
    <div className="card bg-base-100 w-full shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">Oracle Information</h2>
          {isOracle ? (
            <div className="badge badge-success">You are the Oracle</div>
          ) : (
            <div className="badge badge-warning">Not Oracle</div>
          )}
        </div>

        <div className="space-y-4">
          {/* Oracle Address */}
          <div>
            <label className="text-sm font-medium text-gray-500">Oracle Address</label>
            <div className="mt-1 flex justify-center">
              <Address size="lg" address={oracle as `0x${string}`} />
            </div>
          </div>

          {/* Registry Address */}
          <div>
            <label className="text-sm font-medium text-gray-500">Registry Address</label>
            <div className="mt-1 flex justify-center">
              <Address size="lg" address={registry as `0x${string}`} />
            </div>
          </div>

          {/* Market Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Markets</p>
              <p className="text-2xl font-bold text-blue-900">{Number(marketCount)}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Categories</p>
              <p className="text-2xl font-bold text-green-900">{Array.isArray(categories) ? categories.length : 0}</p>
            </div>
          </div>

          {/* Available Categories */}
          <div>
            <label className="text-sm font-medium text-gray-500">Available Categories</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.isArray(categories) ? (
                categories.map((category: string, index: number) => (
                  <span key={index} className="badge badge-outline">
                    {category}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No categories available</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
