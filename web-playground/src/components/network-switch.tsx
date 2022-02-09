import React from "react";
import styled from "styled-components";
import { useEthers, getChainById } from "@usedapp/core";
import { DropdownSelect } from "@kleros/ui-components-library";
import { useSwitchNetwork } from "../hooks/useSwitchNetwork";

const StyledDropdown = styled(DropdownSelect)`
  flex: 1;
`;

const NetworkSwitch = () => {
  const { chainId } = useEthers();
  const switchNetwork = useSwitchNetwork();
  return (
    <>
      {chainId && (
        <StyledDropdown
          simpleButton
          defaultValue={chainId}
          items={[
            { text: "Mainnet", value: 4 },
            { text: "L2", value: 421611 },
          ]}
          callback={async (value: number) => {
            const chain = getChainById(value);
            console.log(chain)
            if (chain) await switchNetwork(chain);
          }}
        />
      )}
    </>
  );
};

export default NetworkSwitch;
