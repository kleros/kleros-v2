import React from "react";
import styled, { css } from "styled-components";
import { IElement } from "../pages/Home/Community/Element";
import PNKIcon from "svgs/icons/pnk.svg";
import SnapshotIcon from "svgs/icons/snapshot-color.svg";
import FrenchFlagIcon from "svgs/icons/french-flag.svg";
import TelegramIcon from "svgs/socialmedia/telegram.svg";

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryBlue};
  :hover {
    cursor: pointer;
  }
`;

const fillWithSecondaryPurple = css`
  fill: ${({ theme }) => theme.secondaryPurple};
`;

const StyledPNKIcon = styled(PNKIcon)`
  ${fillWithSecondaryPurple}
`;

const fillWithPrimaryBlue = css`
  fill: ${({ theme }) => theme.primaryBlue};
`;

const StyledTelegramIcon = styled(TelegramIcon)`
  ${fillWithPrimaryBlue}
`;

export const section: IElement[] = [
  {
    Icon: StyledPNKIcon,
    urls: [
      {
        node: <StyledLabel>Kleros Forum</StyledLabel>,
        link: "https://forum.kleros.io/",
      },
    ],
  },
  {
    Icon: SnapshotIcon,
    urls: [
      {
        node: <StyledLabel>Vote on proposals</StyledLabel>,
        link: "https://snapshot.org/#/kleros.eth/",
      },
    ],
  },
  {
    Icon: StyledTelegramIcon,
    primaryText: "Wednesday, 18h UTC",
    urls: [
      {
        node: <StyledLabel>Community Calls</StyledLabel>,
        link: "https://t.me/kleros",
      },
    ],
  },
  {
    Icon: FrenchFlagIcon,
    urls: [
      {
        node: <StyledLabel>Join the Coopérative</StyledLabel>,
        link: "https://kleros.io/coop/",
      },
    ],
  },
];
