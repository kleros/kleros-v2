import React from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import { useFragment as getFragment } from "src/graphql";
import { useUserQuery, userFragment } from "queries/useUser";
import { isUndefined } from "utils/index";
import CourtCard from "./CourtCard";

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
  z-index: 0;
`;

const Courts: React.FC = () => {
  const { address } = useAccount();
  const { data } = useUserQuery(address?.toLowerCase() as `0x${string}`);
  const user = getFragment(userFragment, data?.user);

  return (
    <Container>
      <h1> My Courts </h1>
      {!isUndefined(data) ? <hr /> : null}
      <CourtsContainer>
        {!isUndefined(data)
          ? user?.tokens?.map(({ court: { id, name } }) => {
              return <CourtCard key={id} id={id} name={name ?? ""} />;
            })
          : null}
      </CourtsContainer>
    </Container>
  );
};

export default Courts;
