"use client";

export function PredictionBuySellShare({ colorScheme }: { colorScheme: string }) {
  return (
    <div>
      <h2 className={`mt-0 mb-6 text-center text-xl font-semibold text-${colorScheme}-500`}>Tokens available to buy</h2>
    </div>
  );
}
