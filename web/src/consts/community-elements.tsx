import React from "react";

import i18n from "i18next";

import FrenchFlagIcon from "svgs/icons/french-flag.svg";
import PNKIcon from "svgs/icons/pnk.svg";
import SnapshotIcon from "svgs/icons/snapshot-color.svg";
import TelegramIcon from "svgs/socialmedia/telegram.svg";

import { cn } from "utils/cn";

import { IElement } from "../pages/Home/Community/Element";

const StyledPNKIcon = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof PNKIcon>) => (
  <PNKIcon {...props} className={cn("fill-klerosUIComponentsSecondaryPurple", className)} />
);

const StyledTelegramIcon = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TelegramIcon>) => (
  <TelegramIcon {...props} className={cn("fill-klerosUIComponentsPrimaryBlue", className)} />
);

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
