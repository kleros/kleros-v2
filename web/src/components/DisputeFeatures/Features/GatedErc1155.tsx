import React, { Fragment, useEffect, useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { Address } from "viem";

import { BigNumberField, TextField } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";
import { useERC1155Validation } from "hooks/useTokenAddressValidation";

import { GatedDisputeKitData } from "src/dispute-kits/prepareArbitratorExtradata";
import { Features } from "src/dispute-kits/types";
import { isUndefined } from "src/utils";

import WithHelpTooltip from "components/WithHelpTooltip";

import { FeatureRadio, RadioInput } from "./FeatureRadio";

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
`;

const GatedErc1155: React.FC<RadioInput> = (props) => {
  const { t } = useTranslation();
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const gatedData = disputeData.disputeKitData as GatedDisputeKitData | undefined;

  const tokenGateAddress = gatedData?.tokenGate ?? "";
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

  useEffect(() => {
    if (!props.checked) return;
    if (gatedData?.isERC1155 === true) return;

    setDisputeData({
      ...disputeData,
      disputeKitData: {
        tokenGate: (gatedData?.tokenGate ?? "") as Address,
        isERC1155: true,
        tokenId: gatedData?.tokenId ?? "0",
        isValid: gatedData?.isValid ?? null,
      },
    });
  }, [props.checked, gatedData, disputeData, setDisputeData]);

  // Update validation state in dispute context
  useEffect(() => {
    if (!props.checked || !gatedData || gatedData.isValid === isValid) return;

    setDisputeData({
      ...disputeData,
      disputeKitData: { ...gatedData, isValid },
    });
  }, [isValid, gatedData, disputeData, setDisputeData, props.checked]);

  const handleTokenAddressChange = (value: string) => {
    if (!gatedData) return;

    setDisputeData({
      ...disputeData,
      disputeKitData: {
        ...gatedData,
        isERC1155: true,
        tokenGate: value as Address,
        isValid: null, // Reset validation state when address changes
      },
    });
  };

  const handleTokenIdChange = (value: string) => {
    if (!gatedData) return;

    setDisputeData({
      ...disputeData,
      disputeKitData: { ...gatedData, isERC1155: true, tokenId: value },
    });
  };

  return (
    <Fragment key={Features.GatedErc1155}>
      <WithHelpTooltip tooltipMsg={t("tooltips.token_gating_tooltip")}>
        <FeatureRadio {...props} label={t("features.jurors_owning_erc1155")} />
      </WithHelpTooltip>
      {props.checked ? (
        <FieldContainer>
          <StyledField
            aria-label={t("aria_labels.token_address")}
            inputProps={{ dir: "auto" }}
            onChange={handleTokenAddressChange}
            value={tokenGateAddress}
            placeholder={t("forms.placeholders.token_address_example")}
            variant={variant}
            message={validationMessage}
          />
          <StyledTokenIdField
            inputProps={{ "aria-label": t("aria_labels.token_id") }}
            onChange={(tokenId) => handleTokenIdChange(tokenId.toString())}
            value={gatedData?.tokenId ?? "0"}
            placeholder={t("forms.placeholders.token_id_example")}
            minValue="0"
            formatOptions={{ groupSeparator: "" }}
          />
        </FieldContainer>
      ) : null}
    </Fragment>
  );
};

export default GatedErc1155;
