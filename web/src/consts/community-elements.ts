import styled, { css } from "styled-components";

import FrenchFlagIcon from "svgs/icons/french-flag.svg";
import PNKIcon from "svgs/icons/pnk.svg";
import SnapshotIcon from "svgs/icons/snapshot-color.svg";
import TelegramIcon from "svgs/socialmedia/telegram.svg";

import { IElement } from "../pages/Home/Community/Element";

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
    title: "Kleros Forum",
    link: "https://forum.kleros.io/",
  },

  {
    Icon: SnapshotIcon,
    title: "Vote on proposals",
    link: "https://snapshot.org/#/kleros.eth/",
  },
  {
    Icon: StyledTelegramIcon,
    title: "Community Calls",
    link: "https://t.me/kleros",
    primaryText: "Wednesday, 18h UTC",
  },
  {
    Icon: FrenchFlagIcon,
    title: "Join the Coopérative",
    link: "https://kleros.io/coop/",
  },
];
