import React, { useMemo } from "react";
import Header from "pages/Resolver/Header";
import styled, { css } from "styled-components";
import { AlertMessage, DropdownCascader } from "@kleros/ui-components-library";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import NavigationButtons from "../NavigationButtons";
import { useNewDisputeContext } from "context/NewDisputeContext";
import { rootCourtToItems, useCourtTree } from "hooks/queries/useCourtTree";
import { isUndefined } from "utils/index";
import { StyledSkeleton } from "components/StyledSkeleton";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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

const Court: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const { data } = useCourtTree();
  const items = useMemo(() => !isUndefined(data) && [rootCourtToItems(data.court)], [data]);

  const handleWrite = (courtId: string) => {
    setDisputeData({ ...disputeData, courtId: courtId });
  };

  return (
    <Container>
      <Header text="Select a court to arbitrate the case" />
      {items ? (
        <StyledDropdownCascader
          items={items}
          onSelect={(path: string | number) => typeof path === "string" && handleWrite(path.split("/").pop()!)}
          placeholder="Select Court"
        />
      ) : (
        <StyledSkeleton width={240} height={42} />
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
