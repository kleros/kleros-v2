import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { Field, Radio } from "@kleros/ui-components-library";

import { IGatedDisputeData, useNewDisputeContext } from "context/NewDisputeContext";
import { useERC1155Validation, useERC20ERC721Validation } from "hooks/useTokenAddressValidation";

import { DisputeKits } from "src/consts";
import { isUndefined } from "src/utils";

import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: start;
  padding-top: 16px;
`;

const HeaderContainer = styled.div`
  width: 100%;
  padding-top: 16px;
`;

const Header = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const SubTitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
  padding: 0;
  margin: 0;
`;

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

const StyledRadio = styled(Radio)`
  font-size: 14px;
`;

enum EligibilityType {
  Classic,
  GatedERC20,
  GatedERC1155,
}

const JurorEligibility: React.FC = () => {
  const [eligibilityType, setEligibilityType] = useState<EligibilityType>();
  const { disputeData, setDisputeData, disputeKitOptions } = useNewDisputeContext();

  const tokenGateAddress = (disputeData.disputeKitData as IGatedDisputeData)?.tokenGate ?? "";
  const validationEnabled = !isUndefined(tokenGateAddress) && tokenGateAddress.trim() !== "";
  const isERC1155 = eligibilityType === EligibilityType.GatedERC1155;
  const {
    isValidating: isValidatingERC20,
    isValid: isValidERC20,
    error: validationErrorERC20,
  } = useERC20ERC721Validation({
    address: tokenGateAddress,
    enabled: validationEnabled && !isERC1155,
  });

  const {
    isValidating: isValidatingERC1155,
    isValid: isValidERC1155,
    error: validationErrorERC1155,
  } = useERC1155Validation({
    address: tokenGateAddress,
    enabled: validationEnabled && isERC1155,
  });

  // Combine validation results based on token type
  const isValidating = isERC1155 ? isValidatingERC1155 : isValidatingERC20;
  const isValidToken = isERC1155 ? isValidERC1155 : isValidERC20;
  const validationError = isERC1155 ? validationErrorERC1155 : validationErrorERC20;

  const [validationMessage, variant] = useMemo(() => {
    if (isValidating) return [`Validating ${isERC1155 ? "ERC-1155" : "ERC-20 or ERC-721"} token...`, "info"];
    else if (validationError) return [validationError, "error"];
    else if (isValidToken === true) return [`Valid ${isERC1155 ? "ERC-1155" : "ERC-20 or ERC-721"} token`, "success"];
    else return [undefined, "info"];
  }, [isValidating, validationError, isERC1155, isValidToken]);

  // Update validation state in dispute context
  useEffect(() => {
    if (disputeData.disputeKitData) {
      const currentData = disputeData.disputeKitData as IGatedDisputeData;
      if (currentData.isTokenGateValid !== isValidToken) {
        setDisputeData({
          ...disputeData,
          disputeKitData: { ...currentData, isTokenGateValid: isValidToken },
        });
      }
    }
  }, [isValidToken, disputeData.disputeKitData, setDisputeData]);

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
    setDisputeData({
      ...disputeData,
      disputeKitData: { ...currentData, tokenId: event.target.value },
    });
  };

  useEffect(() => {
    if (eligibilityType === EligibilityType.Classic) {
      const disputeKit = disputeKitOptions.find((dk) => dk.text === DisputeKits.Classic);

      setDisputeData({ ...disputeData, disputeKitId: disputeKit?.value, disputeKitData: undefined });
    } else if (eligibilityType === EligibilityType.GatedERC20 || eligibilityType === EligibilityType.GatedERC1155) {
      const disputeKitGated = disputeKitOptions.find((dk) => dk.text === DisputeKits.Gated);
      const disputeKitGatedShutter = disputeKitOptions.find((dk) => dk.text === DisputeKits.GatedShutter);

      const currentDisputeKit = disputeKitOptions.find((dk) => dk.value === disputeData.disputeKitId);

      const disputeKitData: IGatedDisputeData = {
        ...(disputeData.disputeKitData as IGatedDisputeData),
        type: "gated",
        isERC1155: eligibilityType === EligibilityType.GatedERC1155,
      };
      // classic is selected, so here we change it to TokenGated
      if (currentDisputeKit?.text === DisputeKits.Classic) {
        setDisputeData({
          ...disputeData,
          disputeKitId: disputeKitGated?.value,
          disputeKitData,
        });
      }
      // shutter is selected, so here we change it to TokenGatedShutter
      else if (currentDisputeKit?.text === DisputeKits.Shutter) {
        setDisputeData({
          ...disputeData,
          disputeKitId: disputeKitGatedShutter?.value,
          disputeKitData,
        });
      } else {
        setDisputeData({
          ...disputeData,
          disputeKitId: disputeKitGated?.value,
          disputeKitData,
        });
      }
    }
  }, [eligibilityType, disputeKitOptions]);

  return (
    <Container>
      <HeaderContainer>
        <Header>Jurors Eligibility</Header>
        <SubTitle>Who can be selected as a juror?.</SubTitle>
      </HeaderContainer>

      <StyledRadio
        label="All the jurors in this court"
        name="classicEligibility"
        small
        onChange={() => setEligibilityType(EligibilityType.Classic)}
        checked={eligibilityType === EligibilityType.Classic}
      />

      <WithHelpTooltip
        tooltipMsg="Only jurors who possess the token or NFT indicated below can be selected as jurors for this case.
        Add the token address below."
      >
        <StyledRadio
          label="Jurors owning at least 1 token ERC-20 or ERC-721"
          name="erc20Gated"
          small
          onChange={() => setEligibilityType(EligibilityType.GatedERC20)}
          checked={eligibilityType === EligibilityType.GatedERC20}
        />
      </WithHelpTooltip>
      {eligibilityType === EligibilityType.GatedERC20 ? (
        <FieldContainer>
          <StyledField
            dir="auto"
            onChange={handleTokenAddressChange}
            value={tokenGateAddress}
            placeholder="Eg. 0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
            variant={variant}
            message={validationMessage}
          />
        </FieldContainer>
      ) : null}
      <WithHelpTooltip
        tooltipMsg="Only jurors who possess the token or NFT indicated below can be selected as jurors for this case.
        Add the token address below."
      >
        <StyledRadio
          label="Jurors owning at least 1 token ERC-1155"
          name="erc1155Gated"
          small
          onChange={() => setEligibilityType(EligibilityType.GatedERC1155)}
          checked={eligibilityType === EligibilityType.GatedERC1155}
        />
      </WithHelpTooltip>
      {eligibilityType === EligibilityType.GatedERC1155 ? (
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
    </Container>
  );
};

export default JurorEligibility;
