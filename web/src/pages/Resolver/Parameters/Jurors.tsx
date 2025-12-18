import React, { useEffect } from "react";
import styled, { css } from "styled-components";

import { DisplaySmall, Field } from "@kleros/ui-components-library";

import ETH from "svgs/icons/eth.svg";

import { DEFAULT_CHAIN } from "consts/chains";
import { REFETCH_INTERVAL } from "consts/index";
import { useNewDisputeContext } from "context/NewDisputeContext";
import { useReadKlerosCoreArbitrationCost } from "hooks/contracts/generated";
import { formatETH } from "utils/format";
import { isUndefined } from "utils/index";
import { prepareArbitratorExtradata } from "utils/prepareArbitratorExtradata";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import Header from "pages/Resolver/Header";

import NavigationButtons from "../NavigationButtons";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${landscapeStyle(
    () => css`
      padding-bottom: 79px;
    `
  )}
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

  path {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const Jurors: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const { data } = useReadKlerosCoreArbitrationCost({
    query: {
      enabled: !isUndefined(disputeData.numberOfJurors) && !Number.isNaN(disputeData.numberOfJurors),
      refetchInterval: REFETCH_INTERVAL,
    },
    args: [prepareArbitratorExtradata(disputeData.courtId ?? "", disputeData?.numberOfJurors ?? 0)],
    chainId: DEFAULT_CHAIN,
  });

  const arbitrationFee = formatETH(data ?? BigInt(0), 18);

  useEffect(() => setDisputeData({ ...disputeData, arbitrationCost: data?.toString() }), [data]);

  const handleJurorsWrite = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value.replace(/\D/g, ""), 10);
    if (isUndefined(value) || isNaN(value)) {
      setDisputeData({ ...disputeData, numberOfJurors: 0 });
    } else {
      setDisputeData({ ...disputeData, numberOfJurors: value });
    }
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
