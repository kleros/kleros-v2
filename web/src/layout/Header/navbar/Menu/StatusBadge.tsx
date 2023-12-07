import React, { useMemo } from "react";
import styled from "styled-components";
import { useToggleTheme } from "hooks/useToggleThemeContext";

const Container = styled.div`
  padding: 0px 3px;
  max-width: 220px;
`;

const StyledIframe = styled.iframe`
  border: none;
  width: 100%;
  height: 30px;
  background-color: ${({ theme }) => theme.mediumPurple};
  border-radius: 300px;
`;

export const StatusBadge: React.FC = () => {
  const [theme] = useToggleTheme();

  const deployment = process.env.REACT_APP_DEPLOYMENT ?? "testnet";

  let statusUrl: string;

  switch (deployment) {
    case "devnet":
      statusUrl = process.env.REACT_APP_DEVNET_STATUS_URL!;
      break;
    case "testnet":
      statusUrl = process.env.REACT_APP_TESTNET_STATUS_URL!;
      break;
    default:
      statusUrl = process.env.REACT_APP_TESTNET_STATUS_URL!;
  }

  //update url on theme toggle
  statusUrl = useMemo(() => (theme == "light" ? statusUrl + "?theme=light" : statusUrl + "?theme=dark"), [theme]);

  return (
    <Container>
      <StyledIframe src={statusUrl} />
    </Container>
  );
};
