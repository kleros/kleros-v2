import React, { useMemo, useState } from "react";
import styled, { css } from "styled-components";

import { AlertMessage, Checkbox, DropdownCascader, DropdownSelect, Field } from "@kleros/ui-components-library";

import { DisputeKits } from "consts/index";
import { IGatedDisputeData, useNewDisputeContext } from "context/NewDisputeContext";
import { rootCourtToItems, useCourtTree } from "hooks/queries/useCourtTree";
import { useDisputeKitAddressesAll } from "hooks/useDisputeKitAddresses";
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

const Court: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const [isGatedDisputeKit, setIsGatedDisputeKit] = useState(false);
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

  const handleCourtChange = (courtId: string) => {
    if (disputeData.courtId !== courtId) {
      setDisputeData({ ...disputeData, courtId, disputeKitId: undefined });
    }
  };

  const handleDisputeKitChange = (newValue: string | number) => {
    const options = disputeKitOptions.find((dk) => dk.value === String(newValue));
    const isNewValueGated = options?.gated ?? false;
    const gatedDisputeKitData: IGatedDisputeData | undefined = isNewValueGated
      ? {
          type: "gated",
          tokenGate: "",
          isERC1155: false,
          tokenId: "0",
        }
      : undefined;
    setIsGatedDisputeKit(isNewValueGated);
    setDisputeData({ ...disputeData, disputeKitId: Number(newValue), disputeKitData: gatedDisputeKitData });
  };

  const handleTokenAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentData = disputeData.disputeKitData as IGatedDisputeData;
    setDisputeData({
      ...disputeData,
      disputeKitData: { ...currentData, tokenGate: event.target.value },
    });
  };

  const handleERC1155TokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentData = disputeData.disputeKitData as IGatedDisputeData;
    setDisputeData({
      ...disputeData,
      disputeKitData: { ...currentData, isERC1155: event.target.checked },
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
          <StyledField
            dir="auto"
            onChange={handleTokenAddressChange}
            value={(disputeData.disputeKitData as IGatedDisputeData)?.tokenGate ?? ""}
            placeholder="Eg. 0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
          />
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
