import React, { useRef, useEffect } from "react";

import { useTranslation } from "react-i18next";

import { useNewDisputeContext } from "context/NewDisputeContext";

import MarkdownEditor from "components/MarkdownEditor";
import Header from "pages/Resolver/Header";

import NavigationButtons from "../NavigationButtons";

const Description: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, setDisputeData } = useNewDisputeContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWrite = (value: string) => {
    setDisputeData({ ...disputeData, description: value });
  };

  useEffect(() => {
    if (containerRef.current) {
      const editorElement = containerRef.current.querySelector('[role="region"]');
      if (editorElement) {
        const contentEditable = editorElement.querySelector('[contenteditable="true"]');
        if (contentEditable) {
          (contentEditable as HTMLElement).focus();
        }
      }
    }
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col items-center">
      <Header text={t("headers.describe_the_case")} />
      <div className="lg:w-[calc(442px_+_(700_-_442)_*_(min(max(100vw,_900px),_1250px)_-_900px)_/_(350))]">
        <MarkdownEditor
          value={disputeData.description}
          onChange={handleWrite}
          placeholder={t("forms.placeholders.bob_hired_alice")}
          showMessage={false}
        />
      </div>
      <NavigationButtons prevRoute="/resolver/title" nextRoute="/resolver/court" />
    </div>
  );
};

export default Description;
