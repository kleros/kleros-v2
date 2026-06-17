import React, { Fragment, useEffect, useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { BigNumberField, TextField } from "@kleros/ui-components-library";

import { Features } from "consts/disputeFeature";
import { IGatedDisputeData, useNewDisputeContext } from "context/NewDisputeContext";
import { useERC1155Validation } from "hooks/useTokenAddressValidation";

import { isUndefined } from "src/utils";

import WithHelpTooltip from "components/WithHelpTooltip";

import { FeatureRadio, RadioInput } from ".";

const FieldContainer = styled.div`
  width: 100%;
  padding-left: 32px;
`;

const StyledField = styled(TextField)`
  width: 100%;
  margin-top: 8px;
  margin-bottom: 32px;
  > span {
    margin-top: 16px;
  }
`;

const StyledTokenIdField = styled(BigNumberField)`
  width: 100%;
  margin-top: 8px;
  margin-bottom: 32px;

  /* Hover-revealed stepper arrows don't suit a token ID picker. */
  & .input-wrapper > div:has(> button[aria-label="Increment"]) {
    display: none;
  }
`;

const GatedErc1155: React.FC<RadioInput> = (props) => {
  const { t } = useTranslation();
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

  const [validationMessage, variant] = useMemo<[string | undefined, "info" | "error" | "success"]>(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, setDisputeData, props.checked]);

  const handleTokenAddressChange = (value: string) => {
    const currentData = disputeData.disputeKitData as IGatedDisputeData;

    setDisputeData({
      ...disputeData,
      disputeKitData: {
        ...currentData,
        tokenGate: value,
        isTokenGateValid: null, // Reset validation state when address changes
      },
    });
  };

  const handleTokenIdChange = (value: string) => {
    const currentData = disputeData.disputeKitData as IGatedDisputeData;
    // DEV: we only update the tokenGate value here, and the disputeKidID,
    // and type are still handled in Resolver/Court/FeatureSelection.tsx
    setDisputeData({
      ...disputeData,
      disputeKitData: { ...currentData, tokenId: value },
    });
  };

  return (
    <Fragment key={Features.GatedErc1155}>
      <WithHelpTooltip tooltipMsg={t("tooltips.token_gating_tooltip")}>
        <FeatureRadio value={props.value} disabled={props.disabled} label={t("features.jurors_owning_erc1155")} />
      </WithHelpTooltip>
      {props.checked ? (
        <FieldContainer>
          <StyledField
            inputProps={{ dir: "auto" }}
            onChange={handleTokenAddressChange}
            value={tokenGateAddress}
            placeholder={t("forms.placeholders.token_address_example")}
            variant={variant}
            message={validationMessage}
          />
          <StyledTokenIdField
            onChange={(tokenId) => handleTokenIdChange(tokenId.toString())}
            value={(disputeData.disputeKitData as IGatedDisputeData)?.tokenId ?? "0"}
            placeholder={t("forms.placeholders.token_id_example")}
            formatOptions={{ groupSeparator: "" }}
          />
        </FieldContainer>
      ) : null}
    </Fragment>
  );
};

export default GatedErc1155;
