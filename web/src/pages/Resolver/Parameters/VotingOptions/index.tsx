import React, { useRef, useEffect } from "react";

import { useTranslation } from "react-i18next";

import { AlertMessage } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";

import LabeledInput from "components/LabeledInput";
import Header from "pages/Resolver/Header";

import NavigationButtons from "../../NavigationButtons";

import OptionsFields from "./OptionsFields";

const VotingOptions: React.FC = () => {
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const handleQuestionWrite = (value: string) => {
    setDisputeData({ ...disputeData, question: value });
  };

  useEffect(() => {
    if (containerRef.current) {
      const inputElement = containerRef.current.querySelector("input");
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col items-center">
      <Header text={t("headers.voting_options")} />
      <LabeledInput
        label={t("forms.labels.question")}
        placeholder={t("forms.placeholders.how_much_alice_receive")}
        message={t("forms.messages.type_question_jurors_see")}
        variant="info"
        value={disputeData.question}
        onChange={handleQuestionWrite}
        className="mb-11"
      />
      <OptionsFields />
      <div className="w-[84vw] lg:w-[calc(442px_+_(700_-_442)_*_(min(max(100vw,_900px),_1250px)_-_900px)_/_(350))] [&_>_div]:w-full [&_h2]:m-0">
        <AlertMessage
          title={t("alerts.add_question_and_options")}
          msg={t("alerts.make_it_clear_objective")}
          variant="info"
        />
      </div>
      <NavigationButtons prevRoute="/resolver/jurors" nextRoute="/resolver/notable-persons" />
    </div>
  );
};

export default VotingOptions;
