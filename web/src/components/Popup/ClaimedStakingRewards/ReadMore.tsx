import React from "react";
import styled from "styled-components";
import RightArrow from "tsx:svgs/icons/arrow.svg";

const StyledLink = styled.a`
  display: flex;
  color: ${({ theme }) => theme.primaryBlue};
  font-size: 16px;
  margin-top: 8px;
  align-items: center;
  gap: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledRightArrow = styled(RightArrow)`
  path {
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

const ReadMore: React.FC = () => {
  return (
    <StyledLink
      href="https://blog.kleros.io/the-launch-of-the-kleros-juror-incentive-program/"
      target="_blank"
      rel="noreferrer"
    >
      <text>Read more about the Juror Incentive Program</text>
      <StyledRightArrow />
    </StyledLink>
  );
};
export default ReadMore;
