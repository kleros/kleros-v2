import React from "react";

import { useTranslation } from "react-i18next";

import { cn } from "utils/cn";

import { Group } from "src/dispute-kits/types";

import LightButton from "../LightButton";

export type GroupUI = React.FC<{ children: JSX.Element; clearAll: () => void }>;

const VotingGroup: React.FC<{ children: JSX.Element; clearAll: () => void }> = ({ children, clearAll }) => {
  const { t } = useTranslation();
  return (
    <div key={Group.Voting} className="w-full flex flex-col gap-4 [align-items:start] pb-4">
      <div className="w-full pt-4">
        <h2 className="flex text-[16px] font-semibold m-0 items-center gap-2">
          {t("misc.shielded_voting")}{" "}
          <LightButton
            text={t("buttons.clear")}
            onPress={clearAll}
            className={cn(
              "p-0! [&_.button-text]:text-klerosUIComponentsPrimaryBlue [&_.button-text]:text-[14px]",
              "[&:hover]:bg-transparent! [&:hover_.button-text]:text-klerosUIComponentsSecondaryBlue"
            )}
          />
        </h2>
        <p className="text-[14px] text-klerosUIComponentsSecondaryText p-0 m-0">
          {t("tooltips.shielded_voting_description")}
        </p>
      </div>
      {children}
    </div>
  );
};

const EligibilityGroup: React.FC<{ children: JSX.Element; clearAll: () => void }> = ({ children, clearAll }) => {
  const { t } = useTranslation();
  return (
    <div key={Group.Eligibility} className="w-full flex flex-col gap-4 [align-items:start] pb-4">
      <div className="w-full pt-4">
        <h2 className="flex text-[16px] font-semibold m-0 items-center gap-2">
          {t("misc.jurors_eligibility")}{" "}
          <LightButton
            text={t("buttons.clear")}
            onPress={clearAll}
            className={cn(
              "p-0! [&_.button-text]:text-klerosUIComponentsPrimaryBlue [&_.button-text]:text-[14px]",
              "[&:hover]:bg-transparent! [&:hover_.button-text]:text-klerosUIComponentsSecondaryBlue"
            )}
          />
        </h2>
        <p className="text-[14px] text-klerosUIComponentsSecondaryText p-0 m-0">
          {t("tooltips.jurors_eligibility_description")}
        </p>
      </div>
      {children}
    </div>
  );
};

export const GroupsUI: Record<Group, GroupUI> = {
  [Group.Voting]: VotingGroup,
  [Group.Eligibility]: EligibilityGroup,
};
