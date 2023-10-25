import React from "react";
import styled from "styled-components";
import PixelArt from "pages/Dashboard/JurorInfo/PixelArt";
import { getUserLevelData } from "utils/userLevelCalculation";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

interface IHowItWorks {
  coherenceScore: number;
}

const HowItWorks: React.FC<IHowItWorks> = ({ coherenceScore }) => {
  const userLevelData = getUserLevelData(coherenceScore);
  const level = userLevelData.level;

  return (
    <Container>
      <label> Level {level}</label>
      <PixelArt width="32px" height="32px" level={level} />
    </Container>
  );
};
export default HowItWorks;
