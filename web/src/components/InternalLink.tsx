import styled from "styled-components";

import { Link } from "react-router-dom";

export const InternalLink = styled(Link)`
  :hover {
    color: ${({ theme }) => theme.secondaryBlue} !important;
  }
`;
