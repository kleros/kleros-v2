import React, { useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import { Button, Searchbar } from "@kleros/ui-components-library";

import { isUndefined } from "src/utils";

import { responsiveSize } from "styles/responsiveSize";

import { EnsureChain } from "components/EnsureChain";

import SubmitEvidenceModal from "./SubmitEvidenceModal";

const SearchContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${responsiveSize(16, 28)};
`;

const StyledSearchBar = styled(Searchbar)`
  min-width: 220px;
  flex: 1;
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
`;

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

      <SearchContainer>
        <StyledSearchBar
          dir="auto"
          placeholder={t("forms.placeholders.search_evidence")}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />

        <EnsureChain>
          <StyledButton
            text={t("buttons.submit_evidence")}
            disabled={typeof address === "undefined" || isModalOpen}
            isLoading={isModalOpen}
            onClick={() => setIsModalOpen(true)}
          />
        </EnsureChain>
      </SearchContainer>
    </>
  );
};

export default EvidenceSearch;
