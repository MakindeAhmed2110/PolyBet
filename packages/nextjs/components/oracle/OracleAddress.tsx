"use client";

import { Address } from "../scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function OracleAddress() {
  const { data: prediction } = useScaffoldReadContract({
    contractName: "PolyBetFactory",
    functionName: "getFactoryInfo",
  });

  const oracle = prediction?.[0] ?? "0x0000000000000000000000000000000000000000";

  return (
    <div className="card bg-base-100 w-full shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Oracle</h2>
        <div className="mt-4 flex justify-center">
          <Address size="xl" address={oracle as `0x${string}`} />
        </div>
      </div>
    </div>
  );
}
