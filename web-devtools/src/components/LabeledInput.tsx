import React from "react";

import { Checkbox, NumberField, TextField } from "@kleros/ui-components-library";

import { cn } from "utils/cn";

// React Aria resets uncommitted input when this object's identity changes.
const NUMBER_FORMAT_OPTIONS = { useGrouping: false };

type CheckboxInputProps = Omit<React.ComponentProps<typeof Checkbox>, "label"> & { inputType: "checkbox" };
type TextInputProps = Omit<React.ComponentProps<typeof TextField>, "label" | "type"> & {
  inputType?: "field";
  type?: "text";
};
type NumberInputProps = Omit<React.ComponentProps<typeof NumberField>, "label"> & {
  inputType?: "field";
  type: "number";
};
type LabeledInputProps = { label: string } & (CheckboxInputProps | TextInputProps | NumberInputProps);

const LabeledInput: React.FC<LabeledInputProps> = (props) => {
  const isField = props.inputType !== "checkbox";
  let input: React.ReactNode;
  if (props.inputType === "checkbox") {
    const { label, inputType: inputTypeIgnored, ...checkboxProps } = props;
    input = <Checkbox {...checkboxProps} label="" aria-label={label} className="size-6 p-0 [&>div]:top-0" />;
  } else if (props.type === "number") {
    const { label, inputType: inputTypeIgnored, type: typeIgnored, ...numberProps } = props;
    input = (
      <NumberField
        formatOptions={NUMBER_FORMAT_OPTIONS}
        {...numberProps}
        aria-label={label}
        inputProps={{ className: "[font-family:Arial] text-[13.3333px] [line-height:normal]" }}
        className="w-full [&_input]:border-0 [&_input]:pl-[calc(50%+8px)]"
      />
    );
  } else {
    const { label, inputType: inputTypeIgnored, ...textProps } = props;
    input = (
      <TextField
        {...textProps}
        aria-label={label}
        inputProps={{ className: "[font-family:Arial] text-[13.3333px] [line-height:normal]" }}
        className="w-full [&_input]:border-0 [&_input]:pl-[calc(50%+8px)]"
      />
    );
  }

  return (
    <div className="relative flex h-[46px] w-[280px] max-w-[280px] items-center">
      <span
        className={cn(
          "pointer-events-none z-[1] flex h-full flex-1 items-center justify-center",
          "rounded-l-[3px] border border-klerosUIComponentsStroke bg-klerosUIComponentsLightBackground",
          "text-sm text-klerosUIComponentsPrimaryText",
          isField && "absolute top-[0.5px] left-[0.5px] h-[45px] w-1/2"
        )}
      >
        {props.label}
      </span>
      <div
        className={cn(
          "relative flex h-full flex-1 items-center justify-center rounded-r-[3px]",
          "border border-l-0 border-klerosUIComponentsStroke bg-klerosUIComponentsWhiteBackground",
          isField && "z-0 w-full rounded-[3px]"
        )}
      >
        {input}
      </div>
    </div>
  );
};

export default LabeledInput;
