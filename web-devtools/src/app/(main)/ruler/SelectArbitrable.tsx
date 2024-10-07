import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";

import { Address } from "viem";

import { Copiable, DropdownSelect, Field } from "@kleros/ui-components-library";

import { useRulerContext } from "context/RulerContext";
import { shortenAddress } from "utils/shortenAddress";
import { klerosCoreAddress } from "hooks/contracts/generated";
import { DEFAULT_CHAIN } from "consts/chains";
import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 16px;
  align-items: center;
  margin: 16px 0;
  padding: 8px 16px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
`;

const AddressContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const Arbitrables = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;
const StyledLabel = styled.label``;

const SelectContainer = styled.div`
  position: relative;
`;

const StyledField = styled(Field)`
  width: auto;
  ${landscapeStyle(
    () => css`
      min-width: 250px;
    `
  )}
`;

const StyledDropdown = styled(DropdownSelect)`
  position: absolute;
  z-index: 0;
  top: 40px;
  left: 0;
  width: 100%;
  > button {
    display: none;
  }
  > div {
    z-index: 1;
    width: 100%;
    > div {
      width: 100%;
    }
  }
  .simplebar-content {
    > div {
      width: 100%;
    }
  }
`;

const SelectArbitrable: React.FC = () => {
  const { arbitrable, setArbitrable, knownArbitrables } = useRulerContext();
  const ref = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // hydration workaround, local storage is inevitably going to be different, so knownArbitrables will be different
  // server and client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const items = useMemo(
    () =>
      !isClient ? [] : knownArbitrables.map((arbitrable) => ({ text: shortenAddress(arbitrable), value: arbitrable })),
    [isClient, knownArbitrables]
  );

  const openDropdown = useCallback(() => {
    if (!ref.current || knownArbitrables.length === 0) return;

    const child = ref.current.firstElementChild?.firstChild as HTMLButtonElement;
    child.click();
  }, [knownArbitrables, ref]);

  return (
    <Container>
      <AddressContainer>
        <StyledLabel>Ruler Address:</StyledLabel>
        <Copiable copiableContent={klerosCoreAddress[DEFAULT_CHAIN]} info="Ruler Address">
          <StyledLabel>{shortenAddress(klerosCoreAddress[DEFAULT_CHAIN])}</StyledLabel>
        </Copiable>
      </AddressContainer>
      <Arbitrables suppressHydrationWarning={true}>
        <StyledLabel>Arbitrable:</StyledLabel>
        <SelectContainer ref={ref}>
          <StyledDropdown defaultValue={arbitrable} items={items} callback={(val) => setArbitrable(val as Address)} />
          <StyledField
            value={arbitrable}
            placeholder="Enter Arbitrable"
            onChange={(e) => {
              setArbitrable(e.target.value as Address);
            }}
            onClick={openDropdown}
          />
        </SelectContainer>
      </Arbitrables>
    </Container>
  );
};

export default SelectArbitrable;
