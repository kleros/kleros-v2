import React from "react";

import { useTranslation } from "react-i18next";

import { Card } from "@kleros/ui-components-library";

import { section } from "consts/community-elements";

import { Element } from "./Element";

const Community = () => {
  const { t } = useTranslation();

  return (
    <div className="mt-[calc(28px_+_(48_-_28)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] [&_h1]:mb-[calc(12px_+_(24_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] [&_h1]:text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
      <h1>{t("misc.community")}</h1>
      <Card className="flex w-full h-auto gap-3 flex-col flex-wrap p-4 items-start lg:flex-row lg:justify-between lg:gap-5 lg:p-[24px_32px]">
        <div className="flex flex-col items-start gap-3 lg:flex-row lg:justify-between lg:gap-12">
          {section.slice(0, 3).map((element) => (
            <Element key={element.title} {...element} />
          ))}
        </div>
        <Element {...section[3]} />
      </Card>
    </div>
  );
};

export default Community;
