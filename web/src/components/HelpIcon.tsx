import styled from "styled-components";
import _HelpIcon from "assets/svgs/menu-icons/help.svg";

const HelpIcon = styled(_HelpIcon)`
  fill: ${({ theme }) => theme.secondaryText};
  margin: 4px;
`;

export default HelpIcon;
