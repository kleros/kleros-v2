import { Field } from "@kleros/ui-components-library";
import React, { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import styled from "styled-components";
import { DEFAULT_CHAIN } from "consts/chains";
import { getDisputeRequestParamsFromTxn } from "utils/getDisputeRequestParamsFromTxn";
import { isUndefined } from "utils/index";
import { GetEventArgs } from "viem/_types/types/contract";
import { iArbitrableV2ABI } from "hooks/contracts/generated";

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

export type DisputeRequest = GetEventArgs<typeof iArbitrableV2ABI, "DisputeRequest", { IndexedOnly: false }> & {
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
      const params = await getDisputeRequestParamsFromTxn(debouncedTxnHash as `0x${string}`, chainId);
      setLoading(false);
      if (!isUndefined(params)) setParams(params);
    };
    if (debouncedTxnHash && chainId) fetchData();
  }, [debouncedTxnHash]);

  return (
    <Container>
      <StyledHeader>Fetch Dispute Request params from transaction</StyledHeader>
      <InputContainer>
        <Field
          value={txnHash}
          placeholder="Enter transaction hash"
          onChange={(e) => setTxnHash(e.target.value)}
          message={loading ? "fetching ..." : ""}
        />
        <StyledChainInput
          value={chainId}
          placeholder="Enter chain Id"
          type="number"
          onChange={(e) => setChainId(Number(e.target.value))}
        />
      </InputContainer>
    </Container>
  );
};

export default FetchDisputeRequestInput;
