import React from "react";
import styled from "styled-components";
import TwitterIcon from "svgs/socialmedia/twitter.svg";
import { Button } from "@kleros/ui-components-library";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const StyledTwitterIcon = styled(TwitterIcon)`
  fill: ${({ theme }) => theme.primaryBlue};
  width: 20px;
  height: 20px;
  margin-right: 5px;
`;

const StyledButton = styled(Button)`
  border: 0px;
  background: transparent;
`;

const shareToTwitter = () => {
  const tweetText = "Hey I've been busy as a Juror on the Kleros court, check out my score!";
  const tweetUrl = "https://kleros.io/";
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}&url=${encodeURIComponent(tweetUrl)}`;
  window.open(twitterShareUrl, "_blank");
};

const Header: React.FC = () => {
  return (
    <Container>
      <h1>Juror Dashboard</h1>
      <StyledButton
        text="Share your juror score"
        variant="secondary"
        icon={<StyledTwitterIcon />}
        onClick={shareToTwitter}
      ></StyledButton>
    </Container>
  );
};

export default Header;
