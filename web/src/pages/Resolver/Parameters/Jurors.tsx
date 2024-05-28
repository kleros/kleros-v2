import React, { useEffect } from "react";
import styled from "styled-components";

import { DisplaySmall, Field } from "@kleros/ui-components-library";

import ETH from "svgs/icons/eth.svg";

import { REFETCH_INTERVAL } from "consts/index";
import { useNewDisputeContext } from "context/NewDisputeContext";
import { useReadKlerosCoreArbitrationCost } from "hooks/contracts/generated";
import { formatETH } from "utils/format";
import { isUndefined } from "utils/index";
import { prepareArbitratorExtradata } from "utils/prepareArbitratorExtradata";

import { responsiveSize } from "styles/responsiveSize";

import Header from "pages/Resolver/Header";

import NavigationButtons from "../NavigationButtons";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledField = styled(Field)`
  width: 290px;
  margin-bottom: ${responsiveSize(20, 48)};
`;

const StyledDisplay = styled(DisplaySmall)`
  width: 290px;
  margin-bottom: ${responsiveSize(20, 48)};
  h2::after {
    content: "ETH";
    margin-left: 4px;
  }
`;

const Jurors: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const { data } = useReadKlerosCoreArbitrationCost({
    query: {
      enabled: !isUndefined(disputeData.numberOfJurors) && !Number.isNaN(disputeData.numberOfJurors),
      refetchInterval: REFETCH_INTERVAL,
    },
    args: [prepareArbitratorExtradata(disputeData.courtId ?? "", disputeData.numberOfJurors ?? "")],
  });

  const arbitrationFee = formatETH(data ?? BigInt(0), 5);

  useEffect(() => setDisputeData({ ...disputeData, arbitrationCost: data?.toString() }), [data]);

  const handleJurorsWrite = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisputeData({ ...disputeData, numberOfJurors: parseInt(event.target.value.replace(/\D/g, ""), 10) });
  };

  const noOfVotes = Number.isNaN(disputeData.numberOfJurors) ? "" : disputeData.numberOfJurors;

  return (
    <Container>
      <Header text="Select the number of jurors" />
      <StyledField placeholder="Select the number of jurors" value={noOfVotes} onChange={handleJurorsWrite} />
      <StyledDisplay text={arbitrationFee} Icon={ETH} label="Arbitration Cost" />
      <NavigationButtons prevRoute="/resolver/category" nextRoute="/resolver/voting-options" />
    </Container>
  );
};
export default Jurors;
