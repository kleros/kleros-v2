import React, { useEffect } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import { DisplaySmall, NumberField } from "@kleros/ui-components-library";

import ETH from "svgs/icons/eth.svg";

import { DEFAULT_CHAIN } from "consts/chains";
import { REFETCH_INTERVAL } from "consts/index";
import { useNewDisputeContext } from "context/NewDisputeContext";
import { useReadKlerosCoreArbitrationCost } from "hooks/contracts/generated";
import { formatETH } from "utils/format";
import { isUndefined } from "utils/index";

import { DisputeKits } from "src/dispute-kits";
import { prepareArbitratorExtradata } from "src/dispute-kits/prepareArbitratorExtradata";

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

const StyledField = styled(NumberField)`
  width: 290px;
  margin-bottom: ${responsiveSize(20, 48)};
`;

const StyledDisplay = styled(DisplaySmall)`
  width: 290px;
  margin-bottom: ${responsiveSize(20, 48)};

  h2 {
    margin: 0;
    ::after {
      content: "ETH";
      margin-left: 4px;
    }
  }

  path {
    fill: ${({ theme }) => theme.secondaryPurple};
  }
`;

const Jurors: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const { data } = useReadKlerosCoreArbitrationCost({
    query: {
      enabled: !isUndefined(disputeData.numberOfJurors) && !Number.isNaN(disputeData.numberOfJurors),
      refetchInterval: REFETCH_INTERVAL,
    },
    args: [
      prepareArbitratorExtradata(
        disputeData.courtId ?? "",
        disputeData?.numberOfJurors ?? 3,
        disputeData.disputeKitId ?? DisputeKits.Classic,
        undefined
      ),
    ],
    chainId: DEFAULT_CHAIN.id,
  });

  const arbitrationFee = formatETH(data ?? BigInt(0), 18);

  const handleJurorsWrite = (value: number | string) => {
    const parsed = typeof value === "string" ? Number.parseInt(value, 10) : value;
    const isValid = Number.isInteger(parsed) && parsed >= 1;
    // While typing, only valid counts are applied: pushing NaN back as `value` would make
    // react-aria blank the input. On commit (blur/Enter) react-aria has already clamped, and an
    // empty field arrives as NaN, which clears the count.
    if (typeof value === "string" && !isValid) return;
    const numberOfJurors = isValid ? parsed : undefined;
    if (numberOfJurors !== disputeData.numberOfJurors) setDisputeData({ ...disputeData, numberOfJurors });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setDisputeData({ ...disputeData, arbitrationCost: data?.toString() }), [data]);

  return (
    <Container>
      <Header text={t("headers.select_number_of_jurors")} />
      <StyledField
        aria-label={t("aria_labels.number_of_jurors")}
        placeholder={t("forms.placeholders.select_the_number_of_jurors")}
        value={disputeData.numberOfJurors ?? NaN}
        // react-aria's NumberField commits `onChange` on blur/Enter; the arbitration cost
        // should follow every keystroke, so also read the raw input.
        inputProps={{ onChange: (event) => handleJurorsWrite(event.currentTarget.value) }}
        onChange={handleJurorsWrite}
        formatOptions={{ useGrouping: false, maximumFractionDigits: 0 }}
        minValue={1}
      />
      <StyledDisplay text={arbitrationFee} Icon={ETH} label={t("forms.labels.arbitration_cost")} />
      <NavigationButtons prevRoute="/resolver/category" nextRoute="/resolver/voting-options" />
    </Container>
  );
};
export default Jurors;
