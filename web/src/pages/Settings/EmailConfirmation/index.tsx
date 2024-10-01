import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";

import { useNavigate, useSearchParams } from "react-router-dom";
import { isAddress } from "viem";

import { Button } from "@kleros/ui-components-library";

import ThreePnksIcon from "svgs/styled/three-pnks.svg";

import { useAtlasProvider } from "context/AtlasProvider";

import { landscapeStyle } from "styles/landscapeStyle";

import Loader from "components/Loader";

const Container = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  flex-direction: column;
  gap: 16px;
  position: relative;
  ${landscapeStyle(
    () => css`
      margin-top: 48px;
    `
  )}
`;

const Header = styled.h1`
  color: ${({ theme }) => theme.secondaryPurple};
`;

const Subtitle = styled.h3``;

const ThreePnksIconContainer = styled.div`
  display: flex;
  width: 100%;
  position: absolute;
  right: 0;
  top: 0;
  justify-content: end;
`;

const StyledThreePnksIcon = styled(ThreePnksIcon)`
  width: 200px;
  height: 200px;
`;

const EmailConfirmation: React.FC = () => {
  const { confirmEmail } = useAtlasProvider();

  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isError, setIsError] = useState(false);
  const [searchParams, _] = useSearchParams();
  const address = searchParams.get("address");
  const token = searchParams.get("token");

  const navigate = useNavigate();

  useEffect(() => {
    if (address && isAddress(address) && token) {
      setIsConfirming(true);

      confirmEmail({ address, token })
        .then((res) => {
          setIsConfirmed(res.confirmed);
          setIsError(res.isError);
        })
        .finally(() => setIsConfirming(false));
    }
  }, [address, token, confirmEmail]);

  const [headerMsg, subtitleMsg, buttonMsg] = useMemo(() => {
    if (!address || !isAddress(address) || !token)
      return ["Invalid Link!", "Oops, seems like you followed an invalid link.", "Contact Support"];
    else if (isError) return ["Verification Failed", "Oops, could not verify your email.", "Contact Support"];
    else if (isConfirmed)
      return ["Verification Successful 🎉", "Hooray! , your email has been verified.", "Go to dashboard"];
    else
      return [
        "Link Expired",
        "Oops, seems like this email verification link has expired. \n No worries we can send the link again.",
        "Generate new link",
      ];
  }, [address, token, isError, isConfirmed]);

  const handleButtonClick = useCallback(() => {
    // TODO: send to support?
    if (!address || !isAddress(address) || !token || isError) return navigate("/");
    navigate("/#notifications");
  }, [address, token, isError, navigate]);

  return (
    <Container>
      <ThreePnksIconContainer>
        <StyledThreePnksIcon />
      </ThreePnksIconContainer>
      {isConfirming ? (
        <Loader width={"148px"} height={"148px"} />
      ) : (
        <>
          <Header>{headerMsg}</Header>
          <Subtitle>{subtitleMsg}</Subtitle>
          <Button text={buttonMsg} onClick={handleButtonClick} />
        </>
      )}
    </Container>
  );
};

export default EmailConfirmation;
