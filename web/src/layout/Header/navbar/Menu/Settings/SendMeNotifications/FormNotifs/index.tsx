import React, { useState } from "react";
import styled from "styled-components";
import { useWalletClient, useAccount } from "wagmi";
import { Checkbox, Button } from "@kleros/ui-components-library";
import { uploadSettingsToSupabase } from "utils/uploadSettingsToSupabase";
import FormEmail from "./FormEmail";

const FormContainer = styled.form`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 calc(12px + (32 - 12) * ((100vw - 300px) / (1250 - 300)));
  padding-bottom: 16px;
`;

const StyledCheckbox = styled(Checkbox)`
  margin-top: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
  margin-top: 16px;
`;

const FormEmailContainer = styled.div`
  position: relative;
`;

const OPTIONS = [{ label: "When x." }, { label: "When y." }, { label: "When z." }, { label: "When w." }];

const FormNotifs: React.FC = () => {
  const [checkboxStates, setCheckboxStates] = useState<boolean[]>(new Array(OPTIONS.length).fill(false));
  const [emailInput, setEmailInput] = useState<string>("");
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const handleCheckboxChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckboxStates = [...checkboxStates];
    newCheckboxStates[index] = e.target.checked;
    setCheckboxStates(newCheckboxStates);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nonce = new Date().getTime();
    const message = `Email:${emailInput},Nonce:${nonce}`;
    const signature = await walletClient?.signMessage({
      account: address,
      message: message,
    });
    const data = {
      message: message,
      address,
      signature: signature,
    };

    await uploadSettingsToSupabase(data);
  };
  return (
    <FormContainer onSubmit={handleSubmit}>
      {OPTIONS.map(({ label }, index) => (
        <StyledCheckbox
          key={label}
          onChange={handleCheckboxChange(index)}
          checked={checkboxStates[index]}
          small={true}
          label={label}
        />
      ))}
      <FormEmailContainer>
        <FormEmail
          emailInput={emailInput}
          emailIsValid={emailIsValid}
          setEmailInput={setEmailInput}
          setEmailIsValid={setEmailIsValid}
        />
      </FormEmailContainer>

      <ButtonContainer>
        <Button text="Save" disabled={!emailIsValid} />
      </ButtonContainer>
    </FormContainer>
  );
};

export default FormNotifs;
