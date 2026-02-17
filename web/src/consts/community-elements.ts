import styled, { css } from "styled-components";

import i18n from "i18next";

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
    get title() {
      return i18n.t("community.kleros_forum");
    },
    link: "https://forum.kleros.io/",
  },
  {
    Icon: SnapshotIcon,
    get title() {
      return i18n.t("community.vote_on_proposals");
    },
    link: "https://snapshot.org/#/kleros.eth/",
  },
  {
    Icon: StyledTelegramIcon,
    get title() {
      return i18n.t("community.community_calls");
    },
    link: "https://t.me/kleros",
    get primaryText() {
      return i18n.t("community.wednesday_18h_utc");
    },
  },
  {
    Icon: FrenchFlagIcon,
    get title() {
      return i18n.t("community.join_cooperative");
    },
    link: "https://kleros.io/coop/",
  },
];
