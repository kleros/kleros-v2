import React, { lazy, Suspense } from "react";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { getAllowedAttachmentUrl } from "utils/urlValidation";

import { ExternalLink } from "components/ExternalLink";
import Loader from "components/Loader";
import NewTabIcon from "components/StyledIcons/NewTabIcon";

import Header from "./Header";

const FileViewer = lazy(() => import("@kleros/ui-components-library").then((m) => ({ default: m.FileViewer })));

const AttachmentDisplay: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const url = searchParams.get("url");
  const safeUrl = url ? getAllowedAttachmentUrl(url) : null;
  const titleKey = searchParams.get("title");
  const title = titleKey ? t(titleKey) : t("misc.attachment");
  return (
    <div className="w-full bg-klerosUIComponentsLightBackground p-[calc(24px_+_(136_-_24)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_875)] pt-[calc(32px_+_(48_-_32)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_875)] pb-[calc(76px_+_(96_-_76)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_875)] max-w-[1400px] m-[0_auto]">
      <div className="w-full flex flex-col gap-2">
        <Header {...{ title }} />
        {safeUrl ? (
          <>
            <ExternalLink to={safeUrl} rel="noreferrer" target="_blank" className="flex items-center self-end gap-2">
              {t("misc.open_in_new_tab")} <NewTabIcon />
            </ExternalLink>
            <Suspense
              fallback={
                <div className="w-full flex justify-center">
                  <Loader width={"48px"} height={"48px"} />
                </div>
              }
            >
              <FileViewer url={safeUrl} />
            </Suspense>
          </>
        ) : null}

        {url && !safeUrl ? (
          <div className="flex flex-col gap-1">
            <small className="text-klerosUIComponentsSecondaryText font-semibold">{t("errors.invalid_link")}</small>
            <div className="bg-klerosUIComponentsLightGrey border border-solid border-klerosUIComponentsStroke rounded-[4px] p-3 break-all">
              <code className="text-klerosUIComponentsSecondaryText text-[13px] [font-family:monospace]">{url}</code>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AttachmentDisplay;
