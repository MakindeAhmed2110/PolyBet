"use client";

import { useAccount } from "wagmi";

export function ResolveMarketAndWithdraw() {
  const { address } = useAccount();

  const handleWithdraw = async () => {
    console.log("withdraw");
  };

  const isLiquidityProvider = address === "0x0000000000000000000000000000000000000000";

  return (
    <div className="card bg-base-100 w-full shadow-xl indicator">
      <div className="card-body">
        {!isLiquidityProvider ? (
          <div className="max-w-6xl mx-auto bg-base-100 rounded-xl">
            <p className="text-xl font-bold text-center">❗️ Only the liquidity provider can resolve the market</p>
          </div>
        ) : (
          <div>
            <h2 className="card-title text-center mb-5 text-2xl">Resolve Market and Withdraw ETH</h2>
            <div className="flex flex-row gap-4 items-center justify-between">
              <div className="flex gap-4">
                <button className="btn btn-primary text-lg" onClick={handleWithdraw}>
                  Withdraw ETH
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
