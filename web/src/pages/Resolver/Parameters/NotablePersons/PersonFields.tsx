import React, { useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";
import { usePublicClient } from "wagmi";

import { AliasArray, useNewDisputeContext } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";
import { validateAddress } from "utils/validateAddressOrEns";

import LabeledInput from "components/LabeledInput";

const PersonFields: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const publicClient = usePublicClient({ chainId: 1 });
  const { t } = useTranslation();

  const debounceValidateAddress = (address: string, key: number) => {
    if (isUndefined(publicClient)) return;
    // Clear the existing timer
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    // Set a new timer for validation after 500 milliseconds
    validationTimerRef.current = setTimeout(async () => {
      const isValid = await validateAddress(address, publicClient);
      const updatedAliases = disputeData.aliasesArray;
      if (isUndefined(updatedAliases) || isUndefined(updatedAliases[key])) return;
      updatedAliases[key].isValid = isValid;

      setDisputeData({ ...disputeData, aliasesArray: updatedAliases });
    }, 500);
  };

  // in case of duplicate creation flow, aliasesArray will already be populated.
  // validating addresses in case it is
  useEffect(() => {
    if (disputeData.aliasesArray && publicClient) {
      disputeData.aliasesArray.map(async (alias, key) => {
        const isValid = await validateAddress(alias.address, publicClient);
        const updatedAliases = disputeData.aliasesArray;
        if (isUndefined(updatedAliases) || isUndefined(updatedAliases[key])) return;
        updatedAliases[key].isValid = isValid;

        setDisputeData({ ...disputeData, aliasesArray: updatedAliases });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAliasesWrite = (key: number, field: "name" | "address", value: string) => {
    const aliases = disputeData.aliasesArray;
    if (isUndefined(aliases)) return;

    aliases[key] = { ...aliases[key], [field]: value };
    setDisputeData({ ...disputeData, aliasesArray: aliases });

    //since resolving ens is async, we update asynchronously too with debounce
    if (field === "address") debounceValidateAddress(value, key);
  };

  const showError = (alias: AliasArray) => {
    return alias.address !== "" && !alias.isValid;
  };

  return (
    <div className="flex flex-col gap-12 w-[84vw] lg:w-[calc(442px_+_(700_-_442)_*_(min(max(100vw,_900px),_1250px)_-_900px)_/_(350))]">
      {disputeData.aliasesArray?.map((alias, index) => (
        <div key={alias?.id} className="flex flex-col gap-7.5 w-full lg:grid lg:[grid-template-columns:190px_auto]">
          <LabeledInput
            label={t("forms.labels.person_number", { number: index + 1 })}
            placeholder={t("forms.placeholders.alice_developer_example")}
            value={alias.name}
            onChange={(value) => handleAliasesWrite(index, "name", value)}
          />
          <LabeledInput
            label={t("forms.labels.person_address", { index: index + 1 })}
            variant={showError(alias) ? "error" : undefined}
            message={showError(alias) ? t("forms.messages.invalid_address_or_ens") : ""}
            placeholder={t("forms.placeholders.alice_eth_example")}
            value={alias.address}
            onChange={(value) => handleAliasesWrite(index, "address", value)}
          />
        </div>
      ))}
    </div>
  );
};
export default PersonFields;
