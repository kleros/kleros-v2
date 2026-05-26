import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useDebounce } from "react-use";
import { useAccount, useBalance } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { DisputeKits, REFETCH_INTERVAL } from "consts/index";
import { useSelectedOptionContext, useFundingContext, useCountdownContext } from "hooks/useClassicAppealContext";
import { useFundAppeal } from "hooks/useFundAppeal";
import { useParsedAmount } from "hooks/useParsedAmount";
import { isUndefined } from "utils/index";
import { NumberString } from "utils/types";

import { EnsureChain } from "components/EnsureChain";
import { ErrorButtonMessage } from "components/ErrorButtonMessage";
import ClosedCircleIcon from "components/StyledIcons/ClosedCircleIcon";

import EthAmountField from "../EthAmountField";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const StyledButton = styled(Button)`
  margin: auto;
  margin-top: 4px;
`;

const StyledLabel = styled.label`
  align-self: flex-start;
`;

const useNeedFund = () => {
  const { loserSideCountdown } = useCountdownContext();
  const { fundedChoices, winningChoice } = useFundingContext();
  const needFund =
    (loserSideCountdown ?? 0) > 0 ||
    (!isUndefined(fundedChoices) &&
      !isUndefined(winningChoice) &&
      fundedChoices.length > 0 &&
      !fundedChoices.includes(winningChoice));

  return needFund;
};

interface IFund {
  amount: `${number}`;
  setAmount: (val: string) => void;
  setIsOpen: (val: boolean) => void;
  disputeKitName?: DisputeKits;
}

const Fund: React.FC<IFund> = ({ amount, setAmount, setIsOpen, disputeKitName }) => {
  const { id: disputeId } = useParams();
  const { address, isDisconnected } = useAccount();
  const { t } = useTranslation();

  const { selectedOption } = useSelectedOptionContext();
  const needFund = useNeedFund();
  const { data: balance } = useBalance({
    query: {
      refetchInterval: REFETCH_INTERVAL,
    },
    address,
  });

  const [debouncedAmount, setDebouncedAmount] = useState<NumberString>("0");
  useDebounce(() => setDebouncedAmount(amount), 500, [amount]);

  const parsedAmount = useParsedAmount(debouncedAmount as NumberString);

  const insufficientBalance = useMemo(() => {
    return balance && balance.value < parsedAmount;
  }, [balance, parsedAmount]);

  const { mutateAsync: fundAppeal, isPending } = useFundAppeal(() => {
    setIsOpen(true);
  });

  const isFundDisabled = useMemo(
    () =>
      isDisconnected ||
      !balance ||
      insufficientBalance ||
      parsedAmount <= 0n ||
      isPending ||
      isUndefined(selectedOption?.id),
    [isDisconnected, balance, insufficientBalance, parsedAmount, isPending, selectedOption]
  );

  const handleAppeal = useCallback(async () => {
    if (isUndefined(disputeId) || isUndefined(selectedOption?.id)) return;

    await fundAppeal({
      disputeId: BigInt(disputeId),
      choice: BigInt(selectedOption.id),
      fundAmount: parsedAmount,
      type: disputeKitName ?? DisputeKits.Classic,
    });
  }, [fundAppeal, disputeId, selectedOption, parsedAmount, disputeKitName]);

  return needFund ? (
    <Container>
      <StyledLabel>{t("appeal.how_much_eth_contribute")}</StyledLabel>
      <EthAmountField
        type="number"
        value={amount}
        onChange={(value) => {
          setAmount(value);
        }}
        placeholder={t("forms.placeholders.amount_to_fund")}
      />
      <EnsureChain>
        <div>
          <StyledButton
            isDisabled={isFundDisabled}
            isLoading={isPending && !insufficientBalance}
            text={isDisconnected ? t("buttons.connect_to_fund") : t("buttons.fund")}
            onPress={handleAppeal}
          />
          {insufficientBalance && (
            <ErrorButtonMessage>
              <ClosedCircleIcon /> {t("forms.messages.insufficient_balance")}
            </ErrorButtonMessage>
          )}
        </div>
      </EnsureChain>
    </Container>
  ) : null;
};

export default Fund;
