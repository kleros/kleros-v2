import React from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeaderSkeleton = styled(Skeleton)`
  width: 25%;
  height: 22px;
`;

const SubHeaderSkeleton = styled(Skeleton)`
  width: 75%;
  height: 19px;
`;

const RadioSkeleton = styled(Skeleton)`
  width: 20%;
  height: 19px;
`;

const FeatureSkeleton: React.FC = () => {
  return (
    <Container>
      <HeaderContainer>
        <HeaderSkeleton /> <SubHeaderSkeleton />
      </HeaderContainer>
      <RadioSkeleton />
      <RadioSkeleton />
    </Container>
  );
};

export default FeatureSkeleton;
