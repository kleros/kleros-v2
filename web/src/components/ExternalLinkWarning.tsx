import React from "react";

import { useTranslation } from "react-i18next";
import Modal from "react-modal";

import { Button } from "@kleros/ui-components-library";

import WarningIcon from "svgs/icons/warning-outline.svg";

import { cn } from "utils/cn";

const Overlay = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(function Overlay(
  { className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      className={cn("fixed top-0 left-0 right-0 bottom-0 [background-color:rgba(0,_0,_0,_0.5)] z-10001", className)}
    />
  );
});

interface IExternalLinkWarning {
  isOpen: boolean;
  /** Sanitized URL used for navigation. */
  sanitizedUrl: string;
  /** Raw URL, un-sanitized */
  originalUrl: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ExternalLinkWarning: React.FC<IExternalLinkWarning> = ({
  isOpen,
  sanitizedUrl,
  originalUrl,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      overlayElement={(props, contentElement) => <Overlay {...props}>{contentElement}</Overlay>}
      ariaHideApp={false}
      role="dialog"
      aria-labelledby="external-link-title"
      aria-describedby="external-link-description"
      className={cn(
        "absolute top-[50%] left-[50%] right-auto bottom-auto mr-[-50%] [transform:translate(-50%,_-50%)]",
        "h-auto max-h-[90vh] w-[min(90%,_480px)] border border-solid border-klerosUIComponentsStroke",
        "rounded-[8px] bg-klerosUIComponentsWhiteBackground p-8 [box-shadow:0_4px_16px_rgba(0,_0,_0,_0.1)]",
        "z-10002 overflow-y-auto"
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <WarningIcon className="w-[24px] h-[24px] fill-klerosUIComponentsWarning" />
        <h3 id="external-link-title" className="text-klerosUIComponentsPrimaryText text-[18px] font-semibold m-0">
          {t("popups.external_link_warning")}
        </h3>
      </div>

      <p
        id="external-link-description"
        className="text-klerosUIComponentsPrimaryText text-[14px] leading-[1.5] m-[0_0_16px_0]"
      >
        {t("popups.external_link_message")}
      </p>

      <div className="flex flex-col gap-4 m-[16px_0]">
        <div className="flex flex-col gap-1">
          <small className="text-klerosUIComponentsSecondaryText font-semibold">{t("popups.original_url")}</small>
          <div
            className={cn(
              "bg-klerosUIComponentsLightGrey border border-solid border-klerosUIComponentsStroke rounded-[4px] p-3",
              "break-all"
            )}
          >
            <code className="text-klerosUIComponentsSecondaryText text-[13px] [font-family:monospace]">
              {originalUrl}
            </code>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <small className="text-klerosUIComponentsSecondaryText font-semibold">
            {t("popups.destination_url_sanitized")}
          </small>
          <div
            className={cn(
              "bg-klerosUIComponentsLightGrey border border-solid border-klerosUIComponentsStroke rounded-[4px] p-3",
              "break-all"
            )}
          >
            <code className="text-klerosUIComponentsSecondaryText text-[13px] [font-family:monospace]">
              {sanitizedUrl}
            </code>
          </div>
        </div>
      </div>

      <p className="text-klerosUIComponentsPrimaryText text-[14px] leading-[1.5] m-[0_0_16px_0]">
        <strong>{t("popups.safety_tips")}</strong>
        <br />
        {t("popups.verify_domain")}
        <br />
        {t("popups.check_suspicious")}
        <br />
        {t("popups.trust_destination")}
      </p>

      <div className="flex gap-3 justify-center flex-wrap mt-6 lg:justify-end">
        <Button
          text={t("buttons.cancel")}
          onPress={onCancel}
          className={cn(
            "bg-klerosUIComponentsWhiteBackground border border-solid border-klerosUIComponentsStroke",
            "[&_p]:text-klerosUIComponentsPrimaryText! [&:hover]:bg-klerosUIComponentsMediumBlue"
          )}
        />
        <Button
          text={t("buttons.continue_to_external_site")}
          onPress={onConfirm}
          className={cn(
            "bg-klerosUIComponentsWarning text-klerosUIComponentsWhiteBackground",
            "border border-solid border-klerosUIComponentsWarning",
            "[&:hover]:[background-color:color-mix(in_srgb,_var(--klerosUIComponentsWarning)_73.33333333333333%,_transparent)]"
          )}
        />
      </div>
    </Modal>
  );
};

export default ExternalLinkWarning;
