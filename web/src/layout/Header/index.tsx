import React from "react";

import { StatusBanner } from "subgraph-status";

import useTheme from "hooks/useTheme";
import { cn } from "utils/cn";
import { getGraphqlUrl } from "utils/getGraphqlUrl";

import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";

const Header: React.FC = () => {
  const theme = useTheme();

  const SHOW_STATUS_BANNER = import.meta.env.REACT_APP_SHOW_STATUS_BANNER !== "false";

  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex w-full flex-wrap bg-klerosUIComponentsPrimaryPurple",
        "dark:bg-klerosUIComponentsLightBlue/[0.6509804] dark:backdrop-blur-[12px]"
      )}
    >
      {SHOW_STATUS_BANNER ? (
        <StatusBanner
          autoHide
          watcherOptions={{ threshold: 5000, interval: 60_000 }} // 5000 blocks threshold, 60 sec interval check
          theme={{
            colors: {
              main: theme.whiteBackground,
              primary: theme.primaryText,
              secondary: theme.secondaryText,
            },
          }}
          subgraphs={[
            { name: "Kleros Core", url: getGraphqlUrl(false) },
            { name: "Dispute Template Registry", url: getGraphqlUrl(true) },
          ]}
          className="sticky! [&_.status-text_h2]:m-0 [&_.status-text_h2]:leading-[24px]"
        />
      ) : null}
      <div
        className={cn(
          "w-full max-w-[1400px] m-[0_auto] p-[0_16px]",
          "lg:p-[0_calc(0px_+_(132_-_0)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]"
        )}
      >
        <DesktopHeader />
        <MobileHeader />
      </div>
    </div>
  );
};

export default Header;
