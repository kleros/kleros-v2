import styled from "styled-components";
import { hoverShortTransitionTiming } from "styles/commonStyles";

export const BlueIconTextButtonContainer = styled.div`
  ${hoverShortTransitionTiming}
  display: flex;
  align-items: center;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  gap: 8px;
  cursor: pointer;

  svg path {
    fill: ${({ theme }) => theme.primaryBlue};
  }

  label {
    margin-top: 1px;
    color: ${({ theme }) => theme.primaryBlue};
  }

  &:hover {
    svg path {
      fill: ${({ theme }) => theme.secondaryBlue};
    }
    label {
      cursor: pointer;
      color: ${({ theme }) => theme.secondaryBlue};
    }
  }
`;
