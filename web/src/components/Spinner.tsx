import styled, { keyframes } from "styled-components";

import SpinnerIcon from "svgs/icons/spinner.svg";

const rotating = keyframes`
    0%{
      transform: rotate(0deg);
    }
    50%{
      transform: rotate(180deg);
    }
    100%{
      transform: rotate(360deg);
    }
`;

const Spinner = styled(SpinnerIcon)`
  path {
    fill: ${({ theme }) => theme.primaryBlue};
  }
  width: 16px;
  height: 16px;
  margin-right: 4px;
  animation: ${rotating} 2s ease-in-out infinite normal;
`;

export default Spinner;
