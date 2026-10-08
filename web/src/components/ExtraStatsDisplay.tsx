import React from "react";

import { cn } from "utils/cn";
import { isUndefined } from "utils/index";

import { StyledSkeleton } from "components/StyledSkeleton";

import { InternalLink } from "./InternalLink";

const Container = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(function Container(
  { className, ...props },
  ref
) {
  return <div {...props} ref={ref} className={cn("flex gap-2 justify-center items-center flex-wrap", className)} />;
});

export interface IExtraStatsDisplay {
  title: string;
  courtId?: string;
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  content?: React.ReactNode;
  text?: string;
}

const ExtraStatsDisplay: React.FC<IExtraStatsDisplay> = ({ title, courtId, text, content, icon: Icon, ...props }) => {
  return (
    <Container {...props}>
      <div className="flex gap-2">
        <div className="flex h-[14px] w-[14px] items-center justify-center [&_svg]:fill-klerosUIComponentsSecondaryPurple">
          {<Icon />}
        </div>
        <label>{title}:</label>
      </div>
      <div className="flex items-center gap-2 flex-wrap text-center">
        {content ? (
          content
        ) : (
          <InternalLink to={`/courts/${courtId?.toString()}`} className="font-semibold">
            {!isUndefined(text) ? text : <StyledSkeleton className="w-[100px]" />}
          </InternalLink>
        )}
      </div>
    </Container>
  );
};

export default ExtraStatsDisplay;
