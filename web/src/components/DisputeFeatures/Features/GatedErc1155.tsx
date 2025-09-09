import React, { Fragment, useEffect, useMemo } from "react";
import styled from "styled-components";

import { Field } from "@kleros/ui-components-library";

import { Features } from "consts/disputeFeature";
import { IGatedDisputeData, useNewDisputeContext } from "context/NewDisputeContext";
import { useERC1155Validation } from "hooks/useTokenAddressValidation";

import { isUndefined } from "src/utils";

import WithHelpTooltip from "components/WithHelpTooltip";

import { RadioInput, StyledRadio } from ".";

const FieldContainer = styled.div`
  width: 100%;
  padding-left: 32px;
`;

const StyledField = styled(Field)`
  width: 100%;
  margin-top: 8px;
  margin-bottom: 32px;
  > small {
    margin-top: 16px;
  }
`;

const GatedErc1155: React.FC<RadioInput> = (props) => {
  const { disputeData, setDisputeData } = useNewDisputeContext();

  const tokenGateAddress = (disputeData.disputeKitData as IGatedDisputeData)?.tokenGate ?? "";
  const validationEnabled = !isUndefined(tokenGateAddress) && tokenGateAddress.trim() !== "";

  const {
    isValidating,
    isValid,
    error: validationError,
  } = useERC1155Validation({
    address: tokenGateAddress,
    enabled: validationEnabled && props.checked,
  });

  const [validationMessage, variant] = useMemo(() => {
    if (isValidating) return [`Validating ERC-1155 token...`, "info"];
    else if (validationError) return [validationError, "error"];
    else if (isValid === true) return [`Valid ERC-1155 token`, "success"];
    else return [undefined, "info"];
  }, [isValidating, validationError, isValid]);

  // Update validation state in dispute context
  useEffect(() => {
    // this can clash with erc20 check
    if (!props.checked) return;
    // Only update if isValid has actually changed
    if (disputeData.disputeKitData) {
      const currentData = disputeData.disputeKitData as IGatedDisputeData;

      if (currentData.isTokenGateValid !== isValid) {
        setDisputeData({
          ...disputeData,
          disputeKitData: { ...currentData, isTokenGateValid: isValid },
        });
      }
    }
  }, [isValid, setDisputeData, props.checked]);

  const handleTokenAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentData = disputeData.disputeKitData as IGatedDisputeData;

    setDisputeData({
      ...disputeData,
      disputeKitData: {
        ...currentData,
        tokenGate: event.target.value,
        isTokenGateValid: null, // Reset validation state when address changes
      },
    });
  };

  const handleTokenIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentData = disputeData.disputeKitData as IGatedDisputeData;
    // DEV: we only update the tokenGate value here, and the disputeKidID,
    // and type are still handled in Resolver/Court/FeatureSelection.tsx
    setDisputeData({
      ...disputeData,
      disputeKitData: { ...currentData, tokenId: event.target.value },
    });
  };

  return (
    <Fragment key={Features.GatedErc1155}>
      <WithHelpTooltip
        tooltipMsg="Only jurors who possess the token or NFT indicated below can be selected as jurors for this case.
        Add the token address below."
      >
        <StyledRadio label="Jurors owning at least 1 token ERC-1155" small {...props} />
      </WithHelpTooltip>
      {props.checked ? (
        <FieldContainer>
          <StyledField
            dir="auto"
            onChange={handleTokenAddressChange}
            value={tokenGateAddress}
            placeholder="Eg. 0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
            variant={variant}
            message={validationMessage}
          />
          <StyledField
            dir="auto"
            onChange={handleTokenIdChange}
            value={(disputeData.disputeKitData as IGatedDisputeData)?.tokenId ?? "0"}
            placeholder="Eg. 1"
          />
        </FieldContainer>
      ) : null}
    </Fragment>
  );
};

export default GatedErc1155;
