import React from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import CourtCard from "./CourtCard";
import { useJurorStakedCourts } from "hooks/queries/useJurorStakedCourts";

const Container = styled.div`
  margin-top: 64px;
`;

const CourtsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Courts: React.FC = () => {
  const { address } = useAccount();
  const { data: jurorStakedCourtsData } = useJurorStakedCourts(address?.toLowerCase());

  return (
    address && (
      <Container>
        <h1> My Courts </h1>
        <hr />
        <CourtsContainer>
          {jurorStakedCourtsData?.user?.tokens?.map(({ court: { id, name } }) => {
            return <CourtCard key={id} id={id} name={name} />;
          })}
        </CourtsContainer>
      </Container>
    )
  );
};

export default Courts;
