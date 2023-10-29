import React from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import { useFragment as getFragment } from "src/graphql";
import { useUserQuery, userFragment } from "queries/useUser";
import { isUndefined } from "utils/index";
import CourtCard from "./CourtCard";
import Header from "./Header";

const Container = styled.div`
  margin-top: 64px;

  h1 {
    margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  }
`;

const Divider = styled.hr`
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.stroke};
  margin: 0;
`;

const CourtCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 0;
`;

const Courts: React.FC = () => {
  const { address } = useAccount();
  const { data } = useUserQuery(address?.toLowerCase() as `0x${string}`);
  const user = getFragment(userFragment, data?.user);

  return (
    <Container>
      <h1> My Courts </h1>
      <Divider />
      {!isUndefined(data) ? (
        <>
          <Header />
          <CourtCardsContainer>
            {user?.tokens?.map(({ court: { id, name } }) => {
              return <CourtCard key={id} id={id} name={name ?? ""} />;
            })}
          </CourtCardsContainer>
        </>
      ) : null}
    </Container>
  );
};

export default Courts;
