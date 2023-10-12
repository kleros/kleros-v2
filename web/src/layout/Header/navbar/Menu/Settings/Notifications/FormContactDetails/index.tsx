import React, { useState } from "react";
import styled from "styled-components";
import { useWalletClient, useAccount } from "wagmi";
import { Button } from "@kleros/ui-components-library";
import { uploadSettingsToSupabase } from "utils/uploadSettingsToSupabase";
import FormContact from "./FormContact";
import messages from "../../../../../../../consts/eip712-messages";
import { EMAIL_REGEX, TELEGRAM_REGEX } from "../../../../../../../consts/index";
import { ISettings } from "../../../index";

const FormContainer = styled.form`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 calc(12px + (32 - 12) * ((100vw - 300px) / (1250 - 300)));
  padding-bottom: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
`;

const FormContactContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const FormContactDetails: React.FC<ISettings> = ({ toggleIsSettingsOpen }) => {
  const [telegramInput, setTelegramInput] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [telegramIsValid, setTelegramIsValid] = useState<boolean>(false);
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  // TODO: after the user is authenticated, retrieve the current email/telegram from the database and populate the form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address) {
      throw new Error("Missing address");
    }
    const nonce = new Date().getTime().toString();
    const signature = await walletClient?.signTypedData(
      messages.contactDetails(address, nonce, telegramInput, emailInput)
    );
    if (!signature) {
      throw new Error("Missing signature");
    }
    const data = {
      email: emailInput,
      telegram: telegramInput,
      nonce,
      address,
      signature,
    };
    const response = await uploadSettingsToSupabase(data);
    if (response.ok) {
      toggleIsSettingsOpen();
    }
  };
  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormContactContainer>
        <FormContact
          contactLabel="Telegram"
          contactPlaceholder="@my_handle"
          contactInput={telegramInput}
          contactIsValid={telegramIsValid}
          setContactInput={setTelegramInput}
          setContactIsValid={setTelegramIsValid}
          validator={TELEGRAM_REGEX}
        />
      </FormContactContainer>
      <FormContactContainer>
        <FormContact
          contactLabel="Email"
          contactPlaceholder="your.email@email.com"
          contactInput={emailInput}
          contactIsValid={emailIsValid}
          setContactInput={setEmailInput}
          setContactIsValid={setEmailIsValid}
          validator={EMAIL_REGEX}
        />
      </FormContactContainer>

      <ButtonContainer>
        <Button text="Save" disabled={!emailIsValid && !telegramIsValid} />
      </ButtonContainer>
    </FormContainer>
  );
};

export default FormContactDetails;
