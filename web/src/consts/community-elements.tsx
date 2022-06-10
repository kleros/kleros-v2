import React from "react";
import styled, { css } from "styled-components";
import { IElement } from "../pages/home/Community/Element";
import PNKIcon from "svgs/icons/pnk.svg";
import SnapshotIcon from "svgs/icons/snapshot-color.svg";
import FrenchFlagIcon from "svgs/icons/french-flag.svg";
import PhoneIcon from "svgs/icons/phone.svg";
import ChatIcon from "svgs/icons/chat.svg";
import DiscordIcon from "svgs/socialmedia/discord.svg";
import TelegramIcon from "svgs/socialmedia/telegram.svg";
import SlackIcon from "svgs/socialmedia/slack.svg";

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

const StyledPhoneIcon = styled(PhoneIcon)`
  ${fillWithSecondaryPurple}
`;

const StyledChatIcon = styled(ChatIcon)`
  ${fillWithSecondaryPurple}
`;

const fillWithPrimaryBlue = css`
  fill: ${({ theme }) => theme.primaryBlue};
`;

const StyledDiscordIcon = styled(DiscordIcon)`
  ${fillWithPrimaryBlue}
`;

const StyledTelegramIcon = styled(TelegramIcon)`
  ${fillWithPrimaryBlue}
`;

const StyledSlackIcon = styled(SlackIcon)`
  ${fillWithPrimaryBlue}
`;

export const firstSection: IElement[] = [
  {
    Icon: StyledPNKIcon,
    primaryText: "Join the discussions",
    urls: [
      {
        node: <StyledLabel>Kleros Forum</StyledLabel>,
        link: "https://google.com",
      },
    ],
  },
  {
    Icon: SnapshotIcon,
    primaryText: "Vote on proposals",
    urls: [
      {
        node: <StyledLabel>Snapshot</StyledLabel>,
        link: "https://google.com",
      },
    ],
  },
  {
    Icon: FrenchFlagIcon,
    urls: [
      {
        node: <StyledLabel>Cooperative Kleros</StyledLabel>,
        link: "https://google.com",
      },
    ],
  },
];

export const secondSection: IElement[] = [
  {
    Icon: StyledPhoneIcon,
    primaryText: "Join the Community Call",
    urls: [
      {
        node: <StyledLabel>Join</StyledLabel>,
        link: "https://google.com",
      },
    ],
  },
  {
    Icon: StyledChatIcon,
    primaryText: "Talk with us",
    urls: [
      {
        node: <StyledDiscordIcon />,
        link: "https://google.com",
      },
      {
        node: <StyledTelegramIcon />,
        link: "https://google.com",
      },
      {
        node: <StyledSlackIcon />,
        link: "https://google.com",
      },
    ],
  },
];
