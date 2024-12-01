import styled from "styled-components";

import { Link } from "react-router-dom";

export const StyledArrowLink = styled(Link)`
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 16px;

  > svg {
    height: 16px;
    width: 16px;

    path {
      fill: ${({ theme }) => theme.primaryBlue};
    }
  }

  &:hover svg path {
    fill: ${({ theme }) => theme.secondaryBlue};
  }
`;
