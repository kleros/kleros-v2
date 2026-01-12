import React from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";

import { responsiveSize } from "styles/responsiveSize";

export const StyledSkeleton = styled(Skeleton)`
  z-index: 0;
`;

const SkeletonDisputeCardContainer = styled.div`
  width: 100%;
`;

const StyledSkeletonDisputeCard = styled(Skeleton)`
  height: ${responsiveSize(270, 296)};
`;

const StyledSkeletonDisputeListItem = styled(Skeleton)`
  height: 62px;
`;

const StyledSkeletonVoteCard = styled(Skeleton)`
  height: 64px;
`;

const StyledSkeletonEvidenceContainer = styled.div`
  width: 100%;
  span {
    width: 100%;
    height: 146px;
    display: flex;
  }
`;

export const SkeletonDisputeCard = () => (
  <SkeletonDisputeCardContainer>
    <StyledSkeletonDisputeCard />
  </SkeletonDisputeCardContainer>
);

export const SkeletonDisputeListItem = () => <StyledSkeletonDisputeListItem />;

export const SkeletonVoteCard = () => <StyledSkeletonVoteCard />;

export const SkeletonEvidenceCard = () => (
  <StyledSkeletonEvidenceContainer>
    <Skeleton />
  </StyledSkeletonEvidenceContainer>
);
