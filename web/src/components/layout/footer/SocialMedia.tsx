import React from "react";
import styled from "styled-components";
import { socialmedia } from "src/consts/socialmedia";
import { Link } from "react-router-dom";

const Container = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
`;

const StyledLink = styled(Link)`
  display: inline-block;
`;

const SocialMedia = () => (
  <Container>
    {Object.values(socialmedia).map((site, i) => (
      <StyledLink key={i} to={site.url} target="_blank" rel="noopener">
        {site.icon}
      </StyledLink>
    ))}
  </Container>
);

export default SocialMedia;
