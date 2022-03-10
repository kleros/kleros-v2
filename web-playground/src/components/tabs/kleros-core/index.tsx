import React from "react";
import styled from "styled-components";
import DisputesTable from "./disputes-table";
import JurorsTable from "./jurors-table";
import DisputeID from "./dispute-id";
import { useKlerosCoreDisputesInfoQuery } from "queries/useKlerosCoreDisputesQuery";
import {
  useKlerosCoreUniqueJurorsQuery,
  useKlerosCoreTokenAndETHShiftQuery,
} from "queries/useKlerosCoreJurorsQuery";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  overflow: auto;
`;

const KlerosCore: React.FC = () => {
  const { data, isLoading } = useKlerosCoreDisputesInfoQuery();
  const jurors = useKlerosCoreUniqueJurorsQuery();
  const { data: shifts } = useKlerosCoreTokenAndETHShiftQuery();
  return (
    <Wrapper>
      <DisputeID {...{ data, isLoading }} />
      <DisputesTable {...{ data }} />
      <JurorsTable {...{ jurors, shifts }} />
    </Wrapper>
  );
};

export default KlerosCore;
