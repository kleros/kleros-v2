import React, { useEffect, useState } from "react";

import { useDebounce } from "react-use";
import { type GetEventArgs } from "viem";

import { TextField, NumberField } from "@kleros/ui-components-library";

import { DEFAULT_CHAIN } from "consts/chains";
import { iArbitrableV2Abi } from "hooks/contracts/generated";
import { getDisputeRequestParamsFromTxn } from "utils/getDisputeRequestParamsFromTxn";
import { isUndefined } from "utils/isUndefined";

// React Aria resets uncommitted input when this object's identity changes.
const NUMBER_FORMAT_OPTIONS = { useGrouping: false };

const presets = [
  {
    title: "Dispute Resolver - Compensation Claim",
    txnHash: "0x01db1d330acef1a0df007b0f9dcb56b7a88aeb49687f95cb5c58d5c36526ef70",
    chainId: 42161,
  },
];

export type DisputeRequest = GetEventArgs<typeof iArbitrableV2Abi, "DisputeRequest", { IndexedOnly: false }> & {
  _arbitrable: `0x${string}`;
};

interface IFetchDisputeRequestInput {
  setParams: (params: DisputeRequest) => void;
}

const FetchDisputeRequestInput: React.FC<IFetchDisputeRequestInput> = ({ setParams }) => {
  const [chainId, setChainId] = useState<number>(DEFAULT_CHAIN);
  const [txnHash, setTxnHash] = useState<string>("");
  const [debouncedTxnHash, setDebouncedTxnHash] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useDebounce(
    () => {
      setDebouncedTxnHash(txnHash);
    },
    1000,
    [txnHash]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = await getDisputeRequestParamsFromTxn(debouncedTxnHash as `0x${string}`, chainId);
        if (!isUndefined(params)) setParams(params);
        setError(null);
      } catch (error) {
        console.error("Error fetching dispute request params:", error);
        setError("Failed to fetch dispute request parameters");
      } finally {
        setLoading(false);
      }
    };
    if (debouncedTxnHash && chainId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTxnHash, chainId]);

  return (
    <div className="ml-6 mt-6 flex flex-col">
      <h2 className="mt-6">Fetch Dispute Request params from transaction</h2>
      <div className="flex flex-wrap gap-2">
        <TextField
          aria-label="Transaction hash"
          inputProps={{ className: "[font-family:Arial] text-[13.3333px] [line-height:normal]" }}
          value={txnHash}
          placeholder="Enter transaction hash"
          onChange={setTxnHash}
          message={loading ? "fetching ..." : error || ""}
        />
        <NumberField
          aria-label="Chain ID"
          inputProps={{ className: "[font-family:Arial] text-[13.3333px] [line-height:normal]" }}
          formatOptions={NUMBER_FORMAT_OPTIONS}
          className="w-[120px]"
          value={chainId}
          placeholder="Enter chain Id"
          onChange={(value) => setChainId(Number.isNaN(value) ? 0 : value)}
        />
      </div>
      <h3 className="mt-7">Presets</h3>
      <div className="flex flex-wrap gap-4">
        {presets.map((preset) => (
          <button
            type="button"
            className="cursor-pointer text-sm font-normal text-klerosUIComponentsPrimaryBlue [line-height:normal]"
            key={preset.txnHash}
            onClick={() => {
              setTxnHash(preset.txnHash);
              setChainId(preset.chainId);
            }}
          >
            {preset.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FetchDisputeRequestInput;
