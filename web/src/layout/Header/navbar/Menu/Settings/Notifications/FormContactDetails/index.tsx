import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import { Button } from "@kleros/ui-components-library";
import { uploadSettingsToSupabase } from "utils/uploadSettingsToSupabase";
import FormContact from "./FormContact";
import { EMAIL_REGEX, TELEGRAM_REGEX } from "consts/index";

import { responsiveSize } from "styles/responsiveSize";

import { ISettings } from "../../../../index";
import { useUserSettings } from "hooks/queries/useUserSettings";

const FormContainer = styled.form`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 ${responsiveSize(12, 32, 300)};
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
  const { address } = useAccount();
  const { data: userSettings, refetch: refetchUserSettings } = useUserSettings();

  const isEditingEmail = useMemo(() => {
    if (!userSettings?.email && emailInput === "") return false;
    return userSettings?.email !== emailInput;
  }, [userSettings, emailInput]);

  const isEditingTelegram = useMemo(() => {
    if (!userSettings?.telegram && telegramInput === "") return false;
    return userSettings?.telegram !== telegramInput;
  }, [userSettings, telegramInput]);

  useEffect(() => {
    refetchUserSettings();
  }, [address]);

  useEffect(() => {
    if (!userSettings) return;

    setEmailInput(userSettings.email ?? "");
    setTelegramInput(userSettings.telegram ?? "");
  }, [userSettings]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address) {
      throw new Error("Missing address");
    }

    const data = {
      email: emailInput,
      telegram: telegramInput,
      address,
    };

    uploadSettingsToSupabase(data)
      .then(async (res) => {
        if (res.ok) {
          toggleIsSettingsOpen();
          refetchUserSettings();
        }
      })
      .catch((err) => console.log(err));
  };
  return (
    <FormContainer onSubmit={handleSubmit}>
      {/* <FormContactContainer>
        <FormContact
          contactLabel="Telegram"
          contactPlaceholder="@my_handle"
          contactInput={telegramInput}
          contactIsValid={telegramIsValid}
          setContactInput={setTelegramInput}
          setContactIsValid={setTelegramIsValid}
          validator={TELEGRAM_REGEX}
          isEditing={isEditingTelegram}
        />
      </FormContactContainer> */}
      <FormContactContainer>
        <FormContact
          contactLabel="Email"
          contactPlaceholder="your.email@email.com"
          contactInput={emailInput}
          contactIsValid={emailIsValid}
          setContactInput={setEmailInput}
          setContactIsValid={setEmailIsValid}
          validator={EMAIL_REGEX}
          isEditing={isEditingEmail}
        />
      </FormContactContainer>

      <ButtonContainer>
        {/* <Button text="Save" disabled={(!isEditingEmail && !isEditingTelegram) || !emailIsValid || !telegramIsValid} /> */}
        <Button text="Save" disabled={!isEditingEmail || !emailIsValid} />
      </ButtonContainer>
    </FormContainer>
  );
};

export default FormContactDetails;
