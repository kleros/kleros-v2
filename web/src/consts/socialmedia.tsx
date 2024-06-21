import React from "react";

import DiscordLogo from "svgs/socialmedia/discord.svg";
import EtherscanLogo from "svgs/socialmedia/etherscan.svg";
import GhostBlogLogo from "svgs/socialmedia/ghost-blog.svg";
import GithubLogo from "svgs/socialmedia/github.svg";
import LinkedinLogo from "svgs/socialmedia/linkedin.svg";
import RedditLogo from "svgs/socialmedia/reddit.svg";
import SnapshotLogo from "svgs/socialmedia/snapshot.svg";
import TelegramLogo from "svgs/socialmedia/telegram.svg";
import XLogo from "svgs/socialmedia/x.svg";

export const socialmedia = {
  etherscan: {
    icon: <EtherscanLogo />,
    url: "",
  },
  github: {
    icon: <GithubLogo />,
    url: "https://github.com/kleros",
  },
  snapshot: {
    icon: <SnapshotLogo />,
    url: "https://snapshot.org/#/kleros.eth",
  },
  discord: {
    icon: <DiscordLogo />,
    url: "https://discord.com/invite/MhXQGCyHd9",
  },
  x: {
    icon: <XLogo />,
    url: "https://x.com/kleros_io",
  },
  reddit: {
    icon: <RedditLogo />,
    url: "https://www.reddit.com/r/Kleros/",
  },
  telegram: {
    icon: <TelegramLogo />,
    url: "https://t.me/kleros",
  },
  ghost: {
    icon: <GhostBlogLogo />,
    url: "https://blog.kleros.io/",
  },
  linkedin: {
    icon: <LinkedinLogo />,
    url: "https://www.linkedin.com/company/kleros/",
  },
};
