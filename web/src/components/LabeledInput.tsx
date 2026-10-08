import React from "react";

import { TextField } from "@kleros/ui-components-library";

import { cn } from "utils/cn";
import { isUndefined } from "utils/index";

const StyledField = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TextField>) => (
  <TextField {...props} className={cn("w-full [&>span]:mt-4", className)} />
);

type ILabeledInput = React.ComponentProps<typeof TextField>;

const LabeledInput: React.FC<ILabeledInput> = ({ label, inputProps, ...props }) => {
  const inputId = React.useId();
  const labelId = React.useId();
  return (
    <div className="w-full flex flex-col">
      {!isUndefined(label) ? (
        <label id={labelId} htmlFor={inputId} className="w-full mb-3">
          {label}
        </label>
      ) : null}
      <StyledField
        {...props}
        // react-aria only recognises the label through aria-labelledby, not htmlFor.
        aria-labelledby={isUndefined(label) ? undefined : labelId}
        inputProps={{ dir: "auto", ...inputProps, id: inputId }}
      />
    </div>
  );
};

export default LabeledInput;
