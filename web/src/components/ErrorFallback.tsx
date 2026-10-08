import React from "react";

import { FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";

import { Button } from "@kleros/ui-components-library";

import ErrorIcon from "svgs/icons/warning-outline.svg";

import { cn } from "utils/cn";

import HeroImage from "./HeroImage";

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const { t } = useTranslation();
  // eslint-disable-next-line no-console
  console.log("Error:", { error });

  return (
    <>
      <HeroImage />
      <div
        className={cn(
          "w-full h-[100vh] bg-klerosUIComponentsLightBackground",
          "p-[calc(32px_+_(80_-_32)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_calc(24px_+_(136_-_24)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_calc(76px_+_(96_-_76)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
          "max-w-[1400px] m-[0_auto]"
        )}
      >
        <div className="flex w-full gap-[48px_16px] flex-col justify-center items-center lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-8 items-center flex-1 lg:[align-items:start]">
            <div className="[&_svg]:w-[64px] [&_svg]:h-[64px] [&_svg_path]:fill-klerosUIComponentsError">
              <ErrorIcon />
            </div>
            <h1 className="m-0 text-center [white-space:pre-line] lg:text-left">{t("errors.something_went_wrong")}</h1>
            <h3 className="m-0 text-center [white-space:pre-line] lg:text-left max-w-[735px]">
              {t("errors.reload_or_contact")}
            </h3>
            <div className="flex gap-4">
              <Button text={t("buttons.reload")} onPress={resetErrorBoundary} />
              <a href={"https://t.me/kleros"} target="_blank" rel="noreferrer">
                <Button text={t("buttons.contact_us")} />
              </a>
            </div>
          </div>
          <div className="[&_svg]:w-[250px] [&_svg]:h-[250px] [&_svg_path]:fill-klerosUIComponentsWhiteBackground">
            <ErrorIcon />
          </div>
        </div>
      </div>
    </>
  );
};

export default ErrorFallback;
