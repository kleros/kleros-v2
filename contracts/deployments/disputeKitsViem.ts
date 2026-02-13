import { getContracts } from "./contractsViem";
import { Abi, AbiEvent, getAbiItem, PublicClient } from "viem";
import { DeploymentName } from "./utils";

export type DisputeKitContracts = ReturnType<typeof getContracts>;
export type DisputeKit =
  | NonNullable<DisputeKitContracts["disputeKitClassic"]>
  | NonNullable<DisputeKitContracts["disputeKitShutter"]>
  | NonNullable<DisputeKitContracts["disputeKitGated"]>
  | NonNullable<DisputeKitContracts["disputeKitGatedShutter"]>
  | null;
export type DisputeKitInfos = {
  address: `0x${string}`;
  contract: DisputeKit;
  isGated: boolean;
  isShutter: boolean;
};
export type DisputeKitByIds = Record<string, DisputeKitInfos>;

const fetchDisputeKits = async (client: PublicClient, klerosCoreAddress: `0x${string}`, klerosCoreAbi: Abi) => {
  const DisputeKitCreated = getAbiItem({
    abi: klerosCoreAbi,
    name: "DisputeKitCreated",
  }) as AbiEvent;
  const logs = await client.getLogs({
    address: klerosCoreAddress,
    event: DisputeKitCreated,
    fromBlock: 0n,
    toBlock: "latest",
  });
  return Object.fromEntries(
    logs
      .filter((log) => {
        const args = log.args as Record<string, unknown>;
        return "_disputeKitID" in args && "_disputeKitAddress" in args;
      })
      .map((log) => {
        const { _disputeKitID, _disputeKitAddress } = log.args as {
          _disputeKitID: bigint;
          _disputeKitAddress: string;
        };
        return {
          disputeKitID: _disputeKitID,
          disputeKitAddress: _disputeKitAddress,
        };
      })
      .map(({ disputeKitID, disputeKitAddress }) => [disputeKitID!.toString(), disputeKitAddress as `0x${string}`])
  );
};

export const getDisputeKits = async (client: PublicClient, deployment: DeploymentName): Promise<DisputeKitByIds> => {
  const { klerosCore, disputeKitClassic, disputeKitShutter, disputeKitGated, disputeKitGatedShutter } = getContracts({
    publicClient: client,
    deployment: deployment,
  });

  const isDefined = <T>(kit: T): kit is NonNullable<T> => kit != null;
  const disputeKitContracts = [disputeKitClassic, disputeKitShutter, disputeKitGated, disputeKitGatedShutter].filter(
    isDefined
  );
  const shutterEnabled = [disputeKitShutter, disputeKitGatedShutter].filter(isDefined);
  const gatedEnabled = [disputeKitGated, disputeKitGatedShutter].filter(isDefined);

  const disputeKitMap = await fetchDisputeKits(client, klerosCore.address, klerosCore.abi);

  return Object.fromEntries(
    Object.entries(disputeKitMap).map(([disputeKitID, address]) => {
      const contract =
        disputeKitContracts.find((contract) => contract.address.toLowerCase() === address.toLowerCase()) ?? null;
      return [
        disputeKitID,
        {
          address,
          contract: contract satisfies DisputeKit,
          isGated: contract
            ? gatedEnabled.some((gated) => contract.address.toLowerCase() === gated.address.toLowerCase())
            : false,
          isShutter: contract
            ? shutterEnabled.some((shutter) => contract.address.toLowerCase() === shutter.address.toLowerCase())
            : false,
        },
      ];
    })
  );
};
