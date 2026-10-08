import React, { useRef, useEffect } from "react";

import { useTranslation } from "react-i18next";

import { TextField } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";

import Header from "pages/Resolver/Header";

import NavigationButtons from "../NavigationButtons";

const Category: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWrite = (value: string) => {
    setDisputeData({ ...disputeData, category: value });
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
    <div ref={containerRef} className="flex flex-col items-center lg:pb-47.75">
      <Header text={t("headers.choose_a_category")} />
      <TextField
        aria-label={t("aria_labels.case_category")}
        inputProps={{ dir: "auto" }}
        onChange={handleWrite}
        value={disputeData.category}
        placeholder={t("forms.placeholders.freelance_example")}
        variant="info"
        message={t("forms.messages.type_category_tag")}
        className="w-[84vw] mb-18.5 lg:w-[calc(442px_+_(700_-_442)_*_(min(max(100vw,_900px),_1250px)_-_900px)_/_(350))] lg:mb-16 [&_>_span]:mt-4"
      />
      <NavigationButtons prevRoute="/resolver/court" nextRoute="/resolver/jurors" />
    </div>
  );
};

export default Category;
