import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { AlertMessage, DropdownCascader, DropdownSelect } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";
import { rootCourtToItems, useCourtTree } from "hooks/queries/useCourtTree";
import { isUndefined } from "utils/index";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { StyledSkeleton } from "components/StyledSkeleton";
import Header from "pages/Resolver/Header";

import NavigationButtons from "../NavigationButtons";
import { isKlerosNeo, isKlerosUniversity, isTestnetDeployment } from "src/consts";

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
  const { data } = useCourtTree();
  const items = useMemo(() => !isUndefined(data?.court) && [rootCourtToItems(data.court)], [data]);

  const disputeKitOptions = useMemo(() => {
    if (isKlerosUniversity()) return [{ text: "Classic Dispute Kit", value: 1 }];
    if (isKlerosNeo()) return [{ text: "Classic Dispute Kit", value: 1 }];
    if (isTestnetDeployment()) return [{ text: "Classic Dispute Kit", value: 1 }];
    const options = [{ text: "Classic Dispute Kit", value: 1 }];
    if (disputeData.courtId === "1") options.push({ text: "Shutter Dispute Kit", value: 2 });
    return options;
  }, [disputeData.courtId]);

  const handleCourtWrite = (courtId: string) => {
    const newDisputeKitId = courtId === "1" ? (disputeData.disputeKitId ?? 1) : 1;
    setDisputeData({ ...disputeData, courtId, disputeKitId: newDisputeKitId });
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
      <StyledDropdownSelect
        defaultValue={disputeData.disputeKitId ?? 1}
        items={disputeKitOptions}
        callback={handleDisputeKitChange}
      />
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
