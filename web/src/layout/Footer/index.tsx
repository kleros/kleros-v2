import React from "react";

import SecuredByKlerosLogo from "svgs/footer/secured-by-kleros.svg";

import { socialmedia } from "consts/socialmedia";
import { cn } from "utils/cn";

import { ExternalLink } from "components/ExternalLink";
import LightButton from "components/LightButton";

const SecuredByKleros: React.FC = () => (
  <ExternalLink to="https://kleros.io" target="_blank" rel="noreferrer">
    <SecuredByKlerosLogo
      className={cn(
        "[transition:0.1s] min-h-[24px]",
        "[&_path]:[fill:color-mix(in_srgb,_var(--klerosUIComponentsWhite)_74.90196078431373%,_transparent)]",
        "[&:hover_path]:fill-klerosUIComponentsWhite"
      )}
    />
  </ExternalLink>
);

const SocialMedia = () => (
  <div className="flex [&_.button-svg]:mr-0 lg:-mr-2">
    {Object.values(socialmedia).map((site) => (
      <ExternalLink key={site.url} to={site.url} target="_blank" rel="noreferrer">
        <LightButton Icon={site.icon} text="" />
      </ExternalLink>
    ))}
  </div>
);

const Footer: React.FC = () => (
  <div className="flex w-full justify-center bg-klerosUIComponentsPrimaryPurple dark:bg-klerosUIComponentsLightBlue">
    <div
      className={cn(
        "w-full max-w-[1400px] min-h-[114px] flex flex-col justify-center items-center p-[8px_16px] gap-4",
        "lg:min-h-[64px] lg:flex-row lg:justify-between",
        "lg:p-[0_calc(0px_+_(132_-_0)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]"
      )}
    >
      <SecuredByKleros />
      <SocialMedia />
    </div>
  </div>
);

export default Footer;
