import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import { Address } from "viem";

import { DropdownSelect, Field } from "@kleros/ui-components-library";

import { useRulerContext } from "context/RulerContext";
import { shortenAddress } from "utils/shortenAddress";

const Arbitrables = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  padding: 8px 16px;
  border-radius: 3px;
`;
const StyledLabel = styled.label``;

const SelectContainer = styled.div`
  position: relative;
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
    <Arbitrables suppressHydrationWarning={true}>
      <StyledLabel>Arbitrable:</StyledLabel>
      <SelectContainer ref={ref}>
        <StyledDropdown defaultValue={arbitrable} items={items} callback={(val) => setArbitrable(val as Address)} />
        <Field
          value={arbitrable}
          placeholder="Enter Arbitrable"
          onChange={(e) => {
            setArbitrable(e.target.value as Address);
          }}
          onClick={openDropdown}
        />
      </SelectContainer>
    </Arbitrables>
  );
};

export default SelectArbitrable;
