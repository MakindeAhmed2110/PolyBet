"use client";

import type { NextPage } from "next";
import { AddRemoveLiquidity } from "~~/components/liquidity-provider/AddRemoveLiquidty";
import { PredictionMarketInfoLP } from "~~/components/liquidity-provider/PredictionMarketInfoLP";
import { ResolveMarketAndWithdraw } from "~~/components/liquidity-provider/ResolveMarketAndWithdraw";
import Race from "~~/components/race/Race";
import { PredictionMarketInfo } from "~~/components/user/PredictionMarketInfo";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const LiquidityProvider: NextPage = () => {
  const { data: factory, isLoading: isFactoryLoading } = useDeployedContractInfo({
    contractName: "PolyBetFactory",
  });

  const { data: registry, isLoading: isRegistryLoading } = useDeployedContractInfo({
    contractName: "PolyBetRegistry",
  });

  const { data: markets, isLoading: isMarketsLoading } = useScaffoldReadContract({
    contractName: "PolyBetRegistry",
    functionName: "getAllMarkets",
  });

  if (isFactoryLoading || isRegistryLoading || isMarketsLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="loading loading-spinner loading-lg"></div>
        <div className="text-lg">Loading prediction markets...</div>
      </div>
    );
  }

  if (!factory || !registry || !markets || markets.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="alert alert-warning max-w-md center flex justify-center">
          <span>🔮 No prediction markets available!</span>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="p-4 md:p-10">
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
          <div className="md:w-3/5">
            <div>
              <PredictionMarketInfoLP />
            </div>
            <div className="mt-6">
              <ResolveMarketAndWithdraw />
            </div>
            <div>
              <AddRemoveLiquidity />
            </div>
          </div>
          <div className="md:w-2/5">
            <div className="bg-base-100">
              <div className="">
                <div className="mb-6">
                  <PredictionMarketInfo />
                  <Race />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LiquidityProvider;
