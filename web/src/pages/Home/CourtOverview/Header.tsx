import React from "react";

import { useTranslation } from "react-i18next";

import { Button } from "@kleros/ui-components-library";

import Bookmark from "svgs/icons/bookmark.svg";

import { InternalLink } from "components/InternalLink";

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap justify-between gap-[8px_12px] mb-[calc(12px_+_(20_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
      <h1 className="text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] m-0">
        {t("misc.court_overview")}
      </h1>
      <InternalLink to={"/resolver"} className="flex h-[34px]">
        <Button small Icon={Bookmark} text={t("buttons.create_a_case")} />
      </InternalLink>
    </div>
  );
};

export default Header;
