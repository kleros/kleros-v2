import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { cn } from "utils/cn";

import { useOpenContext } from "../MobileHeader";

interface IExplore {
  isMobileNavbar?: boolean;
}

const Explore: React.FC<IExplore> = ({ isMobileNavbar }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { toggleIsOpen } = useOpenContext();

  const navLinks = useMemo(
    () => [
      { to: "/cases/display/1/desc/all", text: t("navigation.cases") },
      { to: "/courts", text: t("navigation.courts") },
      { to: "/jurors/1/desc/all", text: t("navigation.jurors") },
      { to: "/get-pnk", text: t("navigation.get_pnk") },
    ],
    [t]
  );

  const currentSeg = useMemo(() => location.pathname.split("/")[1] || "", [location.pathname]);

  const getIsActive = (to: string) => to.split("?")[0].split("/")[1] === currentSeg;

  return (
    <div className="flex flex-col lg:flex-row">
      <h1 className="mb-2 block lg:hidden">{t("navigation.overview")}</h1>
      {navLinks.map(({ to, text }) => (
        <Link
          key={text}
          onClick={toggleIsOpen}
          to={to}
          className={cn(
            "flex items-center rounded-[7px] py-2 pr-2 pl-0 text-[16px] no-underline lg:px-2 lg:py-4",
            getIsActive(to)
              ? "text-klerosUIComponentsPrimaryText lg:text-white"
              : "text-klerosUIComponentsPrimaryText/[0.7294118] lg:text-white/[0.7294118]",
            isMobileNavbar && getIsActive(to) ? "font-semibold" : "font-normal",
            isMobileNavbar ? "hover:text-klerosUIComponentsPrimaryText!" : "hover:text-white!"
          )}
        >
          {text}
        </Link>
      ))}
    </div>
  );
};

export default Explore;
