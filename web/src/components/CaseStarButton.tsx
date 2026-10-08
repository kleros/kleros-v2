import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { Button, Tooltip } from "@kleros/ui-components-library";

import Star from "svgs/icons/star.svg";

import useIsDesktop from "hooks/useIsDesktop";
import useStarredCases from "hooks/useStarredCases";
import { cn } from "utils/cn";

const CaseStarButton: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useTranslation();
  const { starredCases, starCase } = useStarredCases();
  const isDesktop = useIsDesktop();
  const starred = useMemo(() => Boolean(starredCases.has(id)), [id, starredCases]);
  const text = starred ? t("misc.remove_from_favorites") : t("misc.add_to_favorites");
  return (
    <Tooltip {...{ text }} place={isDesktop ? "right" : "bottom"}>
      <Button
        className={cn(
          "bg-transparent p-0 pb-0.5 hover:bg-transparent [&_.button-svg]:m-0 [&_.button-svg]:size-6",
          "[&_.button-svg_path]:stroke-klerosUIComponentsSecondaryPurple",
          starred ? "[&_.button-svg]:fill-klerosUIComponentsSecondaryPurple" : "[&_.button-svg]:fill-none"
        )}
        Icon={Star}
        text=""
        aria-label={text}
        aria-checked={starred}
        onPress={() => {
          starCase(id);
        }}
      />
    </Tooltip>
  );
};

export default CaseStarButton;
