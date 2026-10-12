import styled from "styled-components";

import NewTab from "svgs/icons/new-tab.svg";

/* svgs/icons/new-tab.svg has no fill of its own, so it renders black unless every usage
   colors the path (kleros/kleros-v2#2433). Import this instead of the raw svg. */
const NewTabIcon = styled(NewTab)`
  path {
    fill: ${({ theme }) => theme.primaryBlue};
  }
`;

export default NewTabIcon;
