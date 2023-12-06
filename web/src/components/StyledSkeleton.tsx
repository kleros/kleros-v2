import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import Skeleton from "react-loading-skeleton";
import { responsiveSize } from "styles/responsiveSize";

export const StyledSkeleton = styled(Skeleton)`
  z-index: 0;
`;

const SkeletonDisputeCardContainer = styled.div`
  width: 100%;

  ${landscapeStyle(
    () =>
      css`
        /* Explanation of this formula:
      - The 48px accounts for the total width of gaps: 2 gaps * 24px each.
      - The 0.333 is used to equally distribute width among 3 cards per row.
      - The 348px ensures the card has a minimum width.
    */
        width: max(calc((100% - 48px) * 0.333), 348px);
      `
  )}
`;

const StyledSkeletonDisputeCard = styled(Skeleton)`
  ${responsiveSize("height", 270, 296)}
`;

const StyledSkeletonDisputeListItem = styled(Skeleton)`
  height: 62px;
`;

const StyledSkeletonEvidenceCard = styled(Skeleton)`
  height: 146px;
  width: 76vw;
`;

export const SkeletonDisputeCard = () => (
  <SkeletonDisputeCardContainer>
    <StyledSkeletonDisputeCard />
  </SkeletonDisputeCardContainer>
);

export const SkeletonDisputeListItem = () => <StyledSkeletonDisputeListItem />;

export const SkeletonEvidenceCard = () => <StyledSkeletonEvidenceCard />;
