import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useAccount } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import { EMAIL_REGEX } from "consts/index";
import { useAtlasProvider } from "context/AtlasProvider";

import { responsiveSize } from "styles/responsiveSize";

import { ISettings } from "../../../../index";

import EmailVerificationInfo from "./EmailVerificationInfo";
import FormContact from "./FormContact";

const FormContainer = styled.form`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 ${responsiveSize(12, 32, 300)};
  padding-bottom: 16px;
  gap: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
`;

const FormContactContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
`;

const FormContactDetails: React.FC<ISettings> = ({ toggleIsSettingsOpen }) => {
  const [emailInput, setEmailInput] = useState<string>("");
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);
  const { address } = useAccount();
  const { user, isAddingUser, isFetchingUser, addUser, updateEmail, isUpdatingUser, userExists } = useAtlasProvider();

  const isEditingEmail = user?.email !== emailInput;

  useEffect(() => {
    if (!user || !userExists) return;

    setEmailInput(user.email);
  }, [user, userExists]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address) {
      throw new Error("Missing address");
    }

    // if user exists then update email
    if (userExists) {
      const data = {
        newEmail: emailInput,
      };
      updateEmail(data)
        .then(async (res) => {
          if (res) {
            toggleIsSettingsOpen();
          }
        })
        .catch((err) => console.log(err));
    } else {
      const data = {
        email: emailInput,
      };
      addUser(data)
        .then(async (res) => {
          if (res) {
            toggleIsSettingsOpen();
          }
        })
        .catch((err) => console.log(err));
    }
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
        <Button
          text="Save"
          disabled={!isEditingEmail || !emailIsValid || isAddingUser || isFetchingUser || isUpdatingUser}
        />
      </ButtonContainer>
      <EmailVerificationInfo toggleIsSettingsOpen={toggleIsSettingsOpen} />
    </FormContainer>
  );
};

export default FormContactDetails;
