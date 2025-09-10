import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatEther } from "viem";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { erc20Abi } from "~~/components/constants";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";

export function TokenBalance({ tokenAddress, option }: { tokenAddress: string; option: string }) {
  const { address } = useAccount();

  const { data: balance, queryKey } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [address ?? "0x0"],
  });

  const selectedNetwork = useSelectedNetwork();
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    chainId: selectedNetwork.id,
    query: {
      enabled: true,
    },
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return (
    <>
      <div>
        <div className="">
          <h3 className="text-lg font-medium">
            My Token Balance of &quot;{option}&quot;:{" "}
            <span className="">{balance ? formatEther(balance) : "0"} tokens</span>
          </h3>
        </div>
      </div>
    </>
  );
}
