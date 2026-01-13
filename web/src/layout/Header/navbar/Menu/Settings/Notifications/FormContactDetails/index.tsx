import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import { useAtlasProvider } from "@kleros/kleros-app";
import { Button } from "@kleros/ui-components-library";

import { EMAIL_REGEX } from "consts/index";
import { timeLeftUntil } from "utils/date";
import { errorToast, infoToast, successToast } from "utils/wrapWithToast";

import { isUndefined } from "src/utils";

import { responsiveSize } from "styles/responsiveSize";

import InfoCard from "components/InfoCard";

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
`;

const StyledInfoCard = styled(InfoCard)`
  width: fit-content;
  font-size: 14px;
  margin-bottom: 8px;
  word-wrap: break-word;
`;

const FormContactDetails: React.FC<ISettings> = ({ toggleIsSettingsOpen }) => {
  const { t } = useTranslation();
  const [emailInput, setEmailInput] = useState<string>("");
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);
  const { address } = useAccount();
  const { user, isAddingUser, isFetchingUser, addUser, updateEmail, isUpdatingUser, userExists } = useAtlasProvider();

  const isEditingEmail = user?.email !== emailInput;

  const isEmailUpdateable = user?.email
    ? !isUndefined(user?.emailUpdateableAt) && new Date(user.emailUpdateableAt).getTime() < new Date().getTime()
    : true;

  useEffect(() => {
    if (!user || !userExists) return;

    setEmailInput(user.email);
  }, [user, userExists]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address) {
      return;
    }

    // if user exists then update email
    if (userExists) {
      if (!isEmailUpdateable) return;
      const data = {
        newEmail: emailInput,
      };
      infoToast(t("notifications.updating_email"));
      updateEmail(data)
        .then(async (res) => {
          if (res) {
            successToast(t("notifications.email_updated_successfully"));
            toggleIsSettingsOpen();
          }
        })
        .catch((err) => {
          console.log(err);
          errorToast(`${t("notifications.updating_email_failed")} ${err?.message}`);
        });
    } else {
      const data = {
        email: emailInput,
      };
      infoToast(t("notifications.adding_user"));
      addUser(data)
        .then(async (res) => {
          if (res) {
            successToast(t("notifications.user_added_successfully"));
            toggleIsSettingsOpen();
          }
        })
        .catch((err) => {
          console.log(err);
          errorToast(`${t("notifications.adding_user_failed")} ${err?.message}`);
        });
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
          contactLabel={t("forms.labels.email")}
          contactPlaceholder={t("forms.placeholders.email_example")}
          contactInput={emailInput}
          contactIsValid={emailIsValid}
          setContactInput={setEmailInput}
          setContactIsValid={setEmailIsValid}
          validator={EMAIL_REGEX}
          isEditing={isEditingEmail}
        />
      </FormContactContainer>
      {!isEmailUpdateable ? (
        <StyledInfoCard
          msg={t("notifications.update_email_again", { time: timeLeftUntil(user?.emailUpdateableAt!) })}
        />
      ) : null}
      <ButtonContainer>
        <Button
          text={t("buttons.save")}
          disabled={
            !isEditingEmail || !emailIsValid || isAddingUser || isFetchingUser || isUpdatingUser || !isEmailUpdateable
          }
        />
      </ButtonContainer>
      <EmailVerificationInfo toggleIsSettingsOpen={toggleIsSettingsOpen} />
    </FormContainer>
  );
};

export default FormContactDetails;
