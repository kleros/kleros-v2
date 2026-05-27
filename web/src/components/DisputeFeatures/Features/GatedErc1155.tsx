import React, { Fragment, useEffect, useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { Address } from "viem";

import { Field } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";
import { useERC1155Validation } from "hooks/useTokenAddressValidation";

import { GatedDisputeKitData } from "src/dispute-kits/prepareArbitratorExtradata";
import { Features } from "src/dispute-kits/types";
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

  const [validationMessage, variant] = useMemo(() => {
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

  const handleTokenAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!gatedData) return;

    setDisputeData({
      ...disputeData,
      disputeKitData: {
        ...gatedData,
        isERC1155: true,
        tokenGate: event.target.value as Address,
        isValid: null, // Reset validation state when address changes
      },
    });
  };

  const handleTokenIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!gatedData) return;

    setDisputeData({
      ...disputeData,
      disputeKitData: { ...gatedData, isERC1155: true, tokenId: event.target.value },
    });
  };

  return (
    <Fragment key={Features.GatedErc1155}>
      <WithHelpTooltip tooltipMsg={t("tooltips.token_gating_tooltip")}>
        <StyledRadio label={t("features.jurors_owning_erc1155")} small {...props} />
      </WithHelpTooltip>
      {props.checked ? (
        <FieldContainer>
          <StyledField
            dir="auto"
            onChange={handleTokenAddressChange}
            value={tokenGateAddress}
            placeholder={t("forms.placeholders.token_address_example")}
            variant={variant}
            message={validationMessage}
          />
          <StyledField
            dir="auto"
            onChange={handleTokenIdChange}
            value={gatedData?.tokenId ?? "0"}
            placeholder={t("forms.placeholders.token_id_example")}
          />
        </FieldContainer>
      ) : null}
    </Fragment>
  );
};

export default GatedErc1155;
