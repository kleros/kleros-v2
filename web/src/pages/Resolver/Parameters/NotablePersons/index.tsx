import React from "react";

import { useTranslation } from "react-i18next";

import { useNewDisputeContext } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";

import PlusMinusField from "components/PlusMinusField";
import Header from "pages/Resolver/Header";

import NavigationButtons from "../../NavigationButtons";

import PersonFields from "./PersonFields";

const NotablePersons: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, setDisputeData } = useNewDisputeContext();

  //value here is the total number of fields-
  const updateNumberOfAliases = (value: number) => {
    const defaultAlias = { name: "", address: "", id: value.toString() };
    const aliases = disputeData.aliasesArray;

    if (isUndefined(aliases)) {
      return setDisputeData({ ...disputeData, aliasesArray: [defaultAlias] });
    }
    if (value < aliases?.length) return setDisputeData({ ...disputeData, aliasesArray: aliases.splice(0, value) });
    if (value > aliases?.length) return setDisputeData({ ...disputeData, aliasesArray: [...aliases, defaultAlias] });
  };

  return (
    <div className="flex flex-col items-center">
      <Header text={t("headers.notable_persons")} />
      <PersonFields />
      <PlusMinusField
        currentValue={disputeData.aliasesArray?.length ?? 2}
        updateValue={updateNumberOfAliases}
        minValue={1}
        className="[align-self:start]"
      />
      <NavigationButtons prevRoute="/resolver/voting-options" nextRoute="/resolver/policy" />
    </div>
  );
};
export default NotablePersons;
