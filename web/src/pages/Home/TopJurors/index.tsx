import React from "react";
import styled from "styled-components";
import { SkeletonDisputeListItem } from "components/StyledSkeleton";
import { isUndefined } from "utils/index";
import TopJurorsHeader from "./TopJurorsHeader";
import JurorCard from "./JurorCard";

const Container = styled.div`
  margin-top: calc(64px + (80 - 64) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Title = styled.h1`
  margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const TopJurors: React.FC<ITopJurors> = () => {
  const jurors = [
    { id: 1, address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
    { id: 2, address: "0x74199ddaC9607A3a694011793f674FA1E0d0Fe2D" },
    { id: 3, address: "0x96BFc2d3d2b6fdE87D9271a8684a45d93087139d" },
    { id: 4, address: "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326" },
    { id: 5, address: "0x10F5d45854e038071485AC9e402308cF80D2d2fE" },
  ];

  return (
    <Container>
      <Title>Top Jurors</Title>
      <ListContainer>
        <TopJurorsHeader />
        {isUndefined(jurors)
          ? [...Array(5)].map((_, i) => <SkeletonDisputeListItem key={i} />)
          : jurors.map((juror) => {
              return <JurorCard key={juror.id} {...juror} />;
            })}
      </ListContainer>
    </Container>
  );
};
export default TopJurors;
