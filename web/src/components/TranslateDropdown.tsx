import React from "react";

import { DropdownSelect } from "@kleros/ui-components-library";

import { SupportedLangs, useTranslate } from "context/TranslateProvider";

const Langs: { value: SupportedLangs; text: string }[] = [
  { text: "en", value: "en" },
  { text: "es", value: "es" },
  { text: "hi", value: "hi" },
  { text: "js", value: "ja" },
  { text: "zh", value: "zh" },
  { text: "ko", value: "ko" },
  { text: "fr", value: "fr" },
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
        //@ts-expect-error is string
        setLang(val);
      }}
    />
  );
};

export default TranslateDropdown;
