import { Link } from "react-router-dom";
import styled from "styled-components";

export const InternalLink = styled(Link)`
  :hover {
    color: ${({ theme }) => theme.secondaryBlue} !important;
  }
`;
