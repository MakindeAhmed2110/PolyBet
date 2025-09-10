"use client";

import { LPAddress } from "./LPAddress";

export function PredictionMarketInfoLP() {
  return (
    <div className="card bg-base-100 w-full shadow-xl indicator">
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 md:border-r md:border-b"></div>
          <div className="p-6 md:border-b">
            <LPAddress />
          </div>
          <div className="p-6 md:border-r">
            <h3 className="text-xl font-medium">Prediciton Market Collateral</h3>
            <span className="text-sm">(Amount of ETH that goes to the winning token)</span>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-medium">LP Revenue</h3>
            <span className="text-sm">(Token revenue when token gets bought/sold)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
