import React from "react";

import { BigNumberField } from "@kleros/ui-components-library";

import { cn } from "utils/cn";

const EthAmountField = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof BigNumberField>) => (
  <BigNumberField
    {...props}
    className={cn(
      'w-full [&_input]:text-center [&_input]:[padding-inline:64px] [&_.input-wrapper::after]:[content:"ETH"] [&_.input-wrapper::after]:absolute [&_.input-wrapper::after]:right-[32px] [&_.input-wrapper::after]:top-[50%] [&_.input-wrapper::after]:[transform:translateY(-50%)] [&_.input-wrapper::after]:text-klerosUIComponentsPrimaryText [&_.input-wrapper::after]:pointer-events-none',
      className
    )}
  />
);

export default EthAmountField;
