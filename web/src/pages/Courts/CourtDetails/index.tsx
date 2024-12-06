import React from "react";
import styled, { css } from "styled-components";

import { useParams } from "react-router-dom";
import { useToggle } from "react-use";

import { Card, Breadcrumb } from "@kleros/ui-components-library";

import { isProductionDeployment } from "consts/index";
import { isUndefined } from "utils/index";

import { useCourtPolicy } from "queries/useCourtPolicy";
import { useCourtTree, CourtTreeQuery } from "queries/useCourtTree";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import ClaimPnkButton from "components/ClaimPnkButton";
import HowItWorks from "components/HowItWorks";
import LatestCases from "components/LatestCases";
import Staking from "components/Popup/MiniGuides/Staking";
import { StyledSkeleton } from "components/StyledSkeleton";
import ScrollTop from "components/ScrollTop";

import Description from "./Description";
import StakePanel from "./StakePanel";
import Stats from "./Stats";

const Container = styled.div``;

const CourtHeader = styled.h1`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 24px;

  ${landscapeStyle(
    () => css`
      margin-bottom: 32px;
    `
  )};
`;

const CourtInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  ${landscapeStyle(
    () => css`
      align-items: flex-end;
    `
  )};
`;

const StyledCard = styled(Card)`
  padding: ${responsiveSize(16, 32)};
  padding-bottom: 16px;
  margin-top: 12px;
  width: 100%;
  height: auto;
  min-height: 100px;
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  align-items: center;
  button {
    font-size: 16px;
  }
`;

const CourtDetails: React.FC = () => {
  const { id } = useParams();
  const { data: policy } = useCourtPolicy(id);
  const { data } = useCourtTree();
  const [isStakingMiniGuideOpen, toggleStakingMiniGuide] = useToggle(false);

  const courtPath = getCourtsPath(data?.court, id);

  const items = [];
  items.push(
    ...(courtPath?.map((node) => ({
      text: node.name,
      value: node.id,
    })) ?? [])
  );

  return (
    <Container>
      <StyledCard>
        <CourtHeader>
          <CourtInfo>
            {policy ? policy.name : <StyledSkeleton width={200} />}
            {items.length > 1 && items[0]?.value !== 1 ? <StyledBreadcrumb items={items} /> : null}
          </CourtInfo>
          <ButtonContainer>
            <HowItWorks
              isMiniGuideOpen={isStakingMiniGuideOpen}
              toggleMiniGuide={toggleStakingMiniGuide}
              MiniGuideComponent={Staking}
            />
            {!isProductionDeployment() && <ClaimPnkButton />}
          </ButtonContainer>
        </CourtHeader>
        <StakePanel id={!isUndefined(id) ? id : ""} courtName={policy?.name} />
        <Stats />
      </StyledCard>
      <StyledCard>
        <Description />
      </StyledCard>
      <LatestCases filters={{ court: id }} />
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
