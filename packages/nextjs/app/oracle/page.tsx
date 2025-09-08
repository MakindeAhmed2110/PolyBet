"use client";

import type { NextPage } from "next";
import { OracleAddress } from "~~/components/oracle/OracleAddress";
import { ReportPrediction } from "~~/components/oracle/ReportPrediction";
import Race from "~~/components/race/Race";
import { PredictionMarketInfo } from "~~/components/user/PredictionMarketInfo";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Oracle: NextPage = () => {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <OracleAddress />
            <ReportPrediction />
          </div>
          <div>
            <PredictionMarketInfo />
            <Race />
          </div>
        </div>
      </div>
    </>
  );
};

export default Oracle;
