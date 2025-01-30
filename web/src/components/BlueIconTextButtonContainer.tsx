import styled from "styled-components";
import { hoverShortTransitionTiming } from "styles/commonStyles";

export const BlueIconTextButtonContainer = styled.div`
  ${hoverShortTransitionTiming}
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  gap: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.primaryBlue};

  svg path {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  &:hover {
    color: ${({ theme }) => theme.secondaryBlue};
    svg path {
      fill: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;
