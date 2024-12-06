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

  &:hover {
    color: ${({ theme }) => theme.secondaryBlue};
    svg path {
      transition: fill 0.1s;
      fill: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;
