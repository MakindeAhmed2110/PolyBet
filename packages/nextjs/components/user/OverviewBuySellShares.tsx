"use client";

import { PredictionBuySellShare } from "~~/components/user/PredictionBuySellShare";

export function OverviewBuySellShares() {
  return (
    <div className="card bg-base-100 w-full shadow-xl indicator">
      <div className="card-body">
        <div role="tablist" className="tabs tabs-lg">
          <input
            type="radio"
            name="token_tabs"
            role="tab"
            className="tab font-lexend font-semibold text-green-500 min-w-40 rounded-tl-md rounded-tr-md bg-base-300 checked:bg-green-500 checked:text-white"
            aria-label={`"Yes" Token`}
            defaultChecked
          />
          <div role="tabpanel" className="tab-content border-l-0">
            <div className="rounded-bl-lg rounded-br-lg p-4 border-4 border-green-500">
              <PredictionBuySellShare colorScheme="green" />
            </div>
          </div>

          <input
            type="radio"
            name="token_tabs"
            role="tab"
            className="tab font-lexend font-semibold text-red-500 min-w-40 rounded-md bg-base-300 checked:bg-red-500 checked:text-white ml-4"
            aria-label={`"No" Token`}
          />
          <div role="tabpanel" className="tab-content border-l-0">
            <div className="rounded-bl-lg rounded-br-lg p-4 border-4 border-red-500">
              <PredictionBuySellShare colorScheme="red" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
