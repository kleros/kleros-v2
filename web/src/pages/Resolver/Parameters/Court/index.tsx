import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { AlertMessage, DropdownCascader } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";
import { rootCourtToItems, useCourtTree } from "hooks/queries/useCourtTree";
import { isUndefined } from "utils/index";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { StyledSkeleton } from "components/StyledSkeleton";
import Header from "pages/Resolver/Header";

import NavigationButtons from "../../NavigationButtons";

import FeatureSelection from "./FeatureSelection";

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

const Court: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, setDisputeData, setSelectedFeatures } = useNewDisputeContext();
  const { data: courtTree } = useCourtTree();
  const items = useMemo(() => !isUndefined(courtTree?.court) && [rootCourtToItems(courtTree.court)], [courtTree]);

  const handleCourtChange = (courtId: string) => {
    if (disputeData.courtId !== courtId) {
      setDisputeData({ ...disputeData, courtId, disputeKitId: undefined, disputeKitData: undefined });
      setSelectedFeatures([]);
    }
  };

  return (
    <Container>
      <Header text={t("headers.select_court_to_arbitrate")} />
      {items ? (
        <StyledDropdownCascader
          items={items}
          onSelect={(path: string | number) => typeof path === "string" && handleCourtChange(path.split("/").pop()!)}
          placeholder={t("forms.placeholders.select_court")}
          value={`/courts/${disputeData.courtId}`}
        />
      ) : (
        <StyledSkeleton width={240} height={42} />
      )}

      <AlertMessageContainer>
        <AlertMessage
          title={t("alerts.check_courts_beforehand")}
          msg={t("alerts.kleros_different_courts")}
          variant="info"
        />
      </AlertMessageContainer>
      {isUndefined(disputeData.courtId) ? null : <FeatureSelection />}
      <NavigationButtons prevRoute="/resolver/description" nextRoute="/resolver/category" />
    </Container>
  );
};

export default Court;
