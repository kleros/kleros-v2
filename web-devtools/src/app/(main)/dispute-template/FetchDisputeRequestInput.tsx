import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useDebounce } from "react-use";
import { type GetEventArgs } from "viem";

import { Field } from "@kleros/ui-components-library";

import { DEFAULT_CHAIN } from "consts/chains";
import { iArbitrableV2Abi } from "hooks/contracts/generated";
import { getDisputeRequestParamsFromTxn } from "utils/getDisputeRequestParamsFromTxn";
import { isUndefined } from "utils/isUndefined";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 24px;
  margin-left: 24px;
`;
const InputContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
const StyledChainInput = styled(Field)`
  width: 120px;
`;
const StyledHeader = styled.h2`
  margin-top: 24px;
`;

const StyledH3 = styled.h3`
  margin-top: 28px;
`;

const PresetsContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const StyledA = styled.a`
  cursor: pointer;
`;

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
  }, [debouncedTxnHash, chainId]);

  return (
    <Container>
      <StyledHeader>Fetch Dispute Request params from transaction</StyledHeader>
      <InputContainer>
        <Field
          value={txnHash}
          placeholder="Enter transaction hash"
          onChange={(e) => setTxnHash(e.target.value)}
          message={loading ? "fetching ..." : error || ""}
        />
        <StyledChainInput
          value={chainId}
          placeholder="Enter chain Id"
          type="number"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChainId(Number(e.target.value))}
        />
      </InputContainer>
      <StyledH3>Presets</StyledH3>
      <PresetsContainer>
        {presets.map((preset) => (
          <StyledA
            key={preset.txnHash}
            onClick={() => {
              setTxnHash(preset.txnHash);
              setChainId(preset.chainId);
            }}
          >
            {preset.title}
          </StyledA>
        ))}
      </PresetsContainer>
    </Container>
  );
};

export default FetchDisputeRequestInput;
