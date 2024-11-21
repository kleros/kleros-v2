import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useDebounce } from "react-use";
import { GetEventArgs } from "viem";

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
const StyledChainInput = styled(Field as any)`
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
    title: "Escrow",
    txnHash: "0x2565b756e500240544f7fc36f938462c7efbbd2e343c57979f81fecdf1054e23",
    chainId: 421614,
  },
  {
    title: "Curated Lists",
    txnHash: "0xa7981830bf8144ab2070f3a639bd36b204c4c48ee1fafef66abaf60272418ed4",
    chainId: 421614,
  },
  {
    title: "Trump-Harris",
    txnHash: "0x86db91678cf3f8c4503e37340cf2cd93bffcba84f9c43a98c090f6a4c76d8793",
    chainId: 421614,
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
