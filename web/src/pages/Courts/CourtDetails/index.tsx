import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useToggle } from "react-use";

import { Card, Breadcrumb } from "@kleros/ui-components-library";

import { isProductionDeployment } from "consts/index";
import { getDescriptiveCourtName } from "utils/getDescriptiveCourtName";

import { useCourtTree, CourtTreeQuery } from "queries/useCourtTree";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import ClaimPnkButton from "components/ClaimPnkButton";
import { Divider } from "components/Divider";
import HowItWorks from "components/HowItWorks";
import LatestCases from "components/LatestCases";
import Staking from "components/Popup/MiniGuides/Staking";
import ScrollTop from "components/ScrollTop";
import { StyledSkeleton } from "components/StyledSkeleton";

import Description from "./Description";
import JurorsStakedByCourt from "./JurorsStakedByCourt";
import StakePanel from "./StakePanel";
import Stats from "./Stats";
import TopSearch from "./TopSearch";

const Container = styled.div``;

const CourtHeader = styled.h1`
  display: flex;
  flex-direction: row;
  font-size: ${responsiveSize(20, 24)};
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const CourtInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
  gap: 20px;

  ${landscapeStyle(
    () => css`
      align-items: flex-end;
    `
  )};
`;

const StyledCard = styled(Card)`
  padding: 16px;
  margin-top: 12px;
  width: 100%;
  height: auto;
  min-height: 100px;

  ${landscapeStyle(
    () => css`
      padding: 32px;
    `
  )}
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  align-items: center;
  button {
    font-size: 16px;
  }
`;

const StakePanelAndStats = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 24px;
  gap: 16px;
  flex-wrap: wrap;

  ${landscapeStyle(
    () => css`
      & > * {
        flex: 1 1 calc(50% - 8px);
      }
    `
  )}
`;

const CourtDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data } = useCourtTree();
  const [isStakingMiniGuideOpen, toggleStakingMiniGuide] = useToggle(false);
  const navigate = useNavigate();

  const courtPath = getCourtsPath(data?.court, id);

  const breadcrumbItems =
    courtPath?.map((node) => ({
      text: node.name,
      value: node.id,
    })) ?? [];

  const currentCourt = courtPath?.[courtPath.length - 1];
  const courtName = currentCourt?.name;

  return (
    <Container>
      <TopSearch />
      <StyledCard>
        <CourtHeader>
          <CourtInfo>
            {data ? courtName : <StyledSkeleton width={200} />}
            {breadcrumbItems.length > 1 ? (
              <StyledBreadcrumb
                items={breadcrumbItems}
                clickable
                callback={(courtId) => navigate(`/courts/${courtId}`)}
              />
            ) : null}
          </CourtInfo>
          <ButtonContainer>
            {!isProductionDeployment() && <ClaimPnkButton />}
            <HowItWorks
              isMiniGuideOpen={isStakingMiniGuideOpen}
              toggleMiniGuide={toggleStakingMiniGuide}
              MiniGuideComponent={Staking}
            />
          </ButtonContainer>
        </CourtHeader>
        <Divider />
        <StakePanelAndStats>
          <StakePanel {...{ courtName }} />
          <Stats />
        </StakePanelAndStats>
      </StyledCard>
      <StyledCard>
        <Description />
      </StyledCard>
      <LatestCases
        title={`${t("misc.latest_cases_in")} ${getDescriptiveCourtName(courtName)}`}
        filters={{ court: id }}
      />
      <JurorsStakedByCourt {...{ courtName }} />
      <ScrollTop />
    </Container>
  );
};

export default CourtDetails;

interface IItem {
  name: string;
  id: string;
}

export const getCourtsPath = (
  node: CourtTreeQuery["court"],
  id: string | undefined,
  path: IItem[] = []
): IItem[] | null => {
  if (!node || !id) return null;

  if (node.id === id) {
    path.unshift({
      name: node.name || "",
      id: node.id,
    });
    return path;
  }

  if (node.children) {
    for (const child of node.children) {
      const pathFromChild = getCourtsPath(child, id, path.slice());
      if (pathFromChild) {
        pathFromChild.unshift({
          name: node.name || "",
          id: node.id,
        });
        return pathFromChild;
      }
    }
  }

  return null;
};
