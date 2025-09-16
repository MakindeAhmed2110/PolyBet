import { createPublicClient, decodeEventLog, http, parseAbiItem } from "viem";
import { hardhat } from "viem/chains";

// ABI for the MarketCreated event from PolyBetFactory
const MARKET_CREATED_ABI = parseAbiItem(
  "event MarketCreated(address indexed marketAddress, address indexed creator, string question, string category, uint256 initialLiquidity, uint256 creationTimestamp)",
);

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

export async function getMarketAddressFromTxHash(txHash: string): Promise<string | null> {
  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt) {
      return null;
    }

    // Parse the MarketCreated event from the transaction logs
    const marketCreatedLog = receipt.logs.find(log => {
      try {
        const decoded = decodeEventLog({
          abi: [MARKET_CREATED_ABI],
          data: log.data,
          topics: log.topics,
        });
        return decoded.eventName === "MarketCreated";
      } catch {
        return false;
      }
    });

    if (marketCreatedLog) {
      const decoded = decodeEventLog({
        abi: [MARKET_CREATED_ABI],
        data: marketCreatedLog.data,
        topics: marketCreatedLog.topics,
      });

      return decoded.args.marketAddress as string;
    }

    return null;
  } catch (error) {
    console.error("Error parsing transaction receipt:", error);
    return null;
  }
}

export async function waitForTransactionAndGetMarketAddress(txHash: string): Promise<string | null> {
  try {
    // // Wait for the transaction to be mined
    // await publicClient.waitForTransactionReceipt({
    //   hash: txHash as `0x${string}`,
    // });

    // Get the market address from the transaction
    return await getMarketAddressFromTxHash(txHash);
  } catch (error) {
    console.error("Error waiting for transaction:", error);
    return null;
  }
}
