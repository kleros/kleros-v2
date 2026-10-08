import React, { useRef, useEffect } from "react";

import { useTranslation } from "react-i18next";

import { TextField } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";

import Header from "pages/Resolver/Header";

import NavigationButtons from "../NavigationButtons";

const Title: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWrite = (value: string) => {
    setDisputeData({ ...disputeData, title: value });
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
    <div ref={containerRef} className="flex flex-col items-center lg:pb-60">
      <Header text={t("headers.choose_a_title")} />
      <TextField
        aria-label={t("aria_labels.case_title")}
        inputProps={{ dir: "auto" }}
        onChange={handleWrite}
        placeholder={t("forms.placeholders.alice_bob_example")}
        value={disputeData.title}
        data-testId="resolver-title-input"
        className="w-[84vw] lg:w-[calc(442px_+_(700_-_442)_*_(min(max(100vw,_900px),_1250px)_-_900px)_/_(350))]"
      />
      <NavigationButtons prevRoute="" nextRoute="/resolver/description" />
    </div>
  );
};

export default Title;
