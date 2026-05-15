import React, { Fragment, useEffect, useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { TextField } from "@kleros/ui-components-library";

import { Features } from "consts/disputeFeature";
import { IGatedDisputeData, useNewDisputeContext } from "context/NewDisputeContext";
import { useERC20ERC721Validation } from "hooks/useTokenAddressValidation";

import { isUndefined } from "src/utils";

import WithHelpTooltip from "components/WithHelpTooltip";

import { RadioInput, StyledRadio } from ".";

const FieldContainer = styled.div`
  width: 100%;
  padding-left: 32px;
`;

const StyledField = styled(TextField)`
  width: 100%;
  margin-top: 8px;
  margin-bottom: 32px;
  > small {
    margin-top: 16px;
  }
`;

const GatedErc20: React.FC<RadioInput> = (props) => {
  const { t } = useTranslation();
  const { disputeData, setDisputeData } = useNewDisputeContext();

  const tokenGateAddress = (disputeData.disputeKitData as IGatedDisputeData)?.tokenGate ?? "";
  const validationEnabled = !isUndefined(tokenGateAddress) && tokenGateAddress.trim() !== "";

  const {
    isValidating,
    isValid,
    error: validationError,
  } = useERC20ERC721Validation({
    address: tokenGateAddress,
    enabled: validationEnabled && props.checked,
  });

  const [validationMessage, variant] = useMemo<[string | undefined, "info" | "error" | "success"]>(() => {
    if (isValidating) return [`Validating ERC-20 or ERC-721 token...`, "info"];
    else if (validationError) return [validationError, "error"];
    else if (isValid === true) return [`Valid ERC-20 or ERC-721 token`, "success"];
    else return [undefined, "info"];
  }, [isValidating, validationError, isValid]);

  // Update validation state in dispute context
  useEffect(() => {
    // this can clash with erc1155 check
    if (!props.checked) return;
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
    // DEV: we only update the tokenGate value here, and the disputeKidID,
    // and type are still handled in Resolver/Court/FeatureSelection.tsx
    setDisputeData({
      ...disputeData,
      disputeKitData: {
        ...currentData,
        tokenGate: value,
        isTokenGateValid: null, // Reset validation state when address changes
      },
    });
  };

  return (
    <Fragment key={Features.GatedErc20}>
      <WithHelpTooltip tooltipMsg={t("tooltips.token_gating_tooltip")}>
        <StyledRadio label={t("features.jurors_owning_erc20")} small {...props} />
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
        </FieldContainer>
      ) : null}
    </Fragment>
  );
};

export default GatedErc20;
