"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function PredictionMarketInfo() {
  // Change both instances of "PredictionMarket" to "PolyBet"
  const { data: prediction } = useScaffoldReadContract({
    contractName: "PolyBetFactory",
    functionName: "getFactoryInfo",
  });

  // const { data: owner } = useScaffoldReadContract({
  //   contractName: "PolyBetFactory",
  //   functionName: "owner",
  // });

  // if (!owner)
  //   return (
  //     <div className="card bg-base-100 w-full shadow-xl indicator">
  //       <div className="card-body">
  //         <h2 className="card-title">Prediction Market Info</h2>
  //         <p className="text-base-content">No prediction market found</p>
  //       </div>
  //     </div>
  //   );

  const question = prediction?.[0] ?? "N/A";

  return (
    <div className="card bg-base-100 w-full shadow-xl indicator">
      <div className="card-body">
        <div className="bg-base-200 py-4 px-6 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-base-content text-xl font-bold">{question}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
