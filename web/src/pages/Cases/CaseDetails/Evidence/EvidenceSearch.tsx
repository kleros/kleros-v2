import React, { useState } from "react";
import styled from "styled-components";

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
  evidenceGroup?: bigint;
}

const EvidenceSearch: React.FC<IEvidenceSearch> = ({ search, setSearch, evidenceGroup }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address } = useAccount();

  return (
    <>
      {!isUndefined(evidenceGroup) && (
        <SubmitEvidenceModal isOpen={isModalOpen} close={() => setIsModalOpen(false)} {...{ evidenceGroup }} />
      )}

      <SearchContainer>
        <StyledSearchBar
          placeholder="Search evidence by number, word, or submitter."
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />

        <EnsureChain>
          <StyledButton
            text="Submit Evidence"
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
