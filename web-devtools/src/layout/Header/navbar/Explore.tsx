import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "utils/cn";

import { useOpenContext } from "../MobileHeader";

const links = [
  { to: "/", text: "Home" },
  { to: "/dispute-template", text: "Dispute Preview" },
  { to: "/ruler", text: "Configure Ruler" },
];

const Explore: React.FC = () => {
  const pathname = usePathname();
  const { toggleIsOpen } = useOpenContext();

  return (
    <div className="flex flex-col gap-0 lg:flex-row lg:gap-[calc(4px+(16-4)*(min(max(100vw,375px),1250px)-375px)/875)]">
      <h1 className="block lg:hidden">Explore</h1>
      {links.map(({ to, text }) => (
        <div className="flex min-h-8 items-center" key={text}>
          <Link
            className={cn(
              "text-base text-klerosUIComponentsPrimaryText no-underline lg:text-white",
              (to === "/" ? pathname === "/" : pathname.startsWith(to)) ? "font-semibold" : "font-normal"
            )}
            href={to}
            onClick={toggleIsOpen}
          >
            {text}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Explore;
