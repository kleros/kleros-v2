import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import Arrow from "svgs/icons/arrow-left.svg";
import PaperClip from "svgs/icons/paperclip.svg";

const Header: React.FC<{ title: string }> = ({ title }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const disputeId = searchParams.get("disputeId");
  const titleKey = searchParams.get("title");

  const handleReturn = () => {
    if (titleKey === "misc.evidence_file") {
      navigate(`/cases/${disputeId}/evidence`);
    } else if (titleKey === "misc.case_policy" || titleKey === "misc.dispute_policy") {
      navigate(`/cases/${disputeId}/overview`);
    } else if (titleKey === "misc.policy_file") {
      navigate(`/resolver/policy`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="w-full flex justify-between items-center mb-4">
      <div className="flex flex-row items-center gap-2">
        <PaperClip className="w-[calc(16px_+_(24_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] h-[calc(16px_+_(24_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] [&_path]:[fill:color-mix(in_srgb,_var(--klerosUIComponentsSecondaryPurple)_69.01960784313725%,_transparent)]" />
        <h1 className="m-0 text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
          {title}
        </h1>
      </div>
      <Button
        text={t("buttons.return")}
        Icon={Arrow}
        onPress={handleReturn}
        className="bg-transparent p-0 [&_.button-text]:text-klerosUIComponentsPrimaryBlue [&_.button-text]:font-normal [&_.button-svg_path]:fill-klerosUIComponentsPrimaryBlue [&:focus]:bg-transparent [&:focus_.button-svg_path]:fill-klerosUIComponentsSecondaryBlue [&:focus_.button-text]:text-klerosUIComponentsSecondaryBlue [&:hover]:bg-transparent [&:hover_.button-svg_path]:fill-klerosUIComponentsSecondaryBlue [&:hover_.button-text]:text-klerosUIComponentsSecondaryBlue"
      />
    </div>
  );
};

export default Header;
