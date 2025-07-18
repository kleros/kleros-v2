import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { AlertMessage, DropdownCascader, DropdownSelect } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";
import { rootCourtToItems, useCourtTree } from "hooks/queries/useCourtTree";
import { useSupportedDisputeKits } from "queries/useSupportedDisputeKits";
import { getDisputeKitName } from "consts/index";
import { isUndefined } from "utils/index";

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

const Court: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const { data: courtTree } = useCourtTree();
  const { data: supportedDisputeKits } = useSupportedDisputeKits(disputeData.courtId);
  const items = useMemo(() => !isUndefined(courtTree?.court) && [rootCourtToItems(courtTree.court)], [courtTree]);
  const disputeKitOptions = useMemo(() => {
    const supportedDisputeKitIDs = supportedDisputeKits?.court?.supportedDisputeKits.map((k) => Number(k.id)) || [];
    return supportedDisputeKitIDs.map((id) => ({ text: getDisputeKitName(id), value: id }));
  }, [supportedDisputeKits]);
  const handleCourtWrite = (courtId: string) => {
    setDisputeData({ ...disputeData, courtId, disputeKitId: undefined });
  };

  const handleDisputeKitChange = (newValue: string | number) =>
    setDisputeData({ ...disputeData, disputeKitId: Number(newValue) });

  return (
    <Container>
      <Header text="Select a court to arbitrate the case" />
      {items ? (
        <StyledDropdownCascader
          items={items}
          onSelect={(path: string | number) => typeof path === "string" && handleCourtWrite(path.split("/").pop()!)}
          placeholder="Select Court"
          value={`/courts/${disputeData.courtId}`}
        />
      ) : (
        <StyledSkeleton width={240} height={42} />
      )}
      {disputeData?.courtId && (
        <StyledDropdownSelect
          items={disputeKitOptions}
          placeholder={{ text: "Select Dispute Kit" }}
          defaultValue={disputeData.disputeKitId ?? 1}
          callback={handleDisputeKitChange}
        />
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
