"use client";
import React from "react";

import SecuredByKlerosLogo from "svgs/footer/secured-by-kleros.svg";

import { socialmedia } from "consts/socialmedia";
import { cn } from "utils/cn";

const SecuredByKleros: React.FC = () => (
  <a className="min-h-6" href="https://kleros.io" target="_blank" rel="noreferrer">
    <SecuredByKlerosLogo />
  </a>
);

const SocialMedia = () => (
  <div
    className={cn(
      "flex justify-center gap-4 [&_a]:inline-block [&_svg]:size-4 [&_svg]:max-h-4 [&_svg]:max-w-4",
      "[&_svg]:fill-white"
    )}
  >
    {Object.values(socialmedia).map((site, i) => (
      <a key={i} href={site.url} target="_blank" rel="noreferrer">
        {site.icon}
      </a>
    ))}
  </div>
);

const Footer: React.FC = () => (
  <div
    className={cn(
      "flex h-[122px] w-full flex-col items-center justify-center gap-6",
      "bg-klerosUIComponentsPrimaryPurple px-8 pb-2 lg:h-16 lg:flex-row lg:justify-between lg:pb-0"
    )}
  >
    <SecuredByKleros />
    <SocialMedia />
  </div>
);

export default Footer;
