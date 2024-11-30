import React from "react";

import { DropdownSelect } from "@kleros/ui-components-library";

import { SupportedLangs, useTranslate } from "context/TranslateProvider";

const Langs: { value: SupportedLangs; text: string }[] = [
  { text: "English", value: "en" },
  { text: "Spanish", value: "es" },
  { text: "Hindi", value: "hi" },
  { text: "Japanese", value: "ja" },
  { text: "Chinese", value: "zh" },
  { text: "Korean", value: "ko" },
  { text: "French", value: "fr" },
];

const TranslateDropdown: React.FC = () => {
  const { setLang } = useTranslate();
  return (
    <DropdownSelect
      smallButton
      simpleButton
      items={Langs.map((range) => ({
        value: range.value,
        text: range.text,
      }))}
      defaultValue={"en"}
      callback={(val) => {
        setLang(val as SupportedLangs);
      }}
    />
  );
};

export default TranslateDropdown;
