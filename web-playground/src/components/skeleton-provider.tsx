import React from "react";
import styled, { useTheme } from "styled-components";
import _Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SkeletonWrapper = styled.span`
  height: 100%;
  width: 100%;
`;

const StyledSkeleton = styled(_Skeleton)`
  position: relative;
  top: -1px;
`;

export const Skeleton: typeof _Skeleton = (props) => (
  <SkeletonWrapper>
    <StyledSkeleton {...props} />
  </SkeletonWrapper>
);

const SkeletonProvider: React.FC = ({ children }) => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor="#00000000"
      highlightColor={theme.stroke}
      height="100%"
      borderRadius={0}
    >
      {children}
    </SkeletonTheme>
  );
};

export default SkeletonProvider;
