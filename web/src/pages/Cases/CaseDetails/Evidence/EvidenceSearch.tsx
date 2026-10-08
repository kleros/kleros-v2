import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import { Button, Searchbar } from "@kleros/ui-components-library";

import { isUndefined } from "src/utils";

import { EnsureChain } from "components/EnsureChain";

import SubmitEvidenceModal from "./SubmitEvidenceModal";

interface IEvidenceSearch {
  search?: string;
  setSearch: (search: string) => void;
}

const EvidenceSearch: React.FC<IEvidenceSearch> = ({ search, setSearch }) => {
  const { t } = useTranslation();
  const { id: disputeId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address } = useAccount();

  return (
    <>
      {!isUndefined(disputeId) && (
        <SubmitEvidenceModal isOpen={isModalOpen} close={() => setIsModalOpen(false)} {...{ disputeId }} />
      )}

      <div className="w-full flex flex-wrap items-center gap-[calc(16px_+_(28_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
        <Searchbar
          dir="auto"
          aria-label={t("forms.placeholders.search_evidence")}
          placeholder={t("forms.placeholders.search_evidence")}
          onChange={setSearch}
          value={search}
          className="min-w-[220px] flex-1"
        />

        <EnsureChain>
          <Button
            text={t("buttons.submit_evidence")}
            isDisabled={typeof address === "undefined" || isModalOpen}
            isLoading={isModalOpen}
            onPress={() => setIsModalOpen(true)}
            className="self-end"
          />
        </EnsureChain>
      </div>
    </>
  );
};

export default EvidenceSearch;
