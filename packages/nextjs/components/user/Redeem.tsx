"use client";

import { useState } from "react";

export function Redeem() {
  const [amount, setAmount] = useState<bigint>(BigInt(0));

  const handleRedeem = async () => {
    console.log(amount);
  };

  return (
    <div className="p-6 border-default">
      <h2 className="text-2xl font-bold text-center mb-4">Redeem Winning Tokens</h2>

      <div className="flex gap-4">
        <input
          type="number"
          placeholder="Amount to redeem"
          className="input input-bordered flex-1 dark:placeholder-white"
          onChange={e => setAmount(BigInt(e.target.value))}
        />
        <button className="btn btn-primary text-lg" onClick={handleRedeem}>
          Redeem Tokens
        </button>
      </div>
    </div>
  );
}
