import React from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import { isUndefined } from "utils/index";
import CourtCard from "./CourtCard";
import { useUserQuery } from "queries/useUser";

const Container = styled.div`
  margin-top: 64px;

  h1 {
    margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  }
`;

const CourtsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Courts: React.FC = () => {
  const { address } = useAccount();
  const { data } = useUserQuery(address?.toLowerCase());

  return (
    <>
      <Container>
        <h1> My Courts </h1>
        <CourtsContainer>
          {!isUndefined(data) &&
            data.user?.tokens?.map(({ court: { id, name } }) => {
              return <CourtCard key={id} id={id} name={name ?? ""} />;
            })}
        </CourtsContainer>
      </Container>
    </>
  );
};

export default Courts;
