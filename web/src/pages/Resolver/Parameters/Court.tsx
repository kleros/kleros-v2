import React, { useMemo, useEffect } from "react";
import styled, { css } from "styled-components";

import { AlertMessage, Checkbox, DropdownCascader, DropdownSelect, Field } from "@kleros/ui-components-library";

import { DisputeKits } from "consts/index";
import { IGatedDisputeData, useNewDisputeContext } from "context/NewDisputeContext";
import { rootCourtToItems, useCourtTree } from "hooks/queries/useCourtTree";
import { useDisputeKitAddressesAll } from "hooks/useDisputeKitAddresses";
import { useERC20ERC721Validation, useERC1155Validation } from "hooks/useTokenAddressValidation";
import { isUndefined } from "utils/index";

import { useSupportedDisputeKits } from "queries/useSupportedDisputeKits";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { StyledSkeleton } from "components/StyledSkeleton";
import Header from "pages/Resolver/Header";

import NavigationButtons from "../NavigationButtons";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${landscapeStyle(
    () => css`
      padding-bottom: 115px;
    `
  )}
`;

const StyledDropdownCascader = styled(DropdownCascader)`
  width: 84vw;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
  > button {
    width: 100%;
  }
`;

const AlertMessageContainer = styled.div`
  width: 84vw;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
  margin-top: 24px;
`;

const StyledDropdownSelect = styled(DropdownSelect)`
  width: 84vw;
  margin-top: 24px;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
`;

const StyledField = styled(Field)`
  width: 84vw;
  margin-top: 24px;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
  > small {
    margin-top: 16px;
  }
`;

const StyledCheckbox = styled(Checkbox)`
  width: 84vw;
  margin-top: 24px;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
`;

const ValidationContainer = styled.div`
  width: 84vw;
  display: flex;
  align-items: left;
  gap: 8px;
  margin-top: 8px;
  ${landscapeStyle(
    () => css`
      width: ${responsiveSize(442, 700, 900)};
    `
  )}
`;

const ValidationIcon = styled.div<{ $isValid?: boolean | null; $isValidating?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;

  ${({ $isValidating, $isValid }) => {
    if ($isValidating) {
      return css`
        border: 2px solid #ccc;
        border-top-color: #007bff;
        animation: spin 1s linear infinite;

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `;
    }

    if ($isValid === true) {
      return css`
        background-color: #28a745;
        color: white;
        &::after {
          content: "✓";
        }
      `;
    }

    if ($isValid === false) {
      return css`
        background-color: #dc3545;
        color: white;
        &::after {
          content: "✗";
        }
      `;
    }

    return css`
      display: none;
    `;
  }}
`;

const ValidationMessage = styled.small<{ $isError?: boolean }>`
  color: ${({ $isError }) => ($isError ? "#dc3545" : "#28a745")};
  font-size: 14px;
  font-style: italic;
  font-weight: normal;
`;

const StyledFieldWithValidation = styled(StyledField)<{ $isValid?: boolean | null }>`
  > input {
    border-color: ${({ $isValid }) => {
      if ($isValid === true) return "#28a745";
      if ($isValid === false) return "#dc3545";
      return "inherit";
    }};
  }
`;

const Court: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const { data: courtTree } = useCourtTree();
  const { data: supportedDisputeKits } = useSupportedDisputeKits(disputeData.courtId);
  const items = useMemo(() => !isUndefined(courtTree?.court) && [rootCourtToItems(courtTree.court)], [courtTree]);
  const { availableDisputeKits } = useDisputeKitAddressesAll();

  const disputeKitOptions = useMemo(() => {
    return (
      supportedDisputeKits?.court?.supportedDisputeKits.map((dk) => {
        const text = availableDisputeKits[dk.address.toLowerCase()] ?? "";
        return {
          text,
          value: Number(dk.id),
          gated: text === DisputeKits.Gated || text === DisputeKits.GatedShutter,
        };
      }) || []
    );
  }, [supportedDisputeKits, availableDisputeKits]);

  const selectedDisputeKitId = useMemo(() => {
    // If there's only 1 supported dispute kit, select it by default
    if (disputeKitOptions.length === 1) {
      return disputeKitOptions[0].value;
    }
    // If there's no saved selection, select nothing
    return disputeData.disputeKitId ?? -1;
  }, [disputeKitOptions, disputeData.disputeKitId]);

  const isGatedDisputeKit = useMemo(() => {
    const options = disputeKitOptions.find((dk) => String(dk.value) === String(selectedDisputeKitId));
    return options?.gated ?? false;
  }, [disputeKitOptions, selectedDisputeKitId]);

  // Token validation for token gate address (conditional based on ERC1155 checkbox)
  const tokenGateAddress = (disputeData.disputeKitData as IGatedDisputeData)?.tokenGate ?? "";
  const isERC1155 = (disputeData.disputeKitData as IGatedDisputeData)?.isERC1155 ?? false;
  const validationEnabled = isGatedDisputeKit && !!tokenGateAddress.trim();

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

  // Update validation state in dispute context
  useEffect(() => {
    if (isGatedDisputeKit && disputeData.disputeKitData) {
      const currentData = disputeData.disputeKitData as IGatedDisputeData;
      if (currentData.isTokenGateValid !== isValidToken) {
        setDisputeData({
          ...disputeData,
          disputeKitData: { ...currentData, isTokenGateValid: isValidToken },
        });
      }
    }
  }, [isValidToken, isGatedDisputeKit, disputeData, setDisputeData]);

  const handleCourtChange = (courtId: string) => {
    if (disputeData.courtId !== courtId) {
      setDisputeData({ ...disputeData, courtId, disputeKitId: undefined });
    }
  };

  const handleDisputeKitChange = (newValue: string | number) => {
    const options = disputeKitOptions.find((dk) => String(dk.value) === String(newValue));
    const gatedDisputeKitData: IGatedDisputeData | undefined =
      (options?.gated ?? false)
        ? {
            type: "gated",
            tokenGate: "",
            isERC1155: false,
            tokenId: "0",
          }
        : undefined;
    setDisputeData({ ...disputeData, disputeKitId: Number(newValue), disputeKitData: gatedDisputeKitData });
  };

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

  const handleERC1155TokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentData = disputeData.disputeKitData as IGatedDisputeData;
    setDisputeData({
      ...disputeData,
      disputeKitData: {
        ...currentData,
        isERC1155: event.target.checked,
        isTokenGateValid: null, // Reset validation state when token type changes
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

  return (
    <Container>
      <Header text="Select a court to arbitrate the case" />
      {items ? (
        <StyledDropdownCascader
          items={items}
          onSelect={(path: string | number) => typeof path === "string" && handleCourtChange(path.split("/").pop()!)}
          placeholder="Select Court"
          value={`/courts/${disputeData.courtId}`}
        />
      ) : (
        <StyledSkeleton width={240} height={42} />
      )}
      {disputeData?.courtId && disputeKitOptions.length > 0 && (
        <StyledDropdownSelect
          items={disputeKitOptions}
          placeholder={{ text: "Select Dispute Kit" }}
          defaultValue={selectedDisputeKitId}
          callback={handleDisputeKitChange}
        />
      )}
      {isGatedDisputeKit && (
        <>
          <StyledFieldWithValidation
            dir="auto"
            onChange={handleTokenAddressChange}
            value={(disputeData.disputeKitData as IGatedDisputeData)?.tokenGate ?? ""}
            placeholder="Eg. 0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
            $isValid={isValidToken}
          />
          {tokenGateAddress.trim() !== "" && (
            <ValidationContainer>
              <ValidationIcon $isValidating={isValidating} $isValid={isValidToken} />
              <ValidationMessage $isError={!!validationError}>
                {isValidating && `Validating ${isERC1155 ? "ERC-1155" : "ERC-20 or ERC-721"} token...`}
                {validationError && validationError}
                {isValidToken === true && `Valid ${isERC1155 ? "ERC-1155" : "ERC-20 or ERC-721"} token`}
              </ValidationMessage>
            </ValidationContainer>
          )}
          <StyledCheckbox
            onChange={handleERC1155TokenChange}
            checked={(disputeData.disputeKitData as IGatedDisputeData)?.isERC1155 ?? false}
            label="ERC-1155 token"
            small={true}
          />
          {(disputeData.disputeKitData as IGatedDisputeData)?.isERC1155 && (
            <StyledField
              dir="auto"
              onChange={handleTokenIdChange}
              value={(disputeData.disputeKitData as IGatedDisputeData)?.tokenId ?? "0"}
              placeholder="Eg. 1"
            />
          )}
        </>
      )}
      <AlertMessageContainer>
        <AlertMessage
          title="Check the courts available beforehand"
          msg="Kleros has different courts arbitrating disputes in several areas. Each court has its own purpose and policy. Take some time to choose the best court for your case. Learn more about the available courts here."
          variant="info"
        />
      </AlertMessageContainer>
      <NavigationButtons prevRoute="/resolver/description" nextRoute="/resolver/category" />
    </Container>
  );
};

export default Court;
