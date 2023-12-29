import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useDebounce } from "react-use";
import { useAccount } from "wagmi";
import { NumberInputField } from "components/NumberInputField";
import { useParsedAmount } from "hooks/useParsedAmount";
import { useCourtDetails } from "hooks/queries/useCourtDetails";
import { useSortitionModuleGetJurorBalance, usePnkBalanceOf } from "hooks/contracts/generated";
import StakeWithdrawButton, { ActionType } from "./StakeWithdrawButton";
import { formatPNK, roundNumberDown } from "utils/format";
import { isUndefined } from "utils/index";
import { commify, uncommify } from "utils/commify";
import { EnsureChain } from "components/EnsureChain";

const StyledField = styled(NumberInputField)`
  height: fit-content;
`;

const LabelArea = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryBlue};
  cursor: pointer;
`;

const InputArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const InputFieldAndButton = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const EnsureChainContainer = styled.div`
  button {
    height: 45px;
    border: 1px solid ${({ theme }) => theme.stroke};
  }
`;

interface IInputDisplay {
  action: ActionType;
  isSending: boolean;
  setIsSending: (arg0: boolean) => void;
  setIsPopupOpen: (arg0: boolean) => void;
  amount: string;
  setAmount: (arg0: string) => void;
}

const InputDisplay: React.FC<IInputDisplay> = ({
  action,
  isSending,
  setIsSending,
  setIsPopupOpen,
  amount,
  setAmount,
}) => {
  const [debouncedAmount, setDebouncedAmount] = useState("");
  useDebounce(() => setDebouncedAmount(amount), 500, [amount]);
  const parsedAmount = useParsedAmount(uncommify(debouncedAmount));

  const { id } = useParams();
  const { data: courtDetails } = useCourtDetails(id);
  const { address } = useAccount();
  const { data: balance } = usePnkBalanceOf({
    enabled: !isUndefined(address),
    args: [address ?? "0x"],
    watch: true,
  });
  const parsedBalance = formatPNK(balance ?? 0n, 0, true);
  const { data: jurorBalance } = useSortitionModuleGetJurorBalance({
    enabled: !isUndefined(address),
    args: [address, id],
    watch: true,
  });
  const parsedStake = formatPNK(jurorBalance?.[2] || 0n, 0, true);
  const isStaking = action === ActionType.stake;

  return (
    <>
      <LabelArea>
        <label>{`Available ${isStaking ? parsedBalance : parsedStake} PNK`}</label>
        <StyledLabel
          onClick={() => {
            const amount = isStaking ? parsedBalance : parsedStake;
            setAmount(amount);
          }}
        >
          {isStaking ? "Stake" : "Withdraw"} all
        </StyledLabel>
      </LabelArea>
      <InputArea>
        <InputFieldAndButton>
          <StyledField
            value={uncommify(amount)}
            onChange={(e) => {
              setAmount(e);
            }}
            placeholder={isStaking ? "Amount to stake" : "Amount to withdraw"}
            // message={
            //   isStaking
            //     ? `You need to stake at least ${formatPNK(courtDetails?.court.minStake ?? 0n, 3)} PNK. ` +
            //       "You may need two transactions, one to increase allowance, the other to stake."
            //     : `You need to either withdraw all or keep at least ${formatPNK(
            //         courtDetails?.court.minStake ?? 0n,
            //         3
            //       )} PNK.`
            // }
            formatter={(number: string) => commify(roundNumberDown(Number(number)))}
          />
          <EnsureChainContainer>
            <StakeWithdrawButton
              {...{
                parsedAmount,
                action,
                setAmount,
                isSending,
                setIsSending,
                setIsPopupOpen,
              }}
            />
          </EnsureChainContainer>
        </InputFieldAndButton>
      </InputArea>
    </>
  );
};

export default InputDisplay;
