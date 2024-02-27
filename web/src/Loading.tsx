import React from "react";
import styled, { keyframes } from "styled-components";
import KlerosIcon from "svgs/icons/kleros.svg";

const Container = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
`;

const Wrapper = styled.div`
  position: absolute;
  width: 20%;
  top: 50%;
  right: 50%;
  transform: translate(50%, -50%);
`;

const breathing = keyframes`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }

  100% {
    transform: scale(1);
  }
`;

const AnimatedKlerosIcon = styled(KlerosIcon)`
  animation: ${breathing} 2s ease-out infinite normal;
  margin-bottom: 26px;
`;

const Loading: React.FC = () => {
  return (
    <Container>
      <Wrapper>
        <AnimatedKlerosIcon />
      </Wrapper>
    </Container>
  );
};

export default Loading;
