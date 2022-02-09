import React from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import Blockies from "react-blockies";
import { useEthers, shortenAddress, useLookupAddress } from "@usedapp/core";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

const StyledBlockies = styled(Blockies)`
  border-radius: 50%;
`;

const StyledAddress = styled.p`
  font-weight: 600;
`;

const ConnectAccount = () => {
  const { activateBrowserWallet, account } = useEthers();
  const ens = useLookupAddress();
  return (
    <>
      {account ? (
        <Wrapper>
          <StyledBlockies seed={account} />
          <StyledAddress>{ens ?? shortenAddress(account)}</StyledAddress>
        </Wrapper>
      ) : (
        <Button text="Connect" onClick={activateBrowserWallet} />
      )}
    </>
  );
};

export default ConnectAccount;
